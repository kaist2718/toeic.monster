#!/usr/bin/env node
/**
 * toeic.monster 콘텐츠 감사(중복·표기 일관성) 도구
 *
 * 콘텐츠를 추가한 뒤 아래를 자동 점검합니다.
 *   1) data/*.js 어휘·숙어·확장 콘텐츠의 형식과 중복
 *   2) index.html 안의 학습 배열(콜로케이션·혼동어휘·문법 팁 등)의 중복
 *   3) 정답이 보기에 없는 문항(오타성 버그)
 *   4) data/extra.js 와 index.html 배열 사이의 중복 항목
 *   5) 사이트에 표기한 어휘 총량과 실제 데이터 수 일치 여부
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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
  for (const file of ["data/idioms.js", "data/extra.js"]) {
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  }
  return {
    vocab: sandbox.window.VOCAB_UNITS || {},
    idioms: sandbox.window.VOCAB_IDIOMS || [],
    extra: sandbox.window.TOEIC_EXTRA || {},
  };
}

/* ------------------------------------------------------------------ */
/* 2. index.html 안의 `var NAME = [...]` 배열 추출                     */
/* ------------------------------------------------------------------ */

const html = read("index.html");

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
  const at = html.indexOf(marker);
  if (at === -1) return null;
  const start = html.indexOf("[", at);
  if (start === -1) return null;
  const src = sliceBalanced(html, start);
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

const { vocab, idioms, extra } = loadData();

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
(extra.guides || []).forEach((g) => {
  if (!g.slug || !g.title || !Array.isArray(g.sections)) fail(`extra.guides: 형식이 불완전한 가이드 — ${g.slug || g.title}`);
});

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
  const at = html.indexOf("var PART_BANK = ");
  if (at === -1) return null;
  const src = sliceBalanced(html, html.indexOf("{", at));
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
/* 5. 리포트                                                           */
/* ------------------------------------------------------------------ */

console.log("📊 toeic.monster 콘텐츠 감사");
console.log(`   · 유닛 ${unitIds.length}개 / 어휘 ${totalWords.toLocaleString("en-US")}개`);
console.log(`   · 숙어 ${idioms.length}개`);
console.log(`   · 확장 콘텐츠: ${Object.entries(extra).filter(([, v]) => Array.isArray(v)).map(([k, v]) => `${k} ${v.length}`).join(", ")}`);
console.log(`   · index.html 배열: ${Object.entries(inHtml).map(([k, v]) => `${k} ${v.length}`).join(", ")}`);
if (partBank) console.log(`   · PART_BANK: ${Object.entries(partBank).map(([k, v]) => `Part ${k} ${v.length}문항`).join(", ")}`);
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
