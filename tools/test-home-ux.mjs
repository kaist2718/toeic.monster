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
 *   4) 상단바 드롭다운(모바일 ☰ 메뉴 · 데스크톱 ⋯ 더 보기 패널)이 (a) 화면보다 길어지면
 *      패널 안에서 스크롤되고(두 패널이 같은 높이 토큰을 씁니다),
 *      (b) 뒤로가기 한 번으로 "닫히기"만 하고 페이지를 떠나지 않는지,
 *      (c) 창 크기가 바뀌어 패널이 사라지는 쪽으로 넘어가면 상태를 정리하는지 확인합니다.
 *      — 예전에는 아래쪽 항목이 잘려 고를 수 없었고(모바일 375px · PC 낮은 창),
 *        뒤로가기를 누르면 곧바로 사이트를 떠났습니다.
 *   5) 「이어서 학습」은 마지막으로 본 단어부터 시작하고, 그 뒤로는 아직 안 외운 단어를
 *      유닛 순서대로 이어 갑니다. 첫 방문(기록 없음)에는 버튼 자체가 보이지 않습니다.
 *      — 1,000단어를 순서대로 외우는 사이트라 “어디서 이어서 하지”를 찾아 헤매게 했습니다.
 *
 * 실행:  node tools/test-home-ux.mjs
 * 종료 코드: 실패가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 *
 * 2026-09-18: 앱 스타일은 index.html 인라인 <style> 에서 assets/app.css 파일로 옮겼습니다
 * (docs/app-split-plan.md 1단계). CSS 규칙을 보는 검사(6-1)는 그 파일을 읽습니다.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readAppSource } from "./app-source.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
