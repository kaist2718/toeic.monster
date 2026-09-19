#!/usr/bin/env node
/**
 * toeic.monster 콘텐츠 밀도 감사 (보고용)
 *
 * 감사 3종(audit:content · audit:text · audit:site)은 "형식과 표기"를 봅니다.
 * 이 도구는 그 위에 **"학습 자료로 충분한 분량인가"** 를 눈으로 확인할 수 있게 모아 보여 줍니다.
 *
 *   1) 교재(문법·회화) 과별 밀도 — 도입·개념·예문·표·note·실수·연습
 *   2) 어휘·숙어 예문의 길이 분포 (짧은 예문은 문맥 학습에 약합니다)
 *   3) 확장 콘텐츠 총량 (Part 1~7 · 드릴 · 템플릿 · 가이드)
 *   4) 페이지 분량 — 허브·과 페이지·가이드가 "제목만 있는" 상태인지
 *   5) LC 커버리지 — 실제 시험 문항 수 대비 비율
 *
 * 실행:  node tools/audit-density.mjs
 *        node tools/audit-density.mjs --strict   (기준 미달이면 종료 코드 1)
 *
 * 기준(BASELINE)은 2026-09-19 문법 교재 보강 이후의 수준을 "바닥"으로 잡았습니다.
 * 콘텐츠를 늘리면 기준도 함께 올려 주세요 — 기준이 낮으면 회귀를 놓칩니다.
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { readAppSource } from "./app-source.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STRICT = process.argv.includes("--strict");

/** 단계별 교재 데이터 — build-pages.mjs 와 같은 목록. */
const BOOK_FILES = [
  "data/grammar-basic.js",
  "data/grammar-intermediate.js",
  "data/grammar-advanced.js",
  "data/conversation-basic.js",
  "data/conversation-intermediate.js",
  "data/conversation-advanced.js",
];

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ------------------------------------------------------------------ */
/* 1. 데이터 로드                                                      */
/* ------------------------------------------------------------------ */

