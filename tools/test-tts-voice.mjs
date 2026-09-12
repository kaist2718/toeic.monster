#!/usr/bin/env node
/**
 * toeic.monster TTS 음성 선택 로직 회귀 테스트
 *
 * `index.html` 의 TTS 블록(음성 목록 수집·자동 선택·사용자 선택 복원)을 그대로 추출해
 * 가짜 브라우저 환경에서 실행합니다. 실제 모바일 브라우저처럼
 *   ① 로드 시점에는 음성 목록이 비어 있고, ② 첫 사용자 조작 이후에 목록이 채워지는
 * 상황을 재현해, 고른 목소리가 기본 음성으로 새지 않는지 확인합니다.
 *
 * 실행:  node tools/test-tts-voice.mjs
 * 종료 코드: 실패가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

const START = "  // ---------- TTS(음성 합성) 공통 ----------";
const END = "  // 사용자 설정: 발음 듣기 켜기/끄기 + 재생 속도 (localStorage 에 저장)";
const s = html.indexOf(START);
const e = html.indexOf(END);
if (s < 0 || e < 0) {
  console.error("❌ index.html 에서 TTS 블록을 찾지 못했습니다. (마커 주석이 바뀌었는지 확인하세요)");
  process.exit(1);
}
const code = html.slice(s, e);

/* ------------------------------------------------------------------ */
/* 가짜 브라우저 환경                                                  */
/* ------------------------------------------------------------------ */

function makeStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

/** <select> 처럼 목록에 없는 값은 빈 문자열로 되돌리는 최소 구현 */
function makeSelect() {
  const sel = { title: "", _html: "", _value: "", _options: new Set() };
  Object.defineProperty(sel, "innerHTML", {
    get() {
      return this._html;
    },
    set(h) {
      this._html = h;
      this._options = new Set([...h.matchAll(/value="([^"]*)"/g)].map((m) => m[1]));
    },
  });
  Object.defineProperty(sel, "value", {
    get() {
      return this._value;
    },
    set(v) {
      this._value = this._options.has(String(v)) ? String(v) : "";
    },
  });
  return sel;
}

function build(voicesRef, storageInit = {}) {
  const sel = makeSelect();
  const docHandlers = {};
  const documentMock = {
    getElementById: (id) => (id === "ttsVoice" ? sel : null),
    addEventListener: (t, fn) => {
      (docHandlers[t] = docHandlers[t] || []).push(fn);
    },
  };
  const timers = new Map();
  let timerId = 0;
  const windowMock = {
    speechSynthesis: {
      getVoices: () => voicesRef.value,
      onvoiceschanged: null,
      speak: () => {},
      cancel: () => {},
    },
  };
  const api = new Function(
    "window",
    "document",
    "localStorage",
    "esc",
    "escapeAttr",
    "SpeechSynthesisUtterance",
    "setInterval",
    "clearInterval",
    code +
      "\nreturn { fillVoiceSelect, pickAutoVoice, pickEnglishVoice, refreshTtsVoices, watchTtsVoices," +
      " allVoices, englishVoices, getURI: function(){return TTS_VOICE_URI;} };",
  )(
    windowMock,
    documentMock,
    makeStorage(storageInit),
    (x) => String(x),
    (x) => String(x),
    function SpeechSynthesisUtterance() {},
    (cb) => {
      const id = ++timerId;
      timers.set(id, cb);
      return id;
    },
    (id) => timers.delete(id),
  );
  return { api, sel, timers, docHandlers };
}

const voice = (name, lang, uri) => ({ name, lang, voiceURI: uri || name });

/* ------------------------------------------------------------------ */
/* 검증                                                                */
/* ------------------------------------------------------------------ */

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) {
    pass++;
    console.log("  ✓ " + msg);
  } else {
    fail++;
    console.log("  ✗ " + msg);
  }
};
const sections = [];
const section = (name, fn) => {
  console.log("\n" + name);
  sections.push(name);
  fn();
};

console.log("🔊 TTS 음성 선택 로직 테스트");

