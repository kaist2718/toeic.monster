#!/usr/bin/env node
/**
 * 본문 품질 감사 — "형식"이 아니라 "내용이 어긋나지 않았는가"를 봅니다.
 *
 * 왜 필요한가:
 *   감사 4종(콘텐츠·문구·사이트·접근성)은 형식·표기·구조를 봅니다. 그런데 학습 자료에서
 *   실제로 치명적인 것은 "영어 예문과 해석이 서로 다른 이야기를 하는 것"입니다.
 *   이 감사는 사람이 놓치기 쉬운 내용 불일치를 자동으로 잡고, 자동으로 못 잡는 층은
 *   "검수 추천 샘플"로 찍어 줍니다(사람 검수 게이트 — docs/content-roadmap.md 2절).
 *
 * 보는 것:
 *   1) 번역 숫자 대조 — 영어 예문의 숫자(아라비아·영어 수사)와 해석의 숫자가 어긋나면 실패
 *   2) 결측·형식 결함 — 빈 필드, IPA 표기, 예문 끝부호, 보기 중복, "정답이 보기에 없는" 문항
 *   3) 검수 추천 샘플 — 난수 없이 고정된 시드로 뽑은 표본(사람이 읽어 볼 항목)
 *
 * 실행: npm run audit:prose      (결함이 있으면 종료 코드 1)
 * 외부 의존성 없음(Node 내장 모듈만).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const problems = [];
const warnings = [];
const fail = (msg) => problems.push(msg);
const warn = (msg) => warnings.push(msg);

/* ------------------------------------------------------------------ */
/* 1. 데이터 불러오기 (vm sandbox — 브라우저 전역만 흉내 냅니다)          */
/* ------------------------------------------------------------------ */

function loadData(file) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  return sandbox.window;
}

const VOCAB = {};
for (let i = 1; i <= 30; i++) {
  const id = String(i).padStart(2, "0");
  const w = loadData(`data/unit${id}.js`);
  VOCAB[i] = w.VOCAB_UNITS[i] || [];
}
const idioms = loadData("data/idioms.js").VOCAB_IDIOMS || [];
const extra = loadData("data/extra.js").TOEIC_EXTRA || {};

const GRAMMAR_FILES = ["data/grammar-basic.js", "data/grammar-intermediate.js", "data/grammar-advanced.js"];
const CONV_FILES = ["data/conversation-basic.js", "data/conversation-intermediate.js", "data/conversation-advanced.js"];
const books = [];
for (const f of [...GRAMMAR_FILES, ...CONV_FILES]) {
  for (const b of loadData(f).GRAMMAR_BOOKS || []) books.push({ file: f, book: b });
  for (const b of loadData(f).CONVERSATION_BOOKS || []) books.push({ file: f, book: b });
}

/* ------------------------------------------------------------------ */
/* 2. 번역 숫자 대조                                                   */
/* ------------------------------------------------------------------ */

/*
 * 숫자 추출 규칙(오탐을 줄이기 위한 설계):
 *   영어는 "nine to five"(9시~5시), "March"(3월), "a million"(100만), "the past decade"(10년)처럼
 *   숫자를 수사·월 이름·단위 표현으로 쓰는 경우가 많습니다. 그래서 영어 쪽은
 *   ① 아라비아 숫자(콤마 허용) ② 영어 수사 뭉치(two hundred = 200, ninety-nine = 99)
 *   ③ 월 이름(January=1 … December=12) ④ 관사+단위(a year=1년, the year=1년)
 *   ⑤ decade=10년 · front-page=1면 ⑥ 서수+명사(the first of the month=1일)까지 뽑습니다.
 *   해석 쪽은 아라비아 숫자와 한국어 단위(100만=1,000,000 · 5만=50,000)를 뽑습니다.
 *
 * 판정(보수적으로 — 확실한 불일치만 실패):
 *   - 양쪽 모두 숫자가 있는데 어느 쪽도 다른 쪽의 부분집합이 아니면 → 실패 (예: 3일 ↔ 5일)
 *   - 해석의 숫자가 영어에서 안 잡히면 → 경고(사람 검수 추천 — "010-2345-6789" 같은
 *     철자로 읽는 숫자는 자동 대조가 불가능하므로 실패로 처리하지 않습니다)
 */
