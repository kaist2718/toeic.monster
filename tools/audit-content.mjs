#!/usr/bin/env node
/**
 * toeic.monster 콘텐츠 감사(중복·표기 일관성) 도구
 *
 * 콘텐츠를 추가한 뒤 아래를 자동 점검합니다.
 *   1) data/*.js 어휘·숙어·확장 콘텐츠의 형식과 중복
 *   2) 앱 소스(index.html + assets/app.js) 안의 학습 배열(콜로케이션·혼동어휘·문법 팁 등)과
 *      문법 교재(grammar)의 중복·형식
 *   3) 정답이 보기에 없는 문항(오타성 버그)
 *   4) data/extra.js 와 index.html 배열 사이의 중복 항목
 *   5) 사이트에 표기한 어휘 총량과 실제 데이터 수 일치 여부
 *   6) LC 파트별 커버리지(실제 시험 문항 수 대비 50% 이상인지 — docs/content-roadmap.md 7절)
 *
 * 실행:  node tools/audit-content.mjs
 * 종료 코드: 문제가 있으면 1, 없으면 0 (CI·커밋 전 점검용)
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { readAppSource } from "./app-source.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** 단계별 문법 교재 데이터 파일 — build-pages.mjs 와 같은 목록을 씁니다. */
const GRAMMAR_FILES = ["data/grammar-basic.js", "data/grammar-intermediate.js", "data/grammar-advanced.js"];

/** 단계별 회화 교재 데이터 파일 — build-pages.mjs 와 같은 목록을 씁니다. */
const CONVERSATION_FILES = [
  "data/conversation-basic.js",
  "data/conversation-intermediate.js",
  "data/conversation-advanced.js",
];
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);

/* ------------------------------------------------------------------ */
/* 1. data/*.js 읽기 (build-pages.mjs 와 동일한 방식)                  */
/* ------------------------------------------------------------------ */

function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (let i = 1; i <= 30; i++) {
    const file = `data/unit${String(i).padStart(2, "0")}.js`;
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  }
  for (const file of ["data/idioms.js", "data/extra.js", ...GRAMMAR_FILES, ...CONVERSATION_FILES]) {
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  }
  return {
    vocab: sandbox.window.VOCAB_UNITS || {},
    idioms: sandbox.window.VOCAB_IDIOMS || [],
    extra: sandbox.window.TOEIC_EXTRA || {},
    grammar: sandbox.window.GRAMMAR_BOOKS || [],
    conversation: sandbox.window.CONVERSATION_BOOKS || [],
  };
}

/* ------------------------------------------------------------------ */
/* 2. 앱 소스(index.html + assets/app.js) 안의 `var NAME = [...]` 추출  */
/* ------------------------------------------------------------------ */

// 앱 배열은 2026-09-18 부터 index.html 이 아니라 assets/app.js 에 있습니다
// (docs/app-split-plan.md 2단계). 그래서 마크업+앱 코드를 이어 붙인 문자열에서 찾습니다.
const { html, code } = readAppSource();

/** 문자열 리터럴을 건너뛰며 괄호 균형이 맞는 지점까지 잘라낸다. */
function sliceBalanced(src, openIdx) {
  const open = src[openIdx];
  const close = open === "[" ? "]" : open === "{" ? "}" : ")";
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) return src.slice(openIdx, i + 1);
  }
  return null;
}

