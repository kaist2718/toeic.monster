#!/usr/bin/env node
/**
 * toeic.monster 홈 UI/UX 회귀 테스트
 *
 * 사용자가 실제로 겪는 문제를 다시 만들지 않도록, index.html 의 해당 블록을 그대로 추출해
 * 가짜 브라우저 환경에서 실행하고 결과를 확인합니다.
 *
 *   1) 검색·난이도 필터(검색창)는 단어 목록 화면에서만 보입니다.
 *      — 목록이 아닌 화면에서 보이면 눌러도 화면이 바뀌지 않아 "고장"으로 보입니다.
 *   2) 단어 목록(1,000장 카드)은 목록 화면에 처음 들어갈 때 한 번만 그립니다.
 *      — 첫 화면에서 숨은 목록을 만들면 첫 입력까지 걸리는 시간이 길어집니다.
 *   3) 테마 기본값은 OS 설정(prefers-color-scheme)을 따르고, 직접 고른 값이 있으면 그 값을 우선합니다.
 *      — 정적 페이지(units/unit-01.html)도 같은 규칙을 쓰는지 함께 확인합니다.
 *
 * 실행:  node tools/test-home-ux.mjs
 * 종료 코드: 실패가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const html = read("index.html");

let failures = 0;
let checks = 0;

function ok(name) {
  checks++;
  console.log(`  ✓ ${name}`);
}
function bad(name, detail) {
  checks++;
  failures++;
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
}
function assert(cond, name, detail) {
  if (cond) ok(name);
  else bad(name, detail);
}

/** 마커 사이의 코드를 그대로 잘라 옵니다. 마커가 사라지면 테스트가 실패합니다. */
function slice(startMarker, endMarker, from = html, label = "") {
  const s = from.indexOf(startMarker);
  const e = from.indexOf(endMarker, s);
  if (s < 0 || e < 0) {
    bad(`코드 블록을 찾지 못했습니다${label ? ` (${label})` : ""}`, `${startMarker.trim().slice(0, 40)} …`);
    return "";
  }
  return from.slice(s, e);
}

/* ------------------------------------------------------------------ */
/* 1. 검색창은 목록 화면에서만 보인다                                   */
/* ------------------------------------------------------------------ */

console.log("🧭 홈 UI/UX 회귀 테스트");

console.log("\n[1] 검색창·난이도 필터 노출 범위");
{
  const code = slice('  var VIEW_IDS = [', "  function enterFlash() {", html, "showView");
  const searchbar = { style: { display: "?" } };
  const bookIntro = { style: { display: "?" } };
  const makeEl = () => ({
    classList: { toggle() {} },
    setAttribute() {},
    removeAttribute() {},
  });
  const els = {};
  const doc = {
    getElementById: (id) => (els[id] = els[id] || makeEl()),
    querySelector: (sel) =>
      sel === ".searchbar" ? searchbar : sel === ".book-intro" ? bookIntro : null,
  };
  const win = { scrollTo() {} };

  let showView = null;
  try {
    showView = new Function(
      "document",
      "window",
      `${code}\n  return showView;`,
    )(doc, win);
  } catch (e) {
    bad("showView 블록을 실행할 수 없습니다", e.message);
  }

  if (showView) {
    showView("quizView", "btnQuiz");
    assert(searchbar.style.display === "none", "퀴즈 화면에서는 검색창을 숨깁니다", `display=${searchbar.style.display}`);
    showView("flashcardView", "btnFlash");
    assert(searchbar.style.display === "none", "암기 카드 화면에서는 검색창을 숨깁니다", `display=${searchbar.style.display}`);
    showView("examView", "btnExam");
    assert(searchbar.style.display === "none", "실전 시험 화면에서는 검색창을 숨깁니다", `display=${searchbar.style.display}`);
    showView("homeView", "btnHome");
    assert(searchbar.style.display === "none", "홈 화면에서는 검색창을 숨깁니다", `display=${searchbar.style.display}`);
    showView("units", "btnList");
    assert(searchbar.style.display === "", "단어 목록 화면에서는 검색창을 보여 줍니다", `display=${searchbar.style.display}`);
    assert(bookIntro.style.display === "", "단어장 소개는 목록 화면에서 보입니다", `display=${bookIntro.style.display}`);
  }
}

/* ------------------------------------------------------------------ */
/* 2. 목록은 처음 열 때 한 번만 그린다                                  */
/* ------------------------------------------------------------------ */