const NUM_WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000, million: 1000000,
};
const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
const ORDINALS = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17,
  eighteenth: 18, nineteenth: 19, twentieth: 20, thirtieth: 30, fortieth: 40, fiftieth: 50, sixtieth: 60,
  seventieth: 70, eightieth: 80, ninetieth: 90,
};
const ORD_NOUNS = "floor|day|month|week|quarter|year|time|place|round|shift|class|page";
const UNIT_WORDS = "year|month|week|day|hour|minute|second";
const ORD_RE = new RegExp(`\\b(${Object.keys(ORDINALS).join("|")}) (${ORD_NOUNS}|of the (month|week|year))\\b`, "g");
const UNIT_RE = new RegExp(`\\b(a|an|the|this|last|next|past|entire|whole|one) (${UNIT_WORDS})\\b`, "g");
const KO_MULT_RE = /(\d[\d,]*)\s*(천|만|억|조)/g;
const KO_MULT = { 천: 1000, 만: 10000, 억: 100000000, 조: 1000000000000 };

function enNumbersIn(text) {
  const out = new Set();
  const s = String(text || "");
  for (const m of s.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const n = Number(m[0].replace(/,/g, ""));
    if (Number.isFinite(n)) out.add(n);
  }
  const low = s.toLowerCase().replace(/[^a-z\s]/g, " ");
  // 영어 수사 뭉치 — 이어진 수사 단어를 하나의 값으로 계산합니다(nine to five → 9, 5).
  const words = low.split(/\s+/);
  let run = [];
  const flush = () => {
    if (!run.length) return;
    let total = 0, pending = 0;
    for (const w of run) {
      const v = NUM_WORDS[w];
      if (v >= 100) { total += (pending || 1) * v; pending = 0; }
      else pending += v;
    }
    out.add(total + pending);
    run = [];
  };
  for (const w of words) {
    if (NUM_WORDS[w] !== undefined) run.push(w);
    else flush();
  }
  flush();
  for (const [m, v] of Object.entries(MONTHS)) {
    if (new RegExp(`\\b${m}\\b`).test(low)) out.add(v);
  }
  for (const m of low.matchAll(UNIT_RE)) out.add(1);
  for (const m of s.toLowerCase().matchAll(ORD_RE)) out.add(ORDINALS[m[1]]);
  if (/\bfront-page\b/.test(s.toLowerCase())) out.add(1);
  // decade = 10년 — 앞에 수사가 있으면 그 값 × 10 (two decades = 20).
  if (/\bdecades?\b/.test(low)) {
    let n = 0;
    for (const v of out) if (v > 0 && v < 100 && Number.isInteger(v)) n = v;
    out.add(n ? n * 10 : 10);
  }
  return out;
}

function koNumbersIn(text) {
  const out = new Set();
  const s = String(text || "");
  let rest = s;
  const scaled = [];
  for (const m of s.matchAll(KO_MULT_RE)) {
    const n = Number(m[1].replace(/,/g, "")) * KO_MULT[m[2]];
    if (Number.isFinite(n)) scaled.push(n);
  }
  rest = s.replace(KO_MULT_RE, " ");
  for (const m of rest.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
    const n = Number(m[0].replace(/,/g, ""));
    if (Number.isFinite(n)) out.add(n);
  }
  for (const n of scaled) out.add(n);
  // "5만 5천" 처럼 단위가 붙은 숫자가 여러 개면 합(55,000)도 후보로 넣습니다.
  if (scaled.length > 1) out.add(scaled.reduce((a, b) => a + b, 0));
  return out;
}

/** 예문(en) ↔ 해석(ko) 한 쌍의 숫자를 대조합니다. */
function checkNumberPair(en, ko, label) {
  const enNums = enNumbersIn(en);
  const koNums = koNumbersIn(ko);
  const enSub = [...koNums].every((n) => enNums.has(n));
  const koSub = [...enNums].every((n) => koNums.has(n));
  if (/\d/.test(en) && /\d/.test(ko) && !enSub && !koSub) {
    fail(`${label}: 숫자가 서로 다릅니다 — "${en}" (영어 ${[...enNums].join("/")}) ↔ "${ko}" (해석 ${[...koNums].join("/")})`);
    return;
  }
  for (const n of koNums) {
    if (!enNums.has(n)) warn(`${label}: 해석의 숫자 ${n} 가 영어에서 자동 확인되지 않습니다(사람 검수 추천) — "${en}" / "${ko}"`);
  }
}