function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (let i = 1; i <= 30; i++) {
    const f = `data/unit${String(i).padStart(2, "0")}.js`;
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  for (const f of ["data/idioms.js", "data/extra.js", ...BOOK_FILES]) {
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  return {
    vocab: sandbox.window.VOCAB_UNITS || {},
    idioms: sandbox.window.VOCAB_IDIOMS || [],
    extra: sandbox.window.TOEIC_EXTRA || {},
    grammar: sandbox.window.GRAMMAR_BOOKS || [],
    conversation: sandbox.window.CONVERSATION_BOOKS || [],
  };
}

const { vocab, idioms, extra, grammar, conversation } = loadData();

/* ------------------------------------------------------------------ */
/* 2. 기준 (2026-09-19 문법 교재 보강 수준)                             */
/* ------------------------------------------------------------------ */

const BASELINE = {
  intro: 1,        // 과마다 도입 문단(왜 배우는지)
  points: 5,       // 과당 개념
  examples: 5,     // 과당 영어 예문(TTS 대상)
  tableRows: 8,    // 과당 형태 표 행
  notes: 4,        // 과당 note
  mistakes: 4,     // 과당 흔한 실수
  practice: 6,     // 과당 연습 문항
  exampleWords: 0.1, // 어휘 예문 중 5단어 이하 비율 상한
  hubChars: 2500,  // 허브 페이지 본문 글자 수
  chapterChars: 3500, // 교재 과 페이지 본문 글자 수
  guideChars: 2500, // 가이드 본문 글자 수
  lcCoverage: 0.7, // LC 파트별 실제 시험 문항 대비 비율
};

const problems = [];
const warn = (msg) => problems.push(msg);

/* ------------------------------------------------------------------ */
/* 3. 교재 밀도                                                        */
/* ------------------------------------------------------------------ */

function bookStats(book) {
  const s = { intro: 0, points: 0, examples: 0, tableRows: 0, notes: 0, mistakes: 0, practice: 0 };
  for (const c of book.chapters || []) {
    if (c.intro) s.intro++;
    s.points += (c.points || []).length;
    s.mistakes += (c.mistakes || []).length;
    s.practice += (c.practice || []).length;
    for (const p of c.points || []) {
      s.examples += (p.examples || []).length;
      if (p.note) s.notes++;
      if (p.table) s.tableRows += (p.table.rows || []).length;
    }
  }
  return s;
}

console.log("📐 콘텐츠 밀도 감사 (보고용)\n");

console.log("── 교재 밀도 (과당 평균) ─────────────────────────────");
const HEAD = ["교재", "도입", "개념", "예문", "표행", "note", "실수", "연습"];
const bookRows = [];
for (const [kind, books] of [["문법", grammar], ["회화", conversation]]) {
  for (const b of books) {
    const n = b.chapters.length;
    const s = bookStats(b);
    const per = (v) => (v / n).toFixed(1);
    bookRows.push([
      `${kind} ${b.level}`,
      `${s.intro}/${n}`,
      per(s.points),
      per(s.examples),
      per(s.tableRows),
      per(s.notes),
      per(s.mistakes),
      per(s.practice),
    ]);
    const label = `${kind} ${b.level}`;
    if (s.intro < n) warn(`${label}: 도입(intro)이 없는 과가 ${n - s.intro}개입니다.`);
    const checks = [
      ["개념", s.points / n, BASELINE.points],
      ["예문", s.examples / n, BASELINE.examples],
      ["표 행", s.tableRows / n, BASELINE.tableRows],
      ["note", s.notes / n, BASELINE.notes],
      ["실수", s.mistakes / n, BASELINE.mistakes],
      ["연습", s.practice / n, BASELINE.practice],
    ];
    for (const [name, value, min] of checks) {
      if (value < min - 1e-9) {
        warn(`${label}: 과당 ${name} ${value.toFixed(1)} (기준 ${min} 이상)`);
      }
    }
  }
}
const widths = HEAD.map((h, i) => Math.max(strWidth(h), ...bookRows.map((r) => strWidth(r[i]))));
const line = (cells) => "  " + cells.map((c, i) => pad(c, widths[i])).join(" │ ");
console.log(line(HEAD));
console.log("  " + widths.map((w) => "─".repeat(w)).join("─┼─"));
for (const r of bookRows) console.log(line(r));

/** 한글·영문이 섞인 문자열의 표시 폭(한글 2칸). */
function strWidth(s) {
  return [...String(s)].reduce((n, ch) => n + (/[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3]/.test(ch) ? 2 : 1), 0);
}
function pad(s, w) {
  const gap = w - strWidth(s);
  return String(s) + " ".repeat(Math.max(0, gap));
}

/* ------------------------------------------------------------------ */
/* 4. 예문 길이 (어휘·숙어)                                            */
/* ------------------------------------------------------------------ */

console.log("\n── 예문 길이 ─────────────────────────────────────────");
const words = Object.values(vocab).flat();
const wordLen = words.map((w) => String(w[4] || "").split(/\s+/).filter(Boolean).length);
const short = wordLen.filter((n) => n <= 5).length;
const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
console.log(`  어휘 ${words.length}개 · 예문 평균 ${avg(wordLen).toFixed(1)}단어 · 5단어 이하 ${short}개 (${((short / words.length) * 100).toFixed(1)}%)`);
if (short / words.length > BASELINE.exampleWords) {
  warn(`어휘 예문 중 5단어 이하가 ${((short / words.length) * 100).toFixed(1)}% (기준 ${BASELINE.exampleWords * 100}% 이하) — 문맥 학습이 약합니다.`);
}
const idiomLen = idioms.map((i) => String(i[2] || "").split(/\s+/).filter(Boolean).length);
console.log(`  숙어 ${idioms.length}개 · 예문 평균 ${avg(idiomLen).toFixed(1)}단어`);

/* ------------------------------------------------------------------ */
/* 5. 확장 콘텐츠 총량                                                 */
/* ------------------------------------------------------------------ */

console.log("\n── 확장 콘텐츠 ───────────────────────────────────────");
const counts = Object.entries(extra)
  .filter(([, v]) => Array.isArray(v))
  .map(([k, v]) => `${k} ${v.length}`)
  .join(" · ");
console.log("  " + counts);
const p7 = extra.part7 || [];
const p7Kinds = { 이중: 0, 삼중: 0, 기타: 0 };
let p7Qs = 0;
for (const s of p7) {
  const n = (s.passages || []).length;
  if (n === 2) p7Kinds.이중++;
  else if (n === 3) p7Kinds.삼중++;
  else p7Kinds.기타++;
  p7Qs += (s.qs || []).length;
}
console.log(`  Part 7 세트 ${p7.length} (이중 ${p7Kinds.이중} · 삼중 ${p7Kinds.삼중}) · 문항 ${p7Qs}`);
const blanks = (extra.part6 || []).reduce((n, s) => n + (s.blanks || []).length, 0);
console.log(`  Part 6 지문 ${(extra.part6 || []).length} · 공란 ${blanks}`);

/* ------------------------------------------------------------------ */
/* 6. 페이지 분량                                                      */
/* ------------------------------------------------------------------ */

const visibleText = (src) =>
  String(src)
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

const pages = [];
for (const f of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) pages.push(f);
for (const dir of ["units", "guides", "grammar", "conversation"]) {
  for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".html"))) {
    pages.push(`${dir}/${f}`);
  }
}
const noindex = new Set(["404.html", "privacy.html", "terms.html"]);
const sizes = pages
  .filter((p) => !noindex.has(p))
  .map((p) => ({ p, n: visibleText(read(p)) }))
  .sort((a, b) => a.n - b.n);