// 앱 코드는 2026-09-18 부터 assets/app.js 파일입니다(docs/app-split-plan.md 2단계).
// 이 테스트는 마크업과 앱 코드를 함께 보므로 두 파일을 이어 붙인 문자열을 html 로 씁니다
// (마크업이 앞이라 위치 기반 검사는 그대로 통합니다).
const { code: html } = readAppSource();
const css = read("assets/app.css"); // 6-1 의 CSS 규칙 검사 대상(인라인 <style> 이 아니라 파일)

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
    // reduceMotion 은 실제 스크립트에서 showView 바깥(같은 스코프)에 있는 값이라 함께 넘깁니다.
    showView = new Function(
      "document",
      "window",
      "reduceMotion",
      `${code}\n  return showView;`,
    )(doc, win, false);
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
  // 32개 = 단어 30 + 숙어 + data/app-data.js(앱 학습 데이터).
  // 문법·회화 교재 6파일은 첫 화면에 필요 없어 앱이 필요할 때 받아옵니다(loadBooks).
  assert(deferred.length === 32, `데이터 스크립트 32개가 defer 로 내려받습니다(현재 ${deferred.length}개)`);
  assert(
    !deferred.some((f) => /(?:grammar|conversation)-/.test(f)),
    "교재 데이터(문법·회화 6파일)는 첫 로드 목록에 없습니다",
    "첫 화면에 필요 없는 78KB(gzip) 를 빼야 전송량이 줄어듭니다",
  );
  assert(
    /\[\"data\/grammar-basic\.js\", \"data\/grammar-intermediate\.js\", \"data\/grammar-advanced\.js\"\]/.test(html) &&
      /function loadBooks\(kind, cb\)/.test(html),
    "교재 데이터는 필요할 때(loadBooks) 불러옵니다",
    "지연 로드 코드가 없으면 교재 카드·문항이 빈 상태로 남습니다",
  );
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
/* 6. 모바일 햄버거 메뉴 — 스크롤 가능 + 뒤로가기로 닫기                 */
/* ------------------------------------------------------------------ */

console.log("\n[6] 모바일 햄버거 메뉴 (스크롤 · 뒤로가기)");
{
  // 6-1. 항목이 화면보다 길어지면 메뉴 안에서 스크롤할 수 있어야 합니다.
  const mobileCss = slice("@media (max-width: 1023px) {", ".skip-link {", css, "모바일 메뉴 CSS");
  const navCss = (mobileCss.match(/\.topbar-nav\s*\{[^}]*\}/) || [""])[0];
  assert(/max-height:\s*[^;]+;/.test(navCss), "메뉴 패널에 최대 높이가 있습니다(화면 밖으로 넘치지 않음)", navCss.slice(0, 60));
  assert(
    /overflow-y:\s*auto/.test(navCss),
    "메뉴 패널이 넘치면 안에서 스크롤됩니다(아래 항목을 고를 수 있음)",
    "overflow 가 없으면 잘린 항목은 영영 누를 수 없습니다",
  );
  assert(
    /\.topbar-nav\.open\s+\.btn\.active/.test(css),
    "펼친 메뉴에서 지금 보고 있는 화면을 왼쪽 띠로 표시합니다",
    "열어 놓고도 내가 어느 화면에 있는지 알기 어렵습니다",
  );
  assert(
    /body\.menu-open\s*\{\s*overflow:\s*hidden/.test(mobileCss),
    "메뉴가 열려 있는 동안 뒤 화면 스크롤을 막습니다",
    "뒤 화면이 따라 움직이면 메뉴 항목을 짚기 어렵습니다",
  );

  // 6-1b. 데스크톱 PC 의 ⋯ 더 보기 패널도 같은 규칙이어야 합니다.
  //       상단바는 고정(sticky)이라 페이지를 스크롤해도 패널이 붙어 다니므로,
  //       높이를 제한하지 않으면 창이 낮을 때 아래쪽 항목(진단·대시보드·가이드)을 고를 수 없습니다.
  const desktopCss = slice("@media (min-width: 1024px) {", "/* ---------- 모바일·태블릿 햄버거 메뉴 ---------- */", css, "데스크톱 ⋯ 패널 CSS");
  const moreCss = (desktopCss.match(/\.topbar-more\.open\s*\{[^}]*\}/) || [""])[0];
  assert(moreCss.length > 0, "데스크톱 ⋯ 더 보기 패널 규칙을 찾았습니다", "@media (min-width: 1024px)");
  assert(
    /max-height:\s*var\(--menu-panel-max-h\)/.test(moreCss),
    "데스크톱 ⋯ 더 보기 패널도 높이를 화면에 맞춰 제한합니다",
    "제한이 없으면 창이 낮을 때 아래 항목이 화면 밖으로 나가 고를 수 없습니다",
  );
  assert(
    /overflow-y:\s*auto/.test(moreCss),
    "데스크톱 ⋯ 더 보기 패널도 넘치면 안에서 스크롤됩니다",
    moreCss.slice(0, 60),
  );
  // 두 패널이 같은 값을 쓰도록 한 곳에 둔 토큰인지(한쪽만 고쳐지는 일 방지)
  const sharedUses = (css.match(/max-height:\s*var\(--menu-panel-max-h\)/g) || []).length;
  assert(sharedUses === 2, `☰ 메뉴와 ⋯ 패널이 같은 높이 토큰을 씁니다(${sharedUses}곳)`);
  assert(
    /--menu-panel-max-h:\s*min\(74vh/.test(css),
    "높이 토큰은 뷰포트 기준(74vh·dvh)으로 정의돼 있습니다",
    "dvh 를 모르는 브라우저를 위해 vh 대체값도 함께 둡니다",
  );

  // 6-2. 메뉴 동작(열기·닫기·뒤로가기)을 가짜 브라우저에서 그대로 실행합니다.
  function makeEl(id, children = []) {
    const classes = new Set();
    const el = {
      id,
      textContent: "",
      attrs: {},
      handlers: {},
      children,
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        contains: (c) => classes.has(c),
        toggle: (c) => (classes.has(c) ? (classes.delete(c), false) : (classes.add(c), true)),
      },
      setAttribute(k, v) { el.attrs[k] = v; },
      removeAttribute(k) { delete el.attrs[k]; },
      addEventListener(t, fn) { (el.handlers[t] = el.handlers[t] || []).push(fn); },
      focus() { doc.activeElement = el; },
      contains: (node) => node === el || children.includes(node),
      querySelector: () => children[0] || null,
    };
    return el;
  }

  const firstItem = makeEl("btnHome");
  const els = {
    btnMenu: makeEl("btnMenu"),
    topbarNav: makeEl("topbarNav", [firstItem]),
    btnMore: makeEl("btnMore"),
    topbarMore: makeEl("topbarMore"),
  };
  const docHandlers = {};
  const winHandlers = {};
  const history = { pushes: 0, backs: 0, pushState: () => history.pushes++, back: () => history.backs++ };
  const doc = {
    getElementById: (id) => els[id] || null,
    addEventListener: (t, fn) => (docHandlers[t] = docHandlers[t] || []).push(fn),
    activeElement: null,
    body: makeEl("body"),
  };
  const win = {
    history,
    innerWidth: 375,
    addEventListener: (t, fn) => (winHandlers[t] = winHandlers[t] || []).push(fn),
  };

  const menuCode = slice(
    "  // ---------- 상단바 메뉴: 모바일",
    "  // ---------- 홈 랜딩 ----------",
    html,
    "상단바 메뉴",
  );
  try {
    new Function("document", "window", menuCode)(doc, win);
  } catch (e) {
    bad("상단바 메뉴 블록을 실행할 수 없습니다", e.message);
  }

  const evt = (extra = {}) => ({ stopPropagation() {}, preventDefault() {}, ...extra });
  const clickMenu = () => els.btnMenu.handlers.click[0](evt());
  const pressEsc = () => docHandlers.keydown[0](evt({ key: "Escape" }));
  const goBack = () => winHandlers.popstate[0](evt());
  const navOpen = () => els.topbarNav.classList.contains("open");

  // 열기: 패널 표시 + 첫 항목으로 초점 + 스크롤 고정 + history 항목 1개
  clickMenu();
  assert(navOpen() && els.btnMenu.attrs["aria-expanded"] === "true", "☰ 를 누르면 메뉴가 열리고 aria-expanded=true 가 됩니다");
  assert(doc.body.classList.contains("menu-open"), "메뉴가 열리면 뒤 화면 스크롤을 막습니다");
  assert(doc.activeElement === firstItem, "메뉴가 열리면 첫 항목으로 초점이 옴깁니다(키보드 사용자)");
  assert(history.pushes === 1, "메뉴를 열 때 뒤로가기용 history 항목을 하나 빌립니다");

  // 뒤로가기: 메뉴만 닫히고 페이지는 그대로(추가 back() 호출 없음)
  goBack();
  assert(!navOpen(), "뒤로가기를 누르면 메뉴가 닫힙니다");
  assert(history.backs === 0, "뒤로가기로 닫힐 때는 history 를 다시 건드리지 않습니다(주소 유지)");
  assert(doc.activeElement === els.btnMenu, "닫히면 초점이 ☰ 버튼으로 돌아옵니다");
  assert(!doc.body.classList.contains("menu-open"), "닫히면 뒤 화면 스크롤 제한도 풀립니다");

  // 다시 열고 Esc 로 닫기 — 빌려 둔 history 항목은 스스로 돌려줍니다
  clickMenu();
  pressEsc();
  assert(!navOpen(), "Esc 키로도 메뉴가 닫힙니다");
  assert(history.backs === 1 && history.pushes === 2, "직접 닫을 때는 빌린 history 항목을 되돌려줍니다");

  // 항목을 고르면 닫히고, 그 항목으로 시선이 가도록 초점은 그대로 둡니다
  clickMenu();
  const itemBtn = makeEl("btnList");
  const itemEvent = evt({ target: itemBtn });
  itemBtn.closest = (sel) => (sel === ".topbar-nav .btn" ? itemBtn : null);
  doc.activeElement = itemBtn;
  els.topbarNav.contains = (node) => node === els.topbarNav || node === firstItem || node === itemBtn;
  docHandlers.click[0](itemEvent);
  assert(!navOpen(), "메뉴 항목을 고르면 메뉴가 닫힙니다");
  assert(doc.activeElement === itemBtn, "항목을 골라 닫힌 경우에는 초점을 빼앗지 않습니다");

  // 화면이 넓어져 햄버거가 사라지면 드롭다운도 닫힙니다
  clickMenu();
  win.innerWidth = 1280;
  winHandlers.resize[0](evt());
  assert(!navOpen(), "데스크톱 폭으로 넓어지면 모바일 메뉴가 닫힙니다");

  // 반대로 ⋯ 더 보기 패널을 열어 둔 채 창을 좁히면 패널도 정리됩니다.
  // 좁힌 폭에서는 패널 내용이 ☰ 메뉴 안으로 합쳐져 안 보이는데, "열림" 상태로 남으면
  // 뒤로가기 항목을 계속 붙들고 있어 한 번 눌러도 아무 일이 없었습니다.
  const moreOpen = () => els.topbarMore.classList.contains("open");
  els.btnMore.handlers.click[0](evt());
  assert(moreOpen(), "넓은 화면에서 ⋯ 더 보기를 누르면 패널이 열립니다");
  win.innerWidth = 900;
  winHandlers.resize[0](evt());
  assert(!moreOpen(), "창을 좁히면(☰ 메뉴로 합쳐지면) 더 보기 패널이 상태를 정리합니다");
}

