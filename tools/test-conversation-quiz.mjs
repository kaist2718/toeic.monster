#!/usr/bin/env node
/**
 * 회화 문제 풀이(교재 연동) 회귀 테스트
 *
 * assets/app.js 의 "회화 문제 풀이" 블록을 그대로 떼어 가짜 브라우저에서 실행해
 * 아래를 확인합니다.
 *   1) 교재 연습 문제가 문항 수만큼 정확히 변환되는지 (전체 288 · 단계별 96)
 *   2) 모든 문항의 정답이 보기 안에 있는지, 문항 id 가 유일한지
 *   3) 단계 선택 목록이 교재 데이터와 일치하는지(회화 교재 id 는 conversation-*)
 *   4) 틀린 문항이 오답노트에 저장되고, 맞히면 목록에서 빠지는지
 *   5) 영어 정답에는 낭독 버튼이, 한글 정답에는 붙지 않는지
 *
 * 실행:  node tools/test-conversation-quiz.mjs
 * 종료 코드: 실패가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { readAppSource } from "./app-source.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* ------------------------------------------------------------------ */
/* 1. 교재 데이터 로드                                                  */
/* ------------------------------------------------------------------ */

const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of [
  "data/conversation-basic.js",
  "data/conversation-intermediate.js",
  "data/conversation-advanced.js",
]) {
  vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
}
const books = sandbox.window.CONVERSATION_BOOKS || [];
const expectedTotal = books.reduce(
  (n, b) => n + b.chapters.reduce((m, c) => m + c.practice.length, 0),
  0,
);

/* ------------------------------------------------------------------ */
/* 2. 앱 소스에서 회화 문제 풀이 블록 추출                              */
/* ------------------------------------------------------------------ */

const { code: html } = readAppSource();
const START = "// ---------- 회화 문제 풀이 (회화 교재 연습 문제 연동) ----------";
const start = html.indexOf(START);
if (start === -1) {
  console.log("❌ assets/app.js 에서 회화 문제 풀이 블록을 찾지 못했습니다.");
  process.exit(1);
}
const end = html.indexOf("// ---------- 1) 빈출", start);
if (end === -1) {
  console.log("❌ 회화 문제 풀이 블록의 끝 지점을 찾지 못했습니다.");
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
  window: { CONVERSATION_BOOKS: books },
  document,
  localStorage,
  makeMiniQuiz,
  showToast() {},
  esc(s) { return String(s == null ? "" : s); },
  shuffleArr(a) { return a; },
  // 오답노트 낭독 버튼(실제 앱의 ttsBtn 과 동일한 마커를 남깁니다).
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
vm.runInContext(block, ctx, { filename: "assets/app.js:conversation-quiz", timeout: 5000 });
// 데이터 스크립트가 defer 라, 앱은 초기화(startApp → applyConversationBooks)에서 이 두 함수를 부릅니다.
vm.runInContext("renderConversationLevelSelect(); renderConversationWrongNote();", ctx, {
  filename: "assets/app.js:conversation-quiz-render",
  timeout: 5000,
});

/* ------------------------------------------------------------------ */
/* 4. 점검                                                             */
/* ------------------------------------------------------------------ */

let failures = 0;
const check = (label, ok, detail) => {
  if (ok) console.log("  ✓ " + label);
  else { failures++; console.log("  ✗ " + label + (detail ? " — " + detail : "")); }
};

console.log("📕 회화 문제 풀이 회귀 테스트");

/* 4-1. 문항 변환 */
const all = ctx.conversationQuestions("all");
check(`전체 문항 ${all.length}개 (교재 연습 문제 ${expectedTotal}개와 일치)`, all.length === expectedTotal);
books.forEach((b) => {
  const mine = ctx.conversationQuestions(b.id);
  const want = b.chapters.reduce((n, c) => n + c.practice.length, 0);
  check(`${b.title} — ${mine.length}/${want}문항`, mine.length === want);
});
check(
  "회화 교재 단계 id 가 conversation- 접두사를 씀",
  books.every((b) => /^conversation-/.test(b.id)),
  books.map((b) => b.id).join(","),
);

/* 4-2. 정답 포함 · id 유일 · 보기 2개 이상 */
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
check(
  "과·문항 번호로 id 가 만들어짐",
  /^conversation-(basic|intermediate|advanced)-c\d+-q\d+$/.test(all[0].id),
  all[0].id,
);

/* 4-3. 단계 선택 목록 */
const sel = els.conversationLevelSel;
check(
  "교재 데이터가 준비되면 단계 목록을 그리도록 호출함",
  /function applyConversationBooks\(\)[\s\S]*?renderConversationLevelSelect\(\);/.test(html),
);
check(
  "앱이 회화 교재 데이터를 준비 시점에 불러옴(loadBooks)",
  /function scheduleExtendedHome\(\)[\s\S]*?loadBooks\("conversation"\);/.test(html),
);
check("단계 선택 목록이 생성됨", !!sel && sel.innerHTML.indexOf('value="conversation-basic"') !== -1);
check("전체 문항 수가 목록에 표시됨", !!sel && sel.innerHTML.indexOf(`${expectedTotal}문항`) !== -1);

/* 4-4. 오답노트 저장 → 정답 시 제거 */
const englishSample = all.filter((q) => /[A-Za-z]/.test(q.answer))[0];
const koreanSample = all.filter((q) => !/[A-Za-z]/.test(q.answer))[0];
ctx.conversationQuiz._opts.onAnswer(englishSample, false);
let saved = JSON.parse(store["toeic1000_conversationwrong"] || "{}");
check("틀린 문항이 오답노트에 저장됨", !!saved[englishSample.id], Object.keys(saved).join(","));
check(
  "오답노트가 문법과 다른 저장 키를 씀",
  !!store["toeic1000_conversationwrong"] && !store["toeic1000_grammarwrong"],
);
check("오답노트 화면에 정답·해설이 표시됨", els.conversationWrongBox.innerHTML.includes(englishSample.answer));

ctx.conversationQuiz._opts.onAnswer(englishSample, true);
saved = JSON.parse(store["toeic1000_conversationwrong"] || "{}");
check("맞힌 문항은 오답노트에서 빠짐", !saved[englishSample.id]);

/* 4-5. 오답만 다시 풀기 */
ctx.conversationQuiz._opts.onAnswer(englishSample, false);
ctx.conversationWrongOnly = true;
const retry = ctx.conversationQuiz._opts.build();
check("오답만 다시 풀기 목록이 만들어진다", Array.isArray(retry) && retry.length === 1 && retry[0].id === englishSample.id);
ctx.conversationWrongOnly = false;

/* 4-6. 문항 수 선택 */
check("문항 수가 선택 가능한 함수로 전달됨", typeof ctx.conversationQuiz._opts.count === "function");
els.conversationCountSel.value = "5";
check("5문항 선택이 반영됨", ctx.conversationQuiz._opts.count() === 5);
els.conversationCountSel.value = "0";
check("0 은 전체 문항으로 처리됨", ctx.conversationQuiz._opts.count() === 0);
els.conversationCountSel.value = "8";

/* 4-7. 오답노트 낭독 버튼 — 영어 정답에만 붙습니다 */
const englishHtml = els.conversationWrongBox.innerHTML;
const sayMatch = /data-say="([^"]*)"/.exec(englishHtml);
check("영어 정답에 표현 듣기 버튼이 있음", englishHtml.includes("js-tts") && !!sayMatch);
check("낭독 문장이 정답 표현과 같음", !!sayMatch && sayMatch[1] === englishSample.answer, sayMatch ? sayMatch[1] : "data-say 없음");
ctx.conversationQuiz._opts.onAnswer(englishSample, true);