console.log("\n── 페이지 분량 (본문 글자 수) ─────────────────────────");
const groups = {};
for (const { p, n } of sizes) {
  const key = p.includes("/") ? p.split("/")[0] : "(root)";
  (groups[key] = groups[key] || []).push({ p, n });
}
for (const [key, list] of Object.entries(groups)) {
  const ns = list.map((x) => x.n).sort((a, b) => a - b);
  console.log(`  ${pad(key, 14)} 페이지 ${String(list.length).padStart(3)} · 중앙값 ${String(ns[ns.length >> 1]).padStart(5)} · 최소 ${String(ns[0]).padStart(5)} · 최대 ${String(ns[ns.length - 1]).padStart(6)}`);
}

const hubs = (loc) => /^(?:index\.html|units\/index\.html|guides\/index\.html|grammar\/index\.html|conversation\/index\.html)$/.test(loc);
const chapterPage = (loc) => /^(?:grammar|conversation)\/[a-z-]+-\d\d\.html$/.test(loc);
const guidePage = (loc) => /^guides\/.+\.html$/.test(loc) && !hubs(loc);

const thinHubs = sizes.filter((x) => hubs(x.p) && x.n < BASELINE.hubChars);
const thinChapters = sizes.filter((x) => chapterPage(x.p) && x.n < BASELINE.chapterChars);
const thinGuides = sizes.filter((x) => guidePage(x.p) && x.n < BASELINE.guideChars);

const listThin = (title, list, min) => {
  if (!list.length) return;
  console.log(`\n  ${title} (기준 ${min}자 미만 ${list.length}개)`);
  for (const x of list.slice(0, 12)) console.log(`    - ${pad(x.p, 40)} ${x.n}자`);
  if (list.length > 12) console.log(`    … 외 ${list.length - 12}개`);
  warn(`${title}: ${list.length}개 페이지가 기준 ${min}자 미만입니다.`);
};
listThin("허브 페이지", thinHubs, BASELINE.hubChars);
listThin("교재 과 페이지", thinChapters, BASELINE.chapterChars);
listThin("가이드", thinGuides, BASELINE.guideChars);

/* ------------------------------------------------------------------ */
/* 7. LC 커버리지                                                      */
/* ------------------------------------------------------------------ */

// docs/content-roadmap.md 7절과 audit-content.mjs 가 쓰는 같은 실제 구성입니다.
const REAL = { part1: 6, part2: 25, part3: 39, part4: 30 };

// Part 3·4 세트는 앱 소스의 PART34_SETS 에 있습니다 — audit-content.mjs 와 같은 방식으로 셉니다.
const { code } = readAppSource();
const part34Sets = (() => {
  const start = code.indexOf("var PART34_SETS = [");
  if (start < 0) return [];
  const end = code.indexOf("\n  ];", start);
  const block = code.slice(start, end < 0 ? code.length : end);
  return block.split(/\{\s*title:/).slice(1).map((chunk) => ({
    kind: (chunk.match(/kind: "([^"]+)"/) || [])[1] || "",
    questions: (chunk.match(/\bq: "/g) || []).length,
  }));
})();
const lcCount = (part) => {
  if (part === "part1") return (extra.part1 || []).length;
  if (part === "part2") return (extra.traps || []).length;
  const kind = part === "part3" ? "대화" : "담화";
  return part34Sets.filter((s) => s.kind === kind).reduce((n, s) => n + s.questions, 0);
};

console.log("\n── LC 커버리지 (실제 시험 문항 대비) ──────────────────");
for (const [part, real] of Object.entries(REAL)) {
  const have = lcCount(part);
  const pct = (have / real) * 100;
  const flag = pct / 100 < BASELINE.lcCoverage ? " ← 기준 미달" : "";
  console.log(`  ${pad(part, 6)} ${String(have).padStart(3)}/${String(real).padStart(2)} (${pct.toFixed(0)}%)${flag}`);
  if (pct / 100 < BASELINE.lcCoverage) {
    warn(`${part}: 실제 시험 ${real}문항 대비 ${pct.toFixed(0)}% (기준 ${BASELINE.lcCoverage * 100}% 이상)`);
  }
}

/* ------------------------------------------------------------------ */
/* 8. 요약                                                             */
/* ------------------------------------------------------------------ */

console.log("\n── 요약 ─────────────────────────────────────────────");
if (!problems.length) {
  console.log("  ✅ 모든 항목이 기준 이상입니다.");
  process.exit(0);
}
const byKind = new Map();
for (const p of problems) {
  const key = p.split(":")[0];
  byKind.set(key, (byKind.get(key) || 0) + 1);
}
console.log(`  ⚠️  보강 후보 ${problems.length}건 (${byKind.size}종)`);
for (const [key, n] of [...byKind.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`    · ${key} — ${n}건`);
}
console.log("\n  ── 항목별 ──");
for (const p of problems) console.log(`    - ${p}`);
console.log("\n  자세한 점검 방법과 우선순위는 docs/content-density-audit.md 를 보세요.");
process.exit(STRICT ? 1 : 0);