/* ------------------------------------------------------------------ */
/* 5. 이어서 학습 — 마지막으로 본 단어부터 이어 간다                     */
/* ------------------------------------------------------------------ */

console.log("\n[5] 이어서 학습 순서");
{
  const code = slice(
    "  function resumeOrder(words, learnedMap, last) {",
    "  // ---------- 암기 카드 모드 ----------",
    html,
    "이어서 학습",
  );
  const W = (name) => [name];
  const flat = (list) => list.map((w) => w[0]).join(",");

  let resumeOrder = null;
  try {
    resumeOrder = new Function(`${code}\n  return resumeOrder;`)();
  } catch (e) {
    bad("resumeOrder 블록을 실행할 수 없습니다", e.message);
  }

  if (resumeOrder) {
    const words = [W("alpha"), W("bravo"), W("charlie"), W("delta")];
    const learnedMap = { alpha: "2026-09-01" };

    assert(
      flat(resumeOrder(words, learnedMap, "charlie")) === "charlie,bravo,delta",
      "마지막으로 본 단어부터, 나머지는 유닛 순서대로 이어 갑니다",
      flat(resumeOrder(words, learnedMap, "charlie")),
    );
    assert(
      flat(resumeOrder(words, learnedMap, "alpha")) === "bravo,charlie,delta",
      "이미 외운 단어가 마지막 기록이면 건너뜁니다",
      flat(resumeOrder(words, learnedMap, "alpha")),
    );
    assert(
      flat(resumeOrder(words, {}, "")) === "alpha,bravo,charlie,delta",
      "기록이 없으면(첫 방문) 유닛 순서 그대로 시작합니다",
      flat(resumeOrder(words, {}, "")),
    );
    assert(
      resumeOrder(words, { alpha: 1, bravo: 1, charlie: 1, delta: 1 }, "bravo").length === 0,
      "전부 외우면 빈 목록을 돌려줍니다(호출부가 복습으로 안내)",
    );
    assert(
      flat(resumeOrder(words, {}, "alpha")) === "alpha,bravo,charlie,delta",
      "마지막 단어가 이미 맨 앞이면 순서를 건드리지 않습니다",
      flat(resumeOrder(words, {}, "alpha")),
    );
  }
}