console.log("\n[2] 단어 목록 지연 렌더");
{
  const code = slice("  var totalCount = 0;", "  function renderUnits(filter) {", html, "목록 렌더 지연");
  const renderCalls = [];
  const units = { innerHTML: "그려진 카드" };
  const search = { value: "apple" };
  const doc = {
    getElementById: (id) => (id === "units" ? units : id === "searchInput" ? search : null),
  };

  let api = null;
  try {
    api = new Function(
      "document",
      "renderCalls",
      `  var activeView = "quizView";
${code}
  function renderUnits(filter) { renderCalls.push(filter); }
  return {
    ensure: ensureUnitsRendered,
    invalidate: invalidateUnits,
    rendered: function () { return unitsRendered; },
    total: function () { return totalCount; },
    setActiveView: function (v) { activeView = v; }
  };`,
    )(doc, renderCalls);
  } catch (e) {
    bad("지연 렌더 블록을 실행할 수 없습니다", e.message);
  }

  if (api) {
    assert(api.rendered() === false, "처음에는 목록을 그리지 않은 상태입니다");
    api.ensure();
    assert(renderCalls.length === 1, "목록을 처음 열 때 한 번 그립니다", `${renderCalls.length}회`);
    assert(renderCalls[0] === "apple", "검색창에 입력된 값으로 그립니다", String(renderCalls[0]));
    api.ensure();
    api.ensure();
    assert(renderCalls.length === 1, "이미 그렸으면 다시 그리지 않습니다", `${renderCalls.length}회`);

    // 다른 화면에서 초기화: 비워 두고 다음에 목록을 열 때 다시 그립니다.
    api.invalidate();
    assert(
      api.rendered() === false && units.innerHTML === "",
      "다른 화면에서 초기화하면 목록을 비워 둡니다",
      `rendered=${api.rendered()} innerHTML="${units.innerHTML}"`,
    );
    api.ensure();
    assert(renderCalls.length === 2, "비운 뒤 처음 여는 시점에 다시 그립니다", `${renderCalls.length}회`);

    // 목록을 보는 중에 초기화: 빈 화면을 남기지 않고 바로 다시 그립니다.
    api.setActiveView("units");
    api.invalidate();
    assert(
      api.rendered() === true && renderCalls.length === 3 && units.innerHTML === "",
      "목록을 보는 중 초기화하면 바로 다시 그립니다",
      `rendered=${api.rendered()} 호출=${renderCalls.length}회`,
    );
  }
}

