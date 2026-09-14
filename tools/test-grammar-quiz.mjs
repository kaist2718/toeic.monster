#!/usr/bin/env node
/**
 * 문법 문제 풀이(교재 연동) 회귀 테스트
 *
 * index.html 의 "문법 문제 풀이" 블록을 그대로 떼어 가짜 브라우저에서 실행해
 * 아래를 확인합니다.
 *   1) 교재 연습 문제가 문항 수만큼 정확히 변환되는지 (전체 108 · 단계별 36)
 *   2) 모든 문항의 정답이 보기 안에 있는지, 문항 id 가 유일한지
 *   3) 단계 선택 목록이 교재 데이터와 일치하는지
 *   4) 틀린 문항이 오답노트에 저장되고, 맞히면 목록에서 빠지는지
 *
 * 실행:  node tools/test-grammar-quiz.mjs
 * 종료 코드: 실패가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ------------------------------------------------------------------ */
/* 1. 교재 데이터 로드                                                  */
/* ------------------------------------------------------------------ */

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ["data/grammar-basic.js", "data/grammar-intermediate.js", "data/grammar-advanced.js"]) {
  vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
}
const books = sandbox.window.GRAMMAR_BOOKS || [];
const expectedTotal = books.reduce(
  (n, b) => n + b.chapters.reduce((m, c) => m + c.practice.length, 0),
  0,
);

/* ------------------------------------------------------------------ */
/* 2. index.html 에서 문법 문제 풀이 블록 추출                          */
/* ------------------------------------------------------------------ */

const html = read("index.html");
const START = "// ---------- 문법 문제 풀이 (문법 교재 연습 문제 연동) ----------";
const start = html.indexOf(START);
if (start === -1) {
  console.log("❌ index.html 에서 문법 문제 풀이 블록을 찾지 못했습니다.");
  process.exit(1);
}
const end = html.indexOf("// ---------- 1) 빈출", start);
if (end === -1) {
  console.log("❌ 문법 문제 풀이 블록의 끝 지점을 찾지 못했습니다.");
  process.exit(1);
}
const block = html.slice(start, end);

/* ------------------------------------------------------------------ */
/* 3. 가짜 브라우저                                                     */
/* ------------------------------------------------------------------ */

function makeElement(id) {
  return {
    id,
    innerHTML: "",
    textContent: "",
    hidden: false,
    value: "",
    listeners: {},
    addEventListener(type, fn) { this.listeners[type] = fn; },
    scrollIntoView() {},
  };
}
const els = {};
const document = {
  getElementById(id) { return els[id] || (els[id] = makeElement(id)); },
  querySelector() { return null; },
  querySelectorAll() { return []; },
};

const store = {};
const localStorage = {
  getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
  setItem(k, v) { store[k] = String(v); },
  removeItem(k) { delete store[k]; },
};

// makeMiniQuiz 는 내부 상태를 만들 뿐이므로 옵션만 붙잡아 두는 스텁으로 충분합니다.
function makeMiniQuiz(opts) {
  return { _opts: opts, started: false, start() { this.started = true; }, render() {} };
}

const ctx = {
  window: { GRAMMAR_BOOKS: books },
  document,
  localStorage,
  makeMiniQuiz,
  showToast() {},
  esc(s) { return String(s == null ? "" : s); },
  shuffleArr(a) { return a; },
  // 예문·오답노트 낭독 버튼(실제 앱의 ttsBtn 과 동일한 마커를 남깁니다).
  ttsBtn(text, label) {
    const t = String(text == null ? "" : text).trim();
    if (!t) return "";
    return `<button class="tts-btn js-tts" data-say="${t}" aria-label="${label || "예문 듣기"}">🔊</button>`;
  },
  storeObject(key) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    } catch (e) { return {}; }
  },
};
vm.createContext(ctx);
vm.runInContext(block, ctx, { filename: "index.html:grammar-quiz", timeout: 5000 });

/* ------------------------------------------------------------------ */
/* 4. 점검                                                             */
/* ------------------------------------------------------------------ */

let failures = 0;
const check = (label, ok, detail) => {
  if (ok) console.log("  ✓ " + label);
  else { failures++; console.log("  ✗ " + label + (detail ? " — " + detail : "")); }
};