/* ------------------------------------------------------------------ */
/* 3. 결측·형식 결함                                                   */
/* ------------------------------------------------------------------ */

const nonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

function checkOptions(q, a, opts, why, label) {
  if (!Array.isArray(opts) || opts.length < 2) return fail(`${label}: 보기가 2개 미만입니다.`);
  if (new Set(opts).size !== opts.length) fail(`${label}: 보기에 중복이 있습니다 — ${opts.join(" / ")}`);
  if (!opts.includes(a)) fail(`${label}: 정답이 보기에 없습니다 — ${a}`);
  if (!nonEmpty(why) || why.trim().length < 10) fail(`${label}: 해설(why)이 비었거나 너무 짧습니다.`);
}

// 어휘 1,000 — 형식·결측·번역 대조
for (const [unit, rows] of Object.entries(VOCAB)) {
  rows.forEach((r, i) => {
    const label = `unit${String(unit).padStart(2, "0")} #${i + 1} (${r[0]})`;
    if (r.length !== 7) return fail(`${label}: 필드가 7개가 아닙니다 (${r.length}).`);
    const [word, ipa, pronKo, mean, ex, exKo, exPron] = r;
    if (![word, ipa, pronKo, mean, ex, exKo, exPron].every(nonEmpty)) fail(`${label}: 빈 필드가 있습니다.`);
    if (!/^\/.+\/$/.test(ipa.trim())) fail(`${label}: IPA 발음기호가 / / 로 감싸져 있지 않습니다 — ${ipa}`);
    if (!/[.?!]$/.test(ex.trim())) fail(`${label}: 예문이 문장 부호로 끝나지 않습니다 — ${ex}`);
    if (exPron.trim().length < 5) fail(`${label}: 예문 한글 발음이 너무 짧습니다 — ${exPron}`);
    checkNumberPair(ex, exKo, label);
  });
}

// 숙어 126 — 형식·번역 대조
idioms.forEach((r, i) => {
  const label = `idioms[${i}] (${r[0]})`;
  if (r.length !== 4) return fail(`${label}: 필드가 4개가 아닙니다 (${r.length}).`);
  const [en, ko, exEn, exKo] = r;
  if (![en, ko, exEn, exKo].every(nonEmpty)) fail(`${label}: 빈 필드가 있습니다.`);
  if (!/[.?!]$/.test(exEn.trim())) fail(`${label}: 예문이 문장 부호로 끝나지 않습니다 — ${exEn}`);
  checkNumberPair(exEn, exKo, label);
});

// 교재 6권 — 예문(en/ko) 번역 대조 · 연습 문항 형식
for (const { file, book } of books) {
  const tag = `${file} · ${book.title}`;
  (book.chapters || []).forEach((ch, ci) => {
    const label = `${tag} ${ci + 1}과(${ch.title})`;
    if (!nonEmpty(ch.intro)) fail(`${label}: 도입(intro)이 없습니다.`);
    if (!nonEmpty(ch.summary)) fail(`${label}: 요약(summary)이 없습니다.`);
    (ch.points || []).forEach((p, pi) => {
      if (!nonEmpty(p.h) || !nonEmpty(p.body)) fail(`${label} 개념 ${pi + 1}: 제목(h)이나 본문(body)이 비었습니다.`);
      (p.examples || []).forEach((e, ei) => {
        if (!nonEmpty(e.en) || !nonEmpty(e.ko)) fail(`${label} 예문 ${pi + 1}-${ei + 1}: 영어 또는 해석이 비었습니다.`);
        else checkNumberPair(e.en, e.ko, `${label} 예문 ${pi + 1}-${ei + 1}`);
      });
    });
    (ch.practice || []).forEach((q, qi) => {
      checkOptions(q.q, q.a, q.opts, q.why, `${label} 연습 ${qi + 1}`);
    });
    (ch.mistakes || []).forEach((m, mi) => {
      if (!nonEmpty(typeof m === "string" ? m : m.text || m.wrong || "")) {
        // mistakes 는 형식이 문항마다 다를 수 있어 내용이 있는지만 봅니다.
        if (!Object.values(m || {}).some((v) => nonEmpty(v))) fail(`${label} 실수 ${mi + 1}: 내용이 비었습니다.`);
      }
    });
  });
}