ctx.conversationQuiz._opts.onAnswer(koreanSample, false);
check(
  "한글 정답에는 낭독 버튼을 붙이지 않음",
  !els.conversationWrongBox.innerHTML.includes("js-tts"),
  koreanSample.answer,
);
ctx.conversationQuiz._opts.onAnswer(koreanSample, true);

/* 4-8. 딥링크(교재 과 → 앱) — 회화 링크는 book=conversation 으로 구분합니다 */
const linkCode = (() => {
  const s = html.indexOf("  function parseDeepLink(search) {");
  // parseDeepLink 바로 뒤에 quizSelectValue 가 있고, 그 다음은 resolveChapter 의 설명 주석입니다.
  const e = html.indexOf("  /**\n   * 딥링크로 받은 과 번호가", s);
  return s === -1 || e === -1 ? "" : html.slice(s, e);
})();
if (!linkCode) {
  check("딥링크 파싱 블록을 찾음", false, "parseDeepLink/quizSelectValue 를 찾지 못했습니다");
} else {
  const { parseDeepLink, quizSelectValue } = new Function(
    `${linkCode}\n  return { parseDeepLink: parseDeepLink, quizSelectValue: quizSelectValue };`,
  )();
  const conv = parseDeepLink("?book=conversation&level=basic&ch=5");
  check(
    "회화 과 페이지 링크에서 교재·단계·과 번호를 읽음",
    !!conv && conv.book === "conversation" && conv.level === "basic" && conv.chapter === 5,
    JSON.stringify(conv),
  );
  const full = parseDeepLink("?book=conversation&level=conversation-advanced");
  check(
    "회화 교재 전체 id(conversation-advanced)도 받아 줌",
    !!full && full.book === "conversation" && full.level === "advanced" && full.chapter === 0,
    JSON.stringify(full),
  );
  const grammar = parseDeepLink("?level=basic&ch=5");
  check(
    "book 이 없으면 문법 교재 링크로 봅니다(예전 주소 호환)",
    !!grammar && grammar.book === "grammar" && grammar.level === "basic",
    JSON.stringify(grammar),
  );
  check("단계 이름이 이상하면 무시함", parseDeepLink("?book=conversation&level=초급") === null);
  check(
    "단계 선택 값에 conversation- 접두사를 붙임",
    quizSelectValue("conversation", "basic") === "conversation-basic" &&
      quizSelectValue("grammar", "basic") === "basic",
  );
}

/* 4-9. 대시보드·약점 훈련 연결 */
check(
  "대시보드에 '회화' 영역으로 묶임",
  /conversation_all: "회화"/.test(html) && /conversation_advanced: "회화"/.test(html),
);
check(
  "약점 훈련이 회화 문제 풀이 섹션으로 연결됨",
  /"회화": \{ target: "회화 문제 풀이", start: "conversationStart" \}/.test(html),
);
check(
  "기록 키가 conversation_단계 형태로 쌓임",
  /statKey: function \(\) \{ return "conversation_" \+ conversationLevelValue\(\)\.replace\(\/\^conversation-\/, ""\); \}/.test(html),
);

console.log("");
if (failures) {
  console.log(`❌ 회화 문제 풀이 테스트 실패 ${failures}건`);
  process.exit(1);
}
console.log("✅ 회화 문제 풀이 테스트 통과");