console.log("📘 문법 문제 풀이 회귀 테스트");

/* 4-1. 문항 변환 */
const all = ctx.grammarQuestions("all");
check(`전체 문항 ${all.length}개 (교재 연습 문제 ${expectedTotal}개와 일치)`, all.length === expectedTotal);
books.forEach((b) => {
  const mine = ctx.grammarQuestions(b.id);
  const want = b.chapters.reduce((n, c) => n + c.practice.length, 0);
  check(`${b.title} — ${mine.length}/${want}문항`, mine.length === want);
});

/* 4-2. 정답 포함 · id 유일 · 보기 4개 */
const ids = new Set();
let noAnswer = 0, badOpts = 0, dupId = 0;
all.forEach((q) => {
  if (q.options.indexOf(q.answer) === -1) noAnswer++;
  if (!Array.isArray(q.options) || q.options.length < 2) badOpts++;
  if (ids.has(q.id)) dupId++;
  ids.add(q.id);
});
check("모든 문항의 정답이 보기 안에 있음", noAnswer === 0, `문제 ${noAnswer}건`);
check("모든 문항에 보기가 2개 이상 있음", badOpts === 0, `문제 ${badOpts}건`);
check("문항 id 가 모두 유일함", dupId === 0, `중복 ${dupId}건`);

/* 4-3. 단계 선택 목록 */
const sel = els.grammarLevelSel;
check("단계 선택 목록이 생성됨", !!sel && sel.innerHTML.indexOf('value="basic"') !== -1);
check("전체 문항 수가 목록에 표시됨", !!sel && sel.innerHTML.indexOf(`${expectedTotal}문항`) !== -1);

/* 4-4. 오답노트 저장 → 정답 시 제거 */
const sample = all[0];
ctx.grammarQuiz._opts.onAnswer(sample, false);
let saved = JSON.parse(store["toeic1000_grammarwrong"] || "{}");
check("틀린 문항이 오답노트에 저장됨", !!saved[sample.id], Object.keys(saved).join(","));
check("오답노트 화면에 정답·해설이 표시됨", els.grammarWrongBox.innerHTML.includes(sample.answer));

ctx.grammarQuiz._opts.onAnswer(sample, true);
saved = JSON.parse(store["toeic1000_grammarwrong"] || "{}");
check("맞힌 문항은 오답노트에서 빠짐", !saved[sample.id]);

/* 4-5. 오답만 다시 풀기 */
ctx.grammarQuiz._opts.onAnswer(sample, false);
ctx.grammarWrongOnly = true;
const retry = ctx.grammarQuiz._opts.build();
check("오답만 다시 풀기 목록이 만들어진다", Array.isArray(retry) && retry.length === 1 && retry[0].id === sample.id);
ctx.grammarWrongOnly = false;

/* 4-6. 문항 수 선택 */
check("문항 수가 선택 가능한 함수로 전달됨", typeof ctx.grammarQuiz._opts.count === "function");
els.grammarCountSel.value = "5";
check("5문항 선택이 반영됨", ctx.grammarQuiz._opts.count() === 5);
els.grammarCountSel.value = "0";
check("0 은 전체 문항으로 처리됨", ctx.grammarQuiz._opts.count() === 0);
els.grammarCountSel.value = "8";

/* 4-7. 오답노트 낭독 버튼(빈칸이 정답으로 채워진 문장) */
ctx.grammarQuiz._opts.onAnswer(sample, false);
const noteHtml = els.grammarWrongBox.innerHTML;
const sayMatch = /data-say="([^"]*)"/.exec(noteHtml);
check("오답노트에 완성 문장 듣기 버튼이 있음", noteHtml.includes("js-tts") && !!sayMatch);
check(
  "빈칸이 정답으로 채워져 낭독됨",
  !!sayMatch && sayMatch[1].indexOf(sample.answer) !== -1 && sayMatch[1].indexOf("__") === -1,
  sayMatch ? sayMatch[1] : "data-say 없음",
);
ctx.grammarQuiz._opts.onAnswer(sample, true);

console.log("");
if (failures) {
  console.log(`❌ 문법 문제 풀이 테스트 실패 ${failures}건`);
  process.exit(1);
}
console.log("✅ 문법 문제 풀이 테스트 통과");