// 확장 콘텐츠 — 문항 형식(보기·정답·해설)
const quizPools = [
  ["extra.part1", extra.part1, (t) => t.q],
  ["extra.traps", extra.traps, (t) => t.audio],
  ["extra.transitions", extra.transitions, (t) => t.prompt],
  ["extra.prepositions", extra.prepositions, (t) => t.prompt],
];
for (const [name, pool, getPrompt] of quizPools) {
  (pool || []).forEach((t, i) => {
    checkOptions(getPrompt(t), t.a, t.opts, t.why, `${name}[${i}]`);
  });
}
(extra.part6 || []).forEach((s, i) => {
  (s.blanks || []).forEach((b) => checkOptions(`${s.title} 빈칸 ${b.n}`, b.a, b.opts, b.why, `extra.part6[${i}] 빈칸 ${b.n}`));
});
(extra.part7 || []).forEach((s, i) => {
  (s.qs || []).forEach((q, qi) => checkOptions(q.q, q.a, q.opts, q.why, `extra.part7[${i}] 문항 ${qi + 1}`));
});
(extra.part34 || []).forEach((s, i) => {
  (s.qs || []).forEach((q, qi) => checkOptions(q.q, q.a, q.opts, q.why, `extra.part34[${i}] 문항 ${qi + 1}`));
});

/* ------------------------------------------------------------------ */
/* 4. 검수 추천 샘플 (고정 시드 — 결과가 매번 같음)                      */
/* ------------------------------------------------------------------ */

function seededSample(items, n, seed) {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const copy = items.slice();
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

const allVocab = Object.entries(VOCAB).flatMap(([u, rows]) =>
  rows.map((r, i) => ({ unit: u, i, word: r[0], ex: r[4], exKo: r[5] })),
);
const sampleVocab = seededSample(allVocab, 8, 20261019);
const allExPairs = [];
for (const { file, book } of books) {
  (book.chapters || []).forEach((ch, ci) => {
    (ch.points || []).forEach((p) => (p.examples || []).forEach((e) => allExPairs.push({ file, ci, e })));
  });
}
const samplePairs = seededSample(allExPairs, 6, 20261020);

/* ------------------------------------------------------------------ */
/* 5. 리포트                                                           */
/* ------------------------------------------------------------------ */

console.log("\n✍️  본문 품질 감사 (번역 대조 · 결측 · 검수 샘플)");
console.log(`   · 어휘 ${allVocab.length}개 · 숙어 ${idioms.length}개 · 교재 ${books.length}권 예문 ${allExPairs.length}개`);
console.log(`   · 확장 문항: part1 ${(extra.part1 || []).length} · traps ${(extra.traps || []).length} · transitions ${(extra.transitions || []).length} · prepositions ${(extra.prepositions || []).length} · part6 ${(extra.part6 || []).length} · part7 ${(extra.part7 || []).length} · part34 ${(extra.part34 || []).length}`);

if (warnings.length) {
  console.log(`\nℹ️  참고 (실패 아님 · ${warnings.length}건)`);
  for (const w of warnings.slice(0, 10)) console.log(`   - ${w}`);
  if (warnings.length > 10) console.log(`   … 외 ${warnings.length - 10}건`);
}

console.log(`\n🧑‍🏫 사람 검수 추천 샘플 (고정 시드 — 표본으로 읽어 보세요)`);
for (const v of sampleVocab) {
  console.log(`   [어휘 · unit${String(v.unit).padStart(2, "0")}] ${v.word} — ${v.ex} / ${v.exKo}`);
}
for (const p of samplePairs) {
  console.log(`   [교재 · ${path.basename(p.file)} ${p.ci + 1}과] ${p.e.en} / ${p.e.ko}`);
}

if (problems.length) {
  console.log(`\n❌ 본문 품질 감사 실패 — ${problems.length}건`);
  for (const p of problems.slice(0, 30)) console.log(`   ✗ ${p}`);
  if (problems.length > 30) console.log(`   … 외 ${problems.length - 30}건`);
  process.exit(1);
}

console.log("\n✅ 본문 품질 점검 모두 통과 (번역 숫자 대조 · 결측 · 문항 형식)");