section("[1] 모바일: 로드 시 목록이 비어 있다가 나중에 채워짐", () => {
  const voicesRef = { value: [] };
  const ctx = build(voicesRef);
  ok(ctx.api.allVoices().length === 0, "처음엔 음성 0개");
  ok(ctx.sel.innerHTML === "", "목록이 비면 select 는 그대로");
  ok(ctx.timers.size === 1, "목록이 준비될 때까지 재확인 타이머를 건다");
  voicesRef.value = [voice("Samantha", "en-US"), voice("Daniel", "en-GB"), voice("Karen", "en-AU")];
  for (const cb of [...ctx.timers.values()]) cb();
  ok(ctx.api.englishVoices().length === 3, "나중에 채워진 영어 음성 3개 인식");
  ok([...ctx.sel.innerHTML.matchAll(/<option/g)].length === 4, "자동 + 3개 = 옵션 4개 채워짐");
  ok(ctx.timers.size === 0, "목록이 채워지면 폴링 중단");
});

section("[2] lang 표기 변형(en_US / EN-us)도 영어로 인식", () => {
  const voicesRef = { value: [voice("A", "en_US"), voice("B", "EN-us"), voice("C", "ko-KR")] };
  const ctx = build(voicesRef);
  ok(ctx.api.englishVoices().length === 2, "en_US · EN-us 인식, ko-KR 제외");
  ok(ctx.api.pickAutoVoice().name === "A", "en-US 음성을 우선 자동 선택");
});

section("[3] 고른 목소리를 재생 직전에 다시 조회", () => {
  const voicesRef = { value: [] };
  const ctx = build(voicesRef, { toeic1000_ttsvoice: "Daniel" });
  ok(ctx.api.getURI() === "Daniel", "저장된 선택을 유지");
  voicesRef.value = [voice("Samantha", "en-US"), voice("Daniel", "en-GB")];
  ctx.api.refreshTtsVoices();
  ok(ctx.sel.value === "Daniel", "select 에 저장된 음성 표시");
  ok(ctx.api.pickEnglishVoice().name === "Daniel", "재생 시 고른 음성(Daniel) 사용");
  ok(ctx.api.pickEnglishVoice().lang === "en-GB", "고른 음성의 lang(en-GB)을 그대로 사용");
});

section("[4] 저장된 음성이 없는 브라우저면 자동으로 되돌림", () => {
  const voicesRef = { value: [voice("Samantha", "en-US")] };
  const ctx = build(voicesRef, { toeic1000_ttsvoice: "없는음성" });
  ctx.api.refreshTtsVoices();
  ok(ctx.api.getURI() === "", "없는 음성은 선택 해제");
  ok(ctx.sel.value === "", "select 는 자동으로 표시");
  ok(ctx.api.pickEnglishVoice().name === "Samantha", "자동 선택으로 폴백");
});

section("[5] 첫 사용자 조작 시 목록 재확인", () => {
  const voicesRef = { value: [voice("Samantha", "en-US")] };
  const ctx = build(voicesRef);
  ok((ctx.docHandlers.pointerdown || []).length === 1, "pointerdown 핸들러 등록");
  ok((ctx.docHandlers.touchstart || []).length === 1, "touchstart 핸들러 등록");
  ok((ctx.docHandlers.keydown || []).length === 1, "keydown 핸들러 등록");
  ctx.docHandlers.pointerdown[0]();
  ok(ctx.api.englishVoices().length === 1, "조작 후 목록 사용 가능");
});

section("[6] 음성 목록이 끝내 없으면 폴링을 멈춤", () => {
  const ctx = build({ value: [] });
  for (let i = 0; i < 40; i++) for (const cb of [...ctx.timers.values()]) cb();
  ok(ctx.timers.size === 0, "무한 폴링하지 않고 종료");
});

console.log("\n" + "-".repeat(52));
if (fail) {
  console.log(`❌ TTS 음성 선택 테스트 실패 (통과 ${pass}건 · 실패 ${fail}건)`);
  process.exit(1);
}
console.log(`✅ TTS 음성 선택 테스트 통과 (${pass}건)`);