{
  const initBlock = slice("  function startApp() {", '  if (document.readyState === "loading")', html, "초기화");
  assert(
    !/renderUnits\(/.test(initBlock),
    "첫 화면에서 목록을 미리 그리지 않습니다",
    "초기화 블록에 renderUnits 호출이 남아 있습니다",
  );
  assert(
    /document\.addEventListener\("DOMContentLoaded", startApp\)/.test(html),
    "앱 초기화는 데이터 스크립트가 끝난 뒤(DOMContentLoaded)에 시작합니다",
    "defer 스크립트보다 먼저 실행되면 `all` 이 비어 화면이 빕니다",
  );
  assert(
    /IDIOMS = window\.VOCAB_IDIOMS \|\| \[\];/.test(initBlock) &&
      /GRAMMAR_BOOKS = window\.GRAMMAR_BOOKS \|\| \[\];/.test(initBlock),
    "defer 로 늦게 들어온 데이터를 초기화 때 다시 읽습니다",
    "IDIOMS·GRAMMAR_BOOKS 를 그대로 두면 속어·교재 섹션이 빕니다",
  );

  const collect = slice("  function collectUnits() {", "  // ---------- TTS(음성 합성) 공통 ----------", html, "collectUnits");
  assert(
    /totalCount\s*=\s*all\.reduce/.test(collect),
    "전체 단어 수는 목록을 그리기 전에 계산됩니다",
    "collectUnits 에서 totalCount 를 계산해야 진행률이 0%로 보이지 않습니다",
  );

  const listView = slice("  function showListView() {", "  function exitFlash() {", html, "showListView");
  assert(
    /ensureUnitsRendered\(\);/.test(listView),
    "목록 화면 진입 시 목록을 보장합니다",
    "showListView 가 ensureUnitsRendered 를 호출해야 합니다",
  );

  const unitsSwitchCount = (html.match(/showView\("units"/g) || []).length;
  assert(
    unitsSwitchCount === 1,
    "목록 화면 전환은 한 곳(showListView)에서만 일어납니다",
    `showView("units") 호출 ${unitsSwitchCount}곳`,
  );
}

/* ------------------------------------------------------------------ */
/* 3. 스크립트 로딩 — 첫 화면을 막지 않는지                              */
/* ------------------------------------------------------------------ */

console.log("\n[3] 스크립트 로딩 (defer · extra.js 지연)");
{
  const deferred = [...html.matchAll(/<script\s+defer\s+src="(data\/[^"]+)"/g)].map((m) => m[1]);
  assert(deferred.length === 34, `데이터 스크립트 34개가 defer 로 내려받습니다(현재 ${deferred.length}개)`);
  assert(
    /<script\s+defer\s+src="data\/unit01\.js"><\/script>/.test(html),
    "첫 데이터 스크립트가 defer 입니다",
    "defer 가 없으면 HTML 파싱이 550KB 스크립트를 기다립니다",
  );
  assert(
    !deferred.includes("data/extra.js"),
    "extra.js 는 첫 로드 목록에 없습니다",
    "167KB 를 첫 화면에서 빼야 전송량이 줄어듭니다",
  );
  assert(
    /s\.src = "data\/extra\.js";/.test(html),
    "extra.js 는 필요할 때(loadExtra) 불러옵니다",
    "지연 로드 코드가 없으면 확장 섹션이 비어 보입니다",
  );
  // 데이터 스크립트는 head 에 있어야 파싱과 동시에 내려받기 시작합니다.
  const head = html.slice(0, html.indexOf("</head>"));
  assert(
    /<script\s+defer\s+src="data\/unit01\.js"/.test(head),
    "데이터 스크립트가 head 에서 병렬로 내려받습니다",
    "body 끝에 두면 HTML 파싱이 끝난 뒤에야 요청이 시작됩니다",
  );
}

/* ------------------------------------------------------------------ */
/* 4. 상단바는 늘 쓰는 컨트롤만 남기고 나머지는 패널에 담는다            */
/* ------------------------------------------------------------------ */

console.log("\n[4] 상단바 구성");
{
  const header = html.slice(html.indexOf('<header class="topbar">'), html.indexOf("</header>"));
  assert(header.length > 0, "상단바 마크업을 찾았습니다", "<header class=\"topbar\"> … </header>");

  // ⋯ 더 보기 패널을 걺어내면 "늘 보이는 컨트롤"만 남습니다.
  const moreStart = header.indexOf('class="topbar-more"');
  const moreEnd = header.indexOf("</nav>");
  const alwaysVisible = moreStart >= 0 ? header.slice(0, moreStart) + header.slice(moreEnd) : header;
  // 데스크톱 기준으로 셉니다 — ☰(≤1023px 전용)와 처음엔 숨겨진 버튼(⏹ 정지)은 제외합니다.
  const desktopVisible = alwaysVisible
    .replace(/<button[^>]*\bhidden\b[^>]*>/g, "")
    .replace(/<button[^>]*class="[^"]*menu-toggle[^"]*"[^>]*>/g, "");
  const controls = (desktopVisible.match(/<(?:button|select)\b/g) || []).length;
  assert(
    controls <= 8,
    `데스크톱에서 늘 보이는 상단바 컨트롤이 8개 이하입니다(현재 ${controls}개)`,
    "컨트롤이 많으면 1024~1280px 구간에서 두 줄로 접혀 헤더가 세로 공간을 먹습니다",
  );

  const morePanel = moreStart >= 0 ? header.slice(moreStart, moreEnd) : "";
  for (const id of ["btnExam", "btnSrs", "btnListen", "btnMock", "btnDiag", "btnDash", "btnGuide", "btnVoiceHelp"]) {
    assert(new RegExp(`id="${id}"`).test(morePanel), `${id} 는 더 보기 패널 안에 있습니다`);
  }
  for (const id of ["btnHome", "btnList", "btnFlash", "btnQuiz", "btnMore"]) {
    assert(new RegExp(`id="${id}"`).test(alwaysVisible), `${id} 는 늘 보입니다`);
  }

  // 화면 전환 코드가 쓰는 버튼 id 가 모두 마크업에 한 번식 있는지(없으면 클릭 이벤트 등록이 조용히 실패합니다).
  const btnIds = (html.match(/var BTN_IDS = \[([^\]]*)\]/) || [])[1] || "";
  for (const id of [...btnIds.matchAll(/"([^"]+)"/g)].map((m) => m[1])) {
    const n = (header.match(new RegExp(`id="${id}"`, "g")) || []).length;
    assert(n === 1, `화면 전환 버튼 ${id} 가 상단바에 정확히 1개 있습니다`, `${n}개`);
  }

  // JS 가 찾는 상단바 클래스가 마크업에 실제로 있는지(클래스명이 바뀌면 null 참조로 앱이 멈춥니다).
  const topbarSelectors = [...new Set([...html.matchAll(/querySelector(?:All)?\("(\.topbar[^"]*)"/g)].map((m) => m[1]))];
  assert(topbarSelectors.length > 0, "상단바를 찾는 선택자를 확인했습니다", "querySelector(\".topbar…\")");
  for (const sel of topbarSelectors) {
    const cls = sel.slice(1).split(/[\s.>]/)[0];
    assert(
      new RegExp(`class="[^"]*\\b${cls}\\b`).test(html),
      `JS 선택자 ${sel} 의 클래스(${cls})가 마크업에 있습니다`,
      "클래스명이 바뀌면 querySelector 가 null 을 돌려줘 스크립트가 중단됩니다",
    );
  }
  // 예전 이름이 남아 있으면 위 검사가 잡기 전에 여기서 먼저 알려 줍니다.
  for (const gone of ["topbar-actions", "tts-ctrl"]) {
    assert(!new RegExp(`\\b${gone}\\b`).test(html), `예전 상단바 클래스(${gone})를 쓰지 않습니다`);
  }
}

/* ------------------------------------------------------------------ */
/* 5. 테마 기본값은 OS 설정을 따르고, 직접 고른 값이 우선한다            */
/* ------------------------------------------------------------------ */

/** 테마 인라인 스크립트를 가짜 브라우저에서 실행해 어떤 테마가 적용되는지 봅니다. */
function runThemeScript(script, stored, systemDark) {
  const classes = new Set();
  const meta = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
  const doc = {
    documentElement: { classList: { add: (c) => classes.add(c) } },
    getElementById: () => meta,
    querySelector: () => meta,
  };
  const store = {
    getItem: (k) => (k === "toeic1000_theme" ? stored : null),
    setItem() {},
    removeItem() {},
  };
  const win = {
    matchMedia: (q) => ({ matches: systemDark && /prefers-color-scheme:\s*dark/.test(q) }),
  };
  const body = script.replace(/^<script>/, "").replace(/<\/script>$/, "");
  new Function("document", "window", "localStorage", body)(doc, win, store);
  return { dark: classes.has("dark-pending"), themeColor: meta.attrs.content };
}

console.log("\n[5] 테마 기본값 (OS 설정 우선)");
{
  const appScript = (html.match(/<script>\s*\/\/ 저장된 테마[\s\S]*?<\/script>/) || [])[0];
  const staticHtml = read("units/unit-01.html");
  const staticScript = (staticHtml.match(/<script>\s*\/\/ 앱\(index\.html\)에서 고른 테마[\s\S]*?<\/script>/) || [])[0];

  if (!appScript) bad("index.html 의 테마 초기화 스크립트를 찾지 못했습니다");
  else {
    const a = runThemeScript(appScript, null, true);
    assert(a.dark && a.themeColor === "#10141b", "index.html: 고른 적이 없으면 OS 다크 모드를 따릅니다", JSON.stringify(a));
    const b = runThemeScript(appScript, null, false);
    assert(!b.dark, "index.html: OS 가 라이트면 밝은 테마로 시작합니다", JSON.stringify(b));
    const c = runThemeScript(appScript, "light", true);
    assert(!c.dark, "index.html: 직접 고른 라이트 테마가 OS 설정보다 우선합니다", JSON.stringify(c));
    const d = runThemeScript(appScript, "dark", false);
    assert(d.dark, "index.html: 직접 고른 다크 테마가 OS 설정보다 우선합니다", JSON.stringify(d));
  }

  if (!staticScript) bad("units/unit-01.html 의 테마 초기화 스크립트를 찾지 못했습니다");
  else {
    const a = runThemeScript(staticScript, null, true);
    assert(a.dark, "정적 페이지: 고른 적이 없으면 OS 다크 모드를 따릅니다", JSON.stringify(a));
    const b = runThemeScript(staticScript, "light", true);
    assert(!b.dark, "정적 페이지: 직접 고른 라이트 테마가 우선합니다", JSON.stringify(b));
  }
}

/* ------------------------------------------------------------------ */

console.log(`\n${failures ? "❌" : "✅"} 홈 UI/UX 테스트 ${failures ? `실패 ${failures}건` : `통과 (${checks}건)`}`);
process.exit(failures ? 1 : 0);