/* ------------------------------------------------------------------ */
/* 6. 홈 목차 묶음의 펼침 상태를 기억한다                               */
/* ------------------------------------------------------------------ */

console.log("\n[6] 홈 묶음 펼침 상태 기억");
{
  const code = slice(
    '  var HOME_GROUP_KEY = "toeic1000_homegroups";',
    "  // 섹션 메뉴: 자주 쓰는 8개만 먼저 보여 주고",
    html,
    "묶음 상태 저장",
  );
  const IDS = ["home-group-vocab", "home-group-part", "home-group-speak", "home-group-manage"];

  /** 실제 저장소 대신 메모리 객체를 씁니다(테스트가 브라우저 저장소를 건드리지 않도록). */
  const run = (seed) => {
    const store = { ...seed };
    const storage = {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
    };
    const groups = IDS.map((id) => ({
      id,
      open: id === "home-group-vocab", // HTML 기본값: 어휘 묶음만 펼침
      listeners: {},
      addEventListener(type, fn) { this.listeners[type] = fn; },
    }));
    const doc = { querySelectorAll: () => groups };
    // homeGroups·printing 은 실제 스크립트에서 이 블록 바로 위에 선언된 값이라 함께 넘깁니다.
    new Function(
      "document",
      "localStorage",
      `  var printing = false;\n  var homeGroups = [].slice.call(document.querySelectorAll("#homeView details.home-group"));\n${code}`,
    )(doc, storage);
    return { groups, store };
  };
  const openedIds = (groups) => groups.filter((g) => g.open).map((g) => g.id).join(",");

  const fresh = run({});
  assert(
    openedIds(fresh.groups) === "home-group-vocab",
    "저장된 값이 없으면 기본값(어휘 묶음만 펼침)을 유지합니다",
    openedIds(fresh.groups),
  );

  const restored = run({
    toeic1000_homegroups: JSON.stringify({ "home-group-part": true, "home-group-manage": true }),
  });
  assert(
    openedIds(restored.groups) === "home-group-vocab,home-group-part,home-group-manage",
    "저장된 펼침 상태를 복원하고, 저장에 없는 묶음은 HTML 기본값을 따릅니다",
    openedIds(restored.groups),
  );

  // false("접힘")도 저장된 값이므로 무시하면 안 됩니다(기본값이 펼침인 묶음이 되살아납니다).
  const collapsed = run({ toeic1000_homegroups: JSON.stringify({ "home-group-vocab": false }) });
  assert(
    openedIds(collapsed.groups) === "",
    "접힌 상태(false)도 저장된 대로 반영합니다",
    openedIds(collapsed.groups),
  );

  const afterToggle = run({});
  afterToggle.groups[1].open = true;
  afterToggle.groups[1].listeners.toggle();
  const saved = JSON.parse(afterToggle.store.toeic1000_homegroups || "{}");
  assert(
    saved["home-group-part"] === true && saved["home-group-vocab"] === true,
    "묶음을 펼치면 그 상태를 저장합니다",
    afterToggle.store.toeic1000_homegroups,
  );

  const broken = run({ toeic1000_homegroups: "{깨진 JSON" });
  assert(
    openedIds(broken.groups) === "home-group-vocab",
    "저장된 값이 깨져 있어도 기본값으로 시작합니다(앱이 멈추지 않음)",
    openedIds(broken.groups),
  );
}