function extractArray(name) {
  const marker = `var ${name} = `;
  const at = code.indexOf(marker);
  if (at === -1) return null;
  const start = code.indexOf("[", at);
  if (start === -1) return null;
  const src = sliceBalanced(code, start);
  if (!src) return null;
  try {
    return vm.runInNewContext(src, {}, { timeout: 5000 });
  } catch (e) {
    fail(`index.html: ${name} 배열을 평가하지 못했습니다 — ${e.message}`);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* 3. 공통 유틸                                                        */
/* ------------------------------------------------------------------ */

const dupes = (list) => {
  const seen = new Set();
  const dup = new Set();
  for (const x of list) {
    if (!x) continue;
    if (seen.has(x)) dup.add(x);
    seen.add(x);
  }
  return [...dup];
};

/** 배열에서 대표 키(중복 판단 기준)를 뽑는다. */
function repKey(x) {
  if (x == null) return null;
  if (typeof x !== "object") return String(x);
  if (Array.isArray(x)) return x[0] ? String(x[0]) : null;
  // "type"처럼 여러 항목이 공유하는 값보다, 항목을 유일하게 구분하는 값을 먼저 본다.
  for (const k of ["pair", "phrase", "word", "root", "slug", "part", "ko", "prompt", "title", "cat", "scene", "q", "audio", "day", "a", "type"]) {
    if (typeof x[k] === "string" && x[k]) return x[k];
  }
  return null;
}

/** 정답이 보기 안에 있는지 확인한다. */
function checkAnswerInOptions(label, arr) {
  if (!Array.isArray(arr)) return;
  arr.forEach((q, i) => {
    if (!q || !Array.isArray(q.opts)) return;
    if (q.a != null && q.opts.indexOf(q.a) === -1) {
      fail(`${label}[${i}] 정답이 보기에 없습니다: "${q.a}" (보기: ${q.opts.join(" / ")})`);
    }
  });
}

/* ------------------------------------------------------------------ */
/* 4. 점검                                                             */
/* ------------------------------------------------------------------ */

const { vocab, idioms, extra, grammar, conversation } = loadData();

// 4-1. 유닛 어휘
const unitIds = Object.keys(vocab).map(Number).sort((a, b) => a - b);
let totalWords = 0;
const allWords = [];
for (const id of unitIds) {
  const words = vocab[id];
  totalWords += words.length;
  const bad = words.filter((w) => !Array.isArray(w) || w.length < 6);
  if (bad.length) fail(`data/unit${String(id).padStart(2, "0")}.js: 형식이 짧은 항목 ${bad.length}개`);
  const d = dupes(words.map((w) => w[0]));
  if (d.length) fail(`data/unit${String(id).padStart(2, "0")}.js: 중복 표제어 — ${d.join(", ")}`);
  words.forEach((w) => allWords.push(w[0]));
}
const crossUnit = dupes(allWords);
if (crossUnit.length) notes.push(`유닛 간 중복 표제어 ${crossUnit.length}개 (정상일 수 있음): ${crossUnit.slice(0, 12).join(", ")}${crossUnit.length > 12 ? " …" : ""}`);

// 4-2. 숙어
checkAnswerInOptions("idioms", idioms);
const idiomDup = dupes(idioms.map((x) => x[0]));
if (idiomDup.length) fail(`data/idioms.js: 중복 표현 — ${idiomDup.join(", ")}`);
if (idioms.some((x) => !Array.isArray(x) || x.length !== 4)) fail("data/idioms.js: [표현, 뜻, 예문, 해석] 4항목이 아닌 데이터가 있습니다.");

// 4-3. 확장 콘텐츠
for (const [key, arr] of Object.entries(extra)) {
  if (!Array.isArray(arr)) continue;
  const d = dupes(arr.map(repKey));
  if (d.length) fail(`data/extra.js ${key}: 중복 항목 — ${d.join(", ")}`);
}
checkAnswerInOptions("extra.part1", extra.part1);
checkAnswerInOptions("extra.numbers", extra.numbers);
checkAnswerInOptions("extra.paraphrase", extra.paraphrase);
checkAnswerInOptions("extra.transitions", extra.transitions);
checkAnswerInOptions("extra.prepositions", extra.prepositions);
(extra.part6 || []).forEach((s, i) => {
  if (!Array.isArray(s.blanks) || s.blanks.length !== 4) fail(`extra.part6[${i}] (${s.title}): 빈칸이 4개가 아닙니다.`);
  (s.blanks || []).forEach((b) => {
    if (b.opts.indexOf(b.a) === -1) fail(`extra.part6[${i}] 빈칸 ${b.n}: 정답이 보기에 없습니다 — ${b.a}`);
  });
});
(extra.part7 || []).forEach((s, i) => {
  if (!Array.isArray(s.passages) || s.passages.length < 2) fail(`extra.part7[${i}] (${s.title}): 지문이 2개 미만입니다.`);
  (s.qs || []).forEach((q, qi) => {
    if (q.opts.indexOf(q.a) === -1) fail(`extra.part7[${i}] 문항 ${qi + 1}: 정답이 보기에 없습니다 — ${q.a}`);
  });
});
(extra.situations || []).forEach((s, i) => {
  if (!Array.isArray(s.lines) || s.lines.length < 4) fail(`extra.situations[${i}] (${s.title}): 대화가 4줄 미만입니다.`);
});
// 4-3-0. 빈도순 기출 어휘 — 보강은 all-or-nothing 입니다.
//   미보강(3필드) 또는 보강(8필드) 중 하나여야 하고, 일부만 보강된 상태는 실패로 봅니다.
//   앞 3필드는 사이트·앱이 쓰고, 뒤 5필드는 쇼츠·예문용 보강입니다 (docs/frequency-shorts-plan.md §2).
const freq = extra.frequency || [];
const freqLens = [...new Set(freq.map((w) => (Array.isArray(w) ? w.length : 0)))].sort((a, b) => a - b);
if (freqLens.length > 1 || (freqLens.length === 1 && freqLens[0] !== 3 && freqLens[0] !== 8)) {
  fail(`data/extra.js frequency: 행 길이가 섞였거나 형식이 다릅니다 — ${freqLens.join(", ")}`);
}
if (freqLens[0] === 8) {
  freq.forEach((w, i) => {
    if (w.slice(3).some((x) => !x || !String(x).trim())) {
      fail(`extra.frequency[${i}] (${w[0]}): 보강 필드에 빈 값이 있습니다.`);
    }
    const ex = String(w[5]);
    const stem = String(w[0]).toLowerCase().slice(0, 4);
    if (stem.length >= 3 && !ex.toLowerCase().includes(stem)) {
      fail(`extra.frequency[${i}] (${w[0]}): 예문에 표제어가 없습니다 — ${ex}`);
    }
    if (ex.split(/\s+/).filter(Boolean).length < 6) {
      fail(`extra.frequency[${i}] (${w[0]}): 예문이 6단어 미만입니다 — ${ex}`);
    }
  });
}
(extra.guides || []).forEach((g) => {
  if (!g.slug || !g.title || !Array.isArray(g.sections)) fail(`extra.guides: 형식이 불완전한 가이드 — ${g.slug || g.title}`);
});

// 4-3-1. 단계별 교재(문법·회화)
// 두 시리즈가 **같은 데이터 구조**를 씁니다(summary → points → mistakes → practice).
// 그래서 검증 규칙도 한 함수로 묶어, 한쪽만 느슨해지는 일이 없게 합니다.
function checkBooks(books, fileLabel, kindLabel) {
  const ids = dupes(books.map((b) => b && b.id));
  if (ids.length) fail(`${fileLabel}: 교재 id가 중복입니다 — ${ids.join(", ")}`);
  const levels = dupes(books.map((b) => b && b.level));
  if (levels.length) fail(`${fileLabel}: 단계 이름이 중복입니다 — ${levels.join(", ")}`);
  // 과 제목은 한 시리즈 안에서만 겹치면 안 됩니다(문법과 회화는 다른 교재라 무관).
  const allChapterTitles = [];
  books.forEach((b) => {
    const where = `${fileLabel}[${b && b.id ? b.id : "?"}]`;
    if (!b || !b.id || !b.title || !Array.isArray(b.chapters) || !b.chapters.length) {
      fail(`${where}: 교재 형식이 불완전합니다(id·title·chapters 필수).`);
      return;
    }
    if (b.desc.length < 40 || b.desc.length > 170) {
      fail(`${where}: desc 길이가 부적절합니다(${b.desc.length}자, 권장 40~170).`);
    }
    // 과 번호는 1부터 빠짐없이 이어져야 목차·앵커가 어긋나지 않습니다.
    const nos = b.chapters.map((c) => c.no);
    const expected = b.chapters.map((_, i) => i + 1);
    if (nos.join(",") !== expected.join(",")) {
      fail(`${where}: 과 번호가 1부터 순서대로가 아닙니다 — ${nos.join(", ")}`);
    }
    b.chapters.forEach((c, ci) => {
      const cw = `${where} ${c.no}과`;
      if (!c.title || !c.summary || !Array.isArray(c.points) || !c.points.length) {
        fail(`${cw}: title·summary·points 가 필요합니다.`);
        return;
      }
      if (c.no !== ci + 1) fail(`${cw}: 과 번호와 순서가 다릅니다(위치 ${ci + 1}).`);
      allChapterTitles.push(c.title);
      c.points.forEach((p, pi) => {
        if (!p.h || !p.body) fail(`${cw} ${kindLabel} ${pi + 1}: h·body 가 필요합니다.`);
        if (p.table && (!Array.isArray(p.table.head) || !Array.isArray(p.table.rows))) {
          fail(`${cw} ${kindLabel} ${pi + 1}: table 형식이 잘못되었습니다.`);
        }
        if (p.table && p.table.rows.some((r) => !Array.isArray(r) || r.length !== p.table.head.length)) {
          fail(`${cw} ${kindLabel} ${pi + 1}: 표의 열 수가 머리행과 다릅니다.`);
        }
        if (p.table && p.table.head.some((h) => !h)) {
          fail(`${cw} ${kindLabel} ${pi + 1}: 표의 머리행에 빈 칸이 있습니다.`);
        }
        (p.examples || []).forEach((e, ei) => {
          if (!e.en || !e.ko) fail(`${cw} ${kindLabel} ${pi + 1} 예문 ${ei + 1}: en·ko 가 필요합니다.`);
        });
        // 개념 하나에 표도 예문도 없으면 읽을 거리가 없습니다.
        if (!p.table && !(p.examples || []).length && !p.note) {
          fail(`${cw} ${kindLabel} ${pi + 1}: 표·예문·note 가 모두 없습니다.`);
        }
      });
      if (!Array.isArray(c.mistakes) || !c.mistakes.length) {
        fail(`${cw}: mistakes(흔한 실수)가 없습니다.`);
      }
      if (!Array.isArray(c.practice) || !c.practice.length) {
        fail(`${cw}: 연습 문제가 없습니다.`);
      }
      checkAnswerInOptions(`${cw} 연습`, c.practice);
      (c.practice || []).forEach((q, qi) => {
        if (!q.q || !q.why) fail(`${cw} 연습 ${qi + 1}: 문제·해설이 필요합니다.`);
        if (!Array.isArray(q.opts) || q.opts.length < 2) fail(`${cw} 연습 ${qi + 1}: 보기가 2개 미만입니다.`);
        if (dupes(q.opts || []).length) fail(`${cw} 연습 ${qi + 1}: 보기에 중복 항목이 있습니다.`);
      });
    });
  });
  const crossChapter = dupes(allChapterTitles);
  if (crossChapter.length) fail(`${fileLabel}: 과 제목이 중복입니다 — ${crossChapter.join(", ")}`);
}

checkBooks(grammar, "data/grammar-*.js", "개념");
checkBooks(conversation, "data/conversation-*.js", "표현");

// 4-4. index.html 배열
const ARRAYS = [
  "GRAMMAR_TIPS", "CONFUSABLES", "WORD_PARTS", "COLLOCATIONS", "CONTEXT_VOCAB", "LC_TRAINING",
  "WORD_FAMILIES", "WF_QUESTIONS", "MINIMAL_PAIRS", "MNEMONICS", "BIZ_TEMPLATES", "DIALOGUES",
  "RELATIONS", "READING_MINI", "DOUBLE_READING", "SPEAKING_PROMPTS", "WRITING_PROMPTS",
  "SHADOWING_SENTENCES", "QUOTES", "CHEERS",
];
const inHtml = {};
for (const name of ARRAYS) {
  const arr = extractArray(name);
  if (!arr) { fail(`index.html: ${name} 배열을 찾지 못했습니다.`); continue; }
  inHtml[name] = arr;
  const d = dupes(arr.map(repKey));
  if (d.length) fail(`index.html ${name}: 중복 항목 — ${d.join(", ")}`);
}
checkAnswerInOptions("index.html WF_QUESTIONS", inHtml.WF_QUESTIONS && inHtml.WF_QUESTIONS.map((q) => ({ a: q.a, opts: q.opts })));
checkAnswerInOptions("index.html READING_MINI", inHtml.READING_MINI && inHtml.READING_MINI.map((q) => ({ a: q.a, opts: q.opts })));

const partBank = (() => {
  const at = code.indexOf("var PART_BANK = ");
  if (at === -1) return null;
  const src = sliceBalanced(code, code.indexOf("{", at));
  try { return vm.runInNewContext("(" + src + ")", {}, { timeout: 5000 }); } catch (e) { fail("PART_BANK 평가 실패 — " + e.message); return null; }
})();
if (partBank) {
  for (const [part, list] of Object.entries(partBank)) {
    checkAnswerInOptions(`PART_BANK.${part}`, list);
    const d = dupes(list.map((q) => q.q));
    if (d.length) fail(`index.html PART_BANK.${part}: 중복 문항 — ${d.length}건`);
  }
}

// 4-5. data/extra.js ↔ index.html 교차 중복
if (inHtml.CONTEXT_VOCAB && extra.paraphrase) {
  const ctxAnswers = new Set(inHtml.CONTEXT_VOCAB.map((c) => c.prompt));
  const overlap = extra.paraphrase.filter((p) => ctxAnswers.has(p.prompt));
  if (overlap.length) notes.push(`문맥 어휘와 동의어 치환에 같은 문항 ${overlap.length}건`);
}
if (inHtml.COLLOCATIONS) {
  const phrases = new Set(inHtml.COLLOCATIONS.map((c) => c.phrase));
  const idiomWords = idioms.filter((it) => phrases.has(it[0]));
  if (idiomWords.length) notes.push(`콜로케이션과 숙어에 겹치는 표현 ${idiomWords.length}건: ${idiomWords.map((x) => x[0]).join(", ")}`);
}

// 4-6. 표기 일관성 — 사이트에 적은 어휘 총량 vs 실제
const declared = [...html.matchAll(/TOEIC 필수 어휘 ([\d,]+)개/g)].map((m) => Number(m[1].replace(/,/g, "")));
const uniqDeclared = [...new Set(declared)];
if (uniqDeclared.length && !uniqDeclared.some((n) => n === totalWords)) {
  fail(`index.html 표기 어휘 수(${uniqDeclared.join(", ")})와 실제 데이터(${totalWords})가 다릅니다.`);
}
const unitCountDeclared = [...html.matchAll(/주제별 유닛 (\d+)개/g)].map((m) => Number(m[1]));
if (unitCountDeclared.length && !unitCountDeclared.every((n) => n === unitIds.length)) {
  fail(`index.html 유닛 수 표기(${unitCountDeclared.join(", ")})와 실제(${unitIds.length})가 다릅니다.`);
}
const unitPage = path.join(ROOT, "units", "index.html");
if (fs.existsSync(unitPage)) {
  const hub = fs.readFileSync(unitPage, "utf8");
  const hubDeclared = [...hub.matchAll(/([\d,]+)개를 주제별/g)].map((m) => Number(m[1].replace(/,/g, "")));
  if (hubDeclared.length && !hubDeclared.some((n) => n === totalWords)) {
    fail(`units/index.html 표기 어휘 수(${hubDeclared.join(", ")})와 실제(${totalWords})가 다릅니다.`);
  }
}

/* ------------------------------------------------------------------ */
/* 4-2. LC 파트별 커버리지 (실제 시험 문항 수 대비)                     */
/* ------------------------------------------------------------------ */

// docs/content-roadmap.md 7절 지표 — "LC 파트별 50% 이상".
// 실제 구성: Part 1 6문항 · Part 2 25문항 · Part 3 39문항 · Part 4 30문항.
// 여기서 세는 것은 파트별 **보유 문항**이고, 50% 아래로 떨어지면 실패로 알립니다.
const LC_REAL = { part1: 6, part2: 25, part3: 39, part4: 30 };

// Part 3·4 세트는 앱 소스의 PART34_SETS 에 있습니다(세트마다 kind · qs).
// 파일을 통째로 실행하지 않고 블록만 잘라 세트/문항 수를 셉니다(실행은 무거운 작업이라 부담).
const part34Block = (() => {
  const start = code.indexOf("var PART34_SETS = [");
  if (start < 0) return "";
  const end = code.indexOf("\n  ];", start);
  return code.slice(start, end < 0 ? code.length : end);
})();
const part34Sets = part34Block.split(/\{\s*title:/).slice(1).map((chunk) => ({
  kind: (chunk.match(/kind: "([^"]+)"/) || [])[1] || "",
  // qs 배열 안의 문항(객체) 수 — `q: "` 로 나옵니다.
  questions: (chunk.match(/\bq: "/g) || []).length,
}));
const lcOwned = {
  part1: (extra.part1 || []).length,
  part2: (extra.traps || []).length,
  part3: part34Sets.filter((s) => s.kind === "대화").reduce((n, s) => n + s.questions, 0),
  part4: part34Sets.filter((s) => s.kind === "담화").reduce((n, s) => n + s.questions, 0),
};
const coverage = Object.entries(LC_REAL).map(([part, real]) => {
  const owned = lcOwned[part] || 0;
  return { part, owned, real, pct: Math.round((owned / real) * 100) };
});

for (const c of coverage) {
  if (c.pct < 50) {
    fail(
      `LC 커버리지가 50% 아래입니다 — ${c.part.replace("part", "Part ")} ${c.owned}/${c.real}문항(${c.pct}%)\n` +
        "     → data/extra.js 의 traps(Part 2)·app.js 의 PART34_SETS(Part 3·4)에 문항을 보충하세요.",
    );
  }
}

/* ------------------------------------------------------------------ */
/* 5. 리포트                                                           */
/* ------------------------------------------------------------------ */

console.log("📊 toeic.monster 콘텐츠 감사");
console.log(`   · 유닛 ${unitIds.length}개 / 어휘 ${totalWords.toLocaleString("en-US")}개`);
console.log(`   · 숙어 ${idioms.length}개`);
console.log(`   · 확장 콘텐츠: ${Object.entries(extra).filter(([, v]) => Array.isArray(v)).map(([k, v]) => `${k} ${v.length}`).join(", ")}`);
console.log(`   · index.html 배열: ${Object.entries(inHtml).map(([k, v]) => `${k} ${v.length}`).join(", ")}`);
if (grammar.length) {
  const ch = grammar.reduce((n, b) => n + b.chapters.length, 0);
  const q = grammar.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.practice.length, 0), 0);
  console.log(`   · 문법 교재: ${grammar.map((b) => `${b.level} ${b.chapters.length}과`).join(", ")} (총 ${ch}과 · 연습 ${q}문항)`);
}
if (conversation.length) {
  const ch = conversation.reduce((n, b) => n + b.chapters.length, 0);
  const q = conversation.reduce((n, b) => n + b.chapters.reduce((m, c) => m + c.practice.length, 0), 0);
  console.log(`   · 회화 교재: ${conversation.map((b) => `${b.level} ${b.chapters.length}과`).join(", ")} (총 ${ch}과 · 연습 ${q}문항)`);
}
if (partBank) console.log(`   · PART_BANK: ${Object.entries(partBank).map(([k, v]) => `Part ${k} ${v.length}문항`).join(", ")}`);
console.log(
  `   · LC 커버리지: ` +
    coverage.map((c) => `${c.part.replace("part", "Part ")} ${c.owned}/${c.real}(${c.pct}%)`).join(" · ") +
    ` · Part 3·4 세트 ${part34Sets.length}개`,
);
if (notes.length) {
  console.log("\nℹ️  참고 (실패 아님)");
  notes.forEach((n) => console.log("   - " + n));
}
if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 중복·형식·표기 점검 모두 통과");