/* ------------------------------------------------------------------ */
/* 7. 교재 과 페이지에서 넘어오는 딥링크를 읽는다                       */
/* ------------------------------------------------------------------ */

console.log("\n[7] 교재 → 앱 딥링크 (?level=·&ch=)");
{
  const linkCode = slice("  function parseDeepLink(search) {", "  /**\n   * 딥링크로 받은 과 번호가", html, "딥링크 파싱");
  const chapterCode = slice(
    "  function resolveChapter(books, level, ch) {",
    "  /** 지금 과 필터가 걸려 있으면",
    html,
    "과 번호 검증",
  );

  let parseDeepLink = null;
  let resolveChapter = null;
  try {
    parseDeepLink = new Function(`${linkCode}\n  return parseDeepLink;`)();
    resolveChapter = new Function(`${chapterCode}\n  return resolveChapter;`)();
  } catch (e) {
    bad("딥링크 블록을 실행할 수 없습니다", e.message);
  }

  if (parseDeepLink && resolveChapter) {
    const withCh = parseDeepLink("?level=basic&ch=5");
    assert(
      withCh && withCh.level === "basic" && withCh.chapter === 5,
      "낱개 과 페이지 링크에서 단계와 과 번호를 읽습니다",
      JSON.stringify(withCh),
    );

    const levelOnly = parseDeepLink("?level=advanced");
    assert(
      levelOnly && levelOnly.level === "advanced" && levelOnly.chapter === 0,
      "과 번호가 없으면 그 단계 전체로 들어옵니다",
      JSON.stringify(levelOnly),
    );

    assert(parseDeepLink("?ch=5") === null, "단계 없는 링크(?ch=5)는 무시합니다");
    assert(parseDeepLink("#grammar-quiz") === null, "쿼리 없는 주소는 그냥 홈입니다");
    assert(parseDeepLink("?level=초급") === null, "단계 이름이 다르면(초급) 무시합니다");

    // 회화 교재도 같은 형태의 링크를 씁니다(book=conversation 으로 구분).
    const conv = parseDeepLink("?book=conversation&level=basic&ch=3#conversation-quiz");
    assert(
      conv && conv.book === "conversation" && conv.level === "basic" && conv.chapter === 3,
      "회화 교재 링크는 book=conversation 으로 구분합니다",
      JSON.stringify(conv),
    );
    const legacy = parseDeepLink("?level=advanced");
    assert(
      legacy && legacy.book === "grammar",
      "book 이 없는 예전 링크는 문법 교재로 봅니다",
      JSON.stringify(legacy),
    );

    const books = [{ id: "basic", chapters: [{ no: 1 }, { no: 5 }, { no: 12 }] }];
    assert(resolveChapter(books, "basic", 5) === 5, "교재에 있는 과 번호는 그대로 씁니다");
    assert(resolveChapter(books, "basic", 99) === 0, "없는 과 번호(ch=99)는 전체 과로 돌립니다");
    assert(resolveChapter(books, "advanced", 5) === 0, "그 단계에 없는 과는 전체 과로 돌립니다");
  }
}

/* ------------------------------------------------------------------ */

console.log(`\n${failures ? "❌" : "✅"} 홈 UI/UX 테스트 ${failures ? `실패 ${failures}건` : `통과 (${checks}건)`}`);
process.exit(failures ? 1 : 0);
