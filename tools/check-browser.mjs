#!/usr/bin/env node
/**
 * 실제 브라우저 점검 — 헤드리스 Chrome 으로 index.html 을 열어 계측합니다.
 *
 * 왜 필요한가:
 *   `npm run audit`(정적 검사)와 `npm test`(DOM 을 흉내 낸 테스트)는 "코드에 적힌 것"만 봅니다.
 *   그런데 이 사이트에서 실제로 깨지는 것은 대부분 **실행 결과**입니다.
 *   예: 스크립트 실행 순서(defer), CSS 미디어 쿼리, OS 다크 모드 기본값, 뷰 전환 뒤의 표시 상태.
 *   그래서 진짜 브라우저를 띄워 아래를 확인합니다.
 *     1) 첫 로드에 자바스크립트 오류·실패한 요청이 없는지
 *     2) 첫 화면이 숨은 단어 카드 1,000장을 그리지 않는지(목록을 열 때만 그리는지)
 *     3) 검색창·난이도 필터가 목록 화면에서만 보이는지
 *     4) 상단바가 한 줄로 유지되는지(컨트롤 개편 뒤 회귀 방지)
 *     5) OS 다크 모드에서 첫 페인트가 다크인지, 직접 고른 값은 저장되는지
 *     6) 모바일 폭에서 가로 넘침·필터 스크롤 단서(mask)가 있는지,
 *        햄버거 메뉴가 스크롤되고 뒤로가기로만 닫히는지(페이지를 떠나지 않는지)
 *     7) 정적 페이지(단어장·문법·가이드·404)가 공용 스타일을 실제로 적용하고,
 *        좁은 화면에서 넘치지 않으며, 예문 듣기 버튼(speak.js)이 반응하는지
 *
 * 실행:  node tools/check-browser.mjs            (Chrome 이 없으면 건너뜁니다)
 *        CHROME_BIN=/path/to/chrome node tools/check-browser.mjs
 *        node tools/check-browser.mjs --site-root _site   (배포본 점검 — npm run check:staged)
 *        node tools/check-browser.mjs --live              (배포된 사이트 점검)
 * 종료 코드: 문제가 있으면 1, 없으면 0 (CI 필수 단계는 아닙니다 — 로컬·배포 전 점검용)
 *
 * 외부 의존성 없음(Node 내장 모듈 + DevTools 프로토콜만 사용).
 */

import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".txt": "text/plain;charset=utf-8",
};

const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);
const note = (msg) => notes.push(msg);
const check = (ok, msg) => (ok ? note(`✓ ${msg}`) : fail(msg));

/* ------------------------------------------------------------------ */
/* 1. Chrome 찾기                                                      */
/* ------------------------------------------------------------------ */

const CANDIDATES = [
  process.env.CHROME_BIN,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/snap/bin/chromium",
].filter(Boolean);

const chromePath = CANDIDATES.find((p) => fs.existsSync(p));
if (!chromePath) {
  console.log("ℹ️  Chrome 을 찾지 못해 브라우저 점검을 건너뜁니다 (CHROME_BIN 으로 지정할 수 있습니다).");
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/* 2. 임시 서버 + 헤드리스 Chrome 실행                                 */
/* ------------------------------------------------------------------ */

/* --live 이면 로컬 서버 대신 배포된 사이트를 그대로 점검합니다. */
const LIVE = process.argv.includes("--live");
const LIVE_SITE = "https://toeic.monster";

/* --site-root <dir>: 저장소 루트 대신 그 폴더를 서빙합니다(_site 배포본 점검용).
   배포본은 인라인 CSS 분리·HTML 최소화를 거치므로, 원본만 점검하면 배포에서만
   깨지는 것(분리한 CSS 경로·최소화가 건드린 마크업)을 놓칩니다. */
const rootArg = process.argv.findIndex((a) => a === "--site-root" || a.startsWith("--site-root="));
const SITE_ROOT = (() => {
  if (rootArg < 0) return ROOT;
  const raw = process.argv[rootArg].includes("=")
    ? process.argv[rootArg].split("=").slice(1).join("=")
    : process.argv[rootArg + 1] || "";
  const dir = path.resolve(ROOT, raw);
  if (!raw || !fs.existsSync(dir)) {
    console.log(`❌ --site-root 폴더가 없습니다 — ${raw || "(값 없음)"} (npm run stage 를 먼저 돌리세요)`);
    process.exit(1);
  }
  return dir;
})();
const SERVING = SITE_ROOT === ROOT ? ROOT : `${path.relative(ROOT, SITE_ROOT) || "."}/`;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(SITE_ROOT, p);
  if (!f.startsWith(SITE_ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404, { "content-type": "text/plain;charset=utf-8" });
    res.end("not found");
    return;
  }
  res.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const sitePort = server.address().port;
/** 점검 대상 주소 — 로컬 빌드 또는 배포된 사이트. */
const BASE = LIVE ? LIVE_SITE : `http://127.0.0.1:${sitePort}`;

const profile = path.join(os.tmpdir(), `toeic-browser-check-${process.pid}`);
fs.rmSync(profile, { recursive: true, force: true });
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profile}`,
    "--remote-debugging-port=0",
    "about:blank",
  ],
  { stdio: "ignore" },
);

/** Chrome 이 고른 디버깅 포트를 DevToolsActivePort 파일에서 읽습니다. */
async function debuggerPort() {
  const file = path.join(profile, "DevToolsActivePort");
  for (let i = 0; i < 100; i++) {
    if (fs.existsSync(file)) {
      const [port] = fs.readFileSync(file, "utf8").split("\n");
      if (port) return Number(port);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome DevTools 에 연결하지 못했습니다.");
}

const cdp = `http://127.0.0.1:${await debuggerPort()}`;

/** 이 인스턴스만 닫습니다(사용자가 쓰는 Chrome 은 건드리지 않습니다). */
async function shutdown() {
  try {
    const v = await (await fetch(cdp + "/json/version")).json();
    const ws = new WebSocket(v.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    ws.send(JSON.stringify({ id: 1, method: "Browser.close" }));
    await new Promise((r) => setTimeout(r, 1000));
  } catch {
    /* 무시 */
  }
  chrome.kill();
  server.close(); // --live 에서도 열어 둔 서버를 닫습니다(요청은 없었지만 포트는 반납).
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* Windows 에서 가끔 잠겨 있습니다 — 임시 폴더라 무해합니다. */
  }
}

/* ------------------------------------------------------------------ */
/* 3. 페이지 열고 계측                                                 */
/* ------------------------------------------------------------------ */

const site = `${BASE}/index.html`;
const target = await (await fetch(`${cdp}/json/new?${encodeURIComponent(site)}`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method) {
    events.push(msg);
  }
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

const send = (method, params = {}) =>
  new Promise((res) => {
    const id = ++nextId;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) {
    throw new Error(
      "페이지 평가 실패: " +
        r.result.exceptionDetails.text +
        " :: " +
        (r.result.exceptionDetails.exception?.description || ""),
    );
  }
  return r.result?.result?.value;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 부드러운 이동(smooth scroll)이 멈출 때까지 기다립니다.
 * 거리가 길면(목차에서 44,000px 아래 섹션으로 이동) 고정 대기만으로는 모자라
 * 기계가 바쁠 때 간간히 실패합니다. 실제로 멈춘 것을 보고 재도록 바꿉니다.
 */
async function waitForScrollSettle({ timeout = 8000, initial = 1000 } = {}) {
  await wait(initial);
  let last = await evaluate("Math.round(window.pageYOffset)");
  let stable = 0;
  const until = Date.now() + timeout;
  while (Date.now() < until && stable < 4) {
    await wait(200);
    const y = await evaluate("Math.round(window.pageYOffset)");
    stable = Math.abs(y - last) < 2 ? stable + 1 : 0;
    last = y;
  }
  return last;
}

try {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 820, deviceScaleFactor: 1, mobile: false });
  await send("Page.reload", { ignoreCache: true });

  // 첫 화면이 실제로 그려질 때까지 기다립니다(고정 대기 시간에 기대지 않도록).
  for (let i = 0; i < 60; i++) {
    if ((await evaluate(`document.querySelectorAll("#homeView .home-section").length`)) >= 53) break;
    await wait(500);
  }
  await wait(1000);

  // 「확장 홈」(회화 교재 카드 등)은 requestIdleCallback + data/extra.js(167KB) 로딩 뒤에 그려집니다.
  // 고정 시간에 기대면 브라우저가 바쁠 때 0장으로 보입니다 — 실제로 그려질 때까지 기다립니다.
  for (let i = 0; i < 40; i++) {
    if ((await evaluate(`document.querySelectorAll("#conversationBookGrid > *").length`)) > 0) break;
    await wait(250);
  }

  /* 3-1. 데스크톱 첫 화면 */
  const desktop = await evaluate(`(() => {
    const q = (s) => document.querySelectorAll(s).length;
    const inner = document.querySelector(".topbar-inner");
    // 줄 수는 "세로 구간이 겹치는가"로 셈니다 — 위쪽 좌표만 보면 가운데 정렬된 요소를
    // 다른 줄로 잘못 세게 됩니다(높이가 작아 top 이 더 아래).
    const boxes = [...inner.children]
      .filter((c) => c.getBoundingClientRect().width > 0)
      .map((c) => {
        const b = c.getBoundingClientRect();
        return [b.top, b.bottom];
      })
      .sort((a, b) => a[0] - b[0]);
    const lines = [];
    for (const box of boxes) {
      const last = lines[lines.length - 1];
      if (last && box[0] < last[1] - 2) last[1] = Math.max(last[1], box[1]);
      else lines.push([box[0], box[1]]);
    }
    return {
      headerHeight: Math.round(inner.getBoundingClientRect().height),
      headerLines: lines.length,
      quickButtons: q(".topbar-quick .btn"),
      moreButtons: q("#topbarMore .btn"),
      navVisible: document.querySelector("#topbarNav") ? getComputedStyle(document.querySelector("#topbarNav")).display : "-",
      homeSections: q("#homeView .home-section"),
      renderedAtHome: q("#units .card"),
      searchbar: getComputedStyle(document.querySelector(".searchbar")).display,
      prerenderedConfusables: q("#confuseGrid > *"),
      prerenderedFrequency: q("#freqGrid > *"),
      conversationCards: q("#conversationBookGrid > *"),
    };
  })()`);

  check(desktop.homeSections === 53, `홈 섹션 53개가 그려졌습니다 (${desktop.homeSections}개)`);
  check(desktop.renderedAtHome === 0, `첫 화면에 숨은 단어 카드를 그리지 않습니다 (${desktop.renderedAtHome}장)`);
  check(desktop.conversationCards === 4, `회화 교재 카드가 그려졌습니다 (${desktop.conversationCards}장 · 교재 3권 + 허브)`);
  check(desktop.searchbar === "none", "홈에서는 검색창·난이도 필터가 숨겨져 있습니다");
  check(desktop.headerLines <= 2, `상단바가 ${desktop.headerLines}줄입니다 (1100px 에서 ${desktop.headerHeight}px)`);
  note(`첫 화면 프리렌더 — 혼동어휘 ${desktop.prerenderedConfusables}개 · 빈도어휘 ${desktop.prerenderedFrequency}개`);

  /* 3-2. 화면 전환 — 검색창은 목록에서만 */
  const views = {};
  for (const [id, name] of [
    ["btnList", "목록"],
    ["btnQuiz", "퀴즈"],
    ["btnFlash", "암기"],
    ["btnExam", "시험"],
    ["btnDash", "대시보드"],
    ["btnHome", "홈"],
  ]) {
    await evaluate(`document.getElementById("${id}").click()`);
    await wait(300);
    views[name] = await evaluate(
      `getComputedStyle(document.querySelector(".searchbar")).display`,
    );
  }
  const wrong = Object.entries(views).filter(([name, d]) => (name === "목록" ? d === "none" : d !== "none"));
  check(wrong.length === 0, `검색창 노출 범위(목록에서만): ${Object.entries(views).map(([k, v]) => k + "=" + v).join(" ")}`);

  /* 3-2b. ⋯ 더 보기 패널 */
  await evaluate(`document.getElementById("btnMore").click()`);
  await wait(250);
  const morePanel = await evaluate(`(() => {
    const p = document.getElementById("topbarMore");
    const b = p.querySelector(".btn");
    const r = b.getBoundingClientRect();
    return {
      open: p.classList.contains("open"),
      visible: r.width > 0 && r.height > 0,
      expanded: document.getElementById("btnMore").getAttribute("aria-expanded"),
      buttons: p.querySelectorAll(".btn").length,
    };
  })()`);
  check(morePanel.open && morePanel.visible, `⋯ 더 보기 패널이 열리고 항목 ${morePanel.buttons}개가 보입니다`);
  check(morePanel.expanded === "true", "더 보기 버튼의 aria-expanded 가 열림으로 바뀝니다");
  await evaluate(`document.body.click()`);
  await wait(200);
  check(
    await evaluate(`!document.getElementById("topbarMore").classList.contains("open")`),
    "다른 곳을 누르면 더 보기 패널이 닫힙니다",
  );

  /* 3-2c. 창 높이가 낮은 PC — ⋯ 더 보기 패널이 화면 안에서 스크롤되는지 */
  // 패널은 고정(sticky) 상단바에 붙어 있어 페이지를 스크롤해도 따라옵니다.
  // 높이 제한도 스크롤도 없으면, 화면보다 길어질 때 아래 항목(진단·대시보드·가이드)은
  // 화면 밖에 남아 아예 고를 수 없었습니다(실제 PC 에서 신고된 문제).
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 640, deviceScaleFactor: 1, mobile: false });
  await wait(400);
  const moreShort = await evaluate(`(() => {
    document.getElementById("btnMore").click();
    const p = document.getElementById("topbarMore");
    const before = p.getBoundingClientRect();
    const cs = getComputedStyle(p);
    const info = {
      bottom: Math.round(before.bottom),
      vh: innerHeight,
      overflowY: cs.overflowY,
      scrollable: p.scrollHeight - p.clientHeight,
    };
    p.scrollTop = p.scrollHeight;                       // 맨 아래 항목까지 내려 본다
    const after = p.getBoundingClientRect();
    const last = [...p.querySelectorAll(".btn")].pop().getBoundingClientRect();
    info.scrolledBy = Math.round(p.scrollTop);
    info.lastReachable = last.bottom <= after.bottom + 1 && last.top >= after.top - 1 && last.bottom <= innerHeight + 1;
    document.body.click();
    return info;
  })()`);
  check(
    moreShort.overflowY === "auto",
    `창이 낮을 때(1280×640) ⋯ 패널이 스크롤할 수 있습니다 (overflow-y: ${moreShort.overflowY})`,
  );
  check(
    moreShort.bottom <= moreShort.vh + 1,
    `⋯ 패널이 화면 높이 안에 들어옵니다 (아래 ${moreShort.bottom}px ≤ 화면 ${moreShort.vh}px)`,
  );
  check(
    moreShort.scrollable > 0 && moreShort.scrolledBy === moreShort.scrollable,
    `스크롤하면 ⋯ 패널의 마지막 항목까지 닿습니다 (넘치는 높이 ${moreShort.scrollable}px)`,
  );
  check(moreShort.lastReachable, "스크롤 후 ⋯ 패널의 마지막 항목이 패널·화면 안에 들어옵니다");
  await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 820, deviceScaleFactor: 1, mobile: false });
  await wait(300);

  /* 3-3. 목록을 열면 그때 그려지는지 */
  await evaluate(`document.getElementById("btnList").click()`);
  await wait(600);
  const cards = await evaluate(`document.querySelectorAll("#units .card").length`);
  check(cards === 1000, `목록을 처음 열 때 단어 카드 ${cards}장을 그립니다 (1,000장이어야 함)`);

  /* 3-3b. 영어 단어·예문에 lang="en" (화면 낭독기가 한국어 음성으로 영어를 읽지 않도록) */
  const langTags = await evaluate(`({
    words: document.querySelectorAll("#units .w[lang=en]").length,
    examples: document.querySelectorAll("#units .ex-text[lang=en]").length,
    flash: document.querySelectorAll("#fcWord[lang=en], #fcEx[lang=en]").length,
    icons: document.querySelectorAll("#units .w .unit-emoji").length,
  })`);
  check(
    langTags.words === 1000 && langTags.examples === 1000 && langTags.flash === 2,
    `영어 단어·예문에 lang="en" 이 붙어 있습니다 (단어 ${langTags.words} · 예문 ${langTags.examples} · 암기카드 ${langTags.flash})`,
  );
  note(`단어 칸에 유닛 아이콘 ${langTags.icons}개가 붙어 있습니다(낭독에서는 제외)`);
  await evaluate(`document.getElementById("btnHome").click()`);

  /* 3-4. 모바일 폭 */
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 720, deviceScaleFactor: 2, mobile: true });
  await wait(500);
  const mobile = await evaluate(`(() => {
    const inner = document.querySelector(".topbar-inner");
    const bar = document.querySelector(".levelbar");
    const mask = bar ? (getComputedStyle(bar).maskImage || getComputedStyle(bar).webkitMaskImage || "") : "";
    return {
      headerHeight: Math.round(inner.getBoundingClientRect().height),
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      levelScrollable: bar ? bar.scrollWidth - bar.clientWidth : 0,
      levelMask: mask && mask !== "none",
      offenders: [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 5)
        .map((el) => (el.id ? "#" + el.id : el.className ? "." + String(el.className).split(" ")[0] : el.tagName.toLowerCase())),
    };
  })()`);
  check(
    mobile.pageOverflow <= 0,
    `375px 폭에서 가로 넘침이 없습니다 (${mobile.pageOverflow}px` +
      (mobile.offenders.length ? ` · 넘치는 요소: ${[...new Set(mobile.offenders)].join(", ")}` : "") +
      ")",
  );
  check(mobile.levelScrollable <= 0 || mobile.levelMask, "좁은 화면의 난이도 필터에 스크롤 단서(mask)가 있습니다");
  note(`모바일(375px) 상단바 ${mobile.headerHeight}px`);

  /* 3-4b. 모바일 햄버거 메뉴 — 항목이 다 보이고(스크롤), 뒤로가기로 닫히는지 */
  // 예전에는 패널이 화면 높이를 넘으면 아래 항목이 잘려 고를 수 없었고,
  // 뒤로가기를 누르면 메뉴가 아니라 페이지가 닫혔습니다(사이트를 떠남).
  await evaluate(`document.getElementById("btnMenu").click()`);
  await wait(350);
  const menu = await evaluate(`(() => {
    const nav = document.getElementById("topbarNav");
    const cs = getComputedStyle(nav);
    const vh = document.documentElement.clientHeight;
    const panel = nav.getBoundingClientRect();
    nav.scrollTop = nav.scrollHeight;                      // 맨 아래 항목까지 내려 본다
    const last = document.getElementById("btnGuide");
    const lr = last.getBoundingClientRect();
    return {
      open: nav.classList.contains("open") && cs.display === "flex",
      overflowY: cs.overflowY,
      insideViewport: Math.round(panel.bottom) <= vh + 1,
      scrollable: nav.scrollHeight - nav.clientHeight,
      lastReachable: lr.bottom <= panel.bottom + 1 && lr.bottom <= vh + 1 && lr.top >= panel.top - 1,
      bodyLocked: getComputedStyle(document.body).overflow === "hidden",
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  })()`);
  check(menu.open, `375px 에서 ☰ 메뉴가 열립니다 (overflow-y: ${menu.overflowY})`);
  check(menu.insideViewport, "메뉴 패널이 화면 높이 안에 들어옵니다(아래로 넘치지 않음)");
  check(
    menu.lastReachable,
    `스크롤하면 마지막 항목까지 고를 수 있습니다 (넘치는 높이 ${menu.scrollable}px)`,
  );
  check(menu.bodyLocked, "메뉴가 열려 있는 동안 뒤 화면은 스크롤되지 않습니다");
  check(menu.pageOverflow <= 0, `메뉴를 연 상태에서도 가로 넘침이 없습니다 (${menu.pageOverflow}px)`);

  const urlBeforeBack = await evaluate(`location.pathname`);
  await evaluate(`history.back()`);
  await wait(600);
  const afterBack = await evaluate(`({
    path: location.pathname,
    open: document.getElementById("topbarNav").classList.contains("open"),
    expanded: document.getElementById("btnMenu").getAttribute("aria-expanded"),
  })`);
  check(
    !afterBack.open && afterBack.expanded === "false" && afterBack.path === urlBeforeBack,
    `뒤로가기 한 번으로 메뉴만 닫히고 페이지는 그대로입니다 (${afterBack.path})`,
  );

  /* 3-4b-2. 창을 좁힌 PC(휠·마우스) — ☰ 메뉴도 화면 안에서 스크롤되는지 */
  await send("Emulation.setDeviceMetricsOverride", { width: 900, height: 640, deviceScaleFactor: 1, mobile: false });
  await wait(400);
  const pcMenu = await evaluate(`(() => {
    document.getElementById("btnMenu").click();
    const nav = document.getElementById("topbarNav");
    const panel = nav.getBoundingClientRect();
    const info = { bottom: Math.round(panel.bottom), vh: innerHeight, scrollable: nav.scrollHeight - nav.clientHeight };
    nav.scrollTop = nav.scrollHeight;
    const last = document.getElementById("btnGuide").getBoundingClientRect();
    const after = nav.getBoundingClientRect();
    info.scrolledBy = Math.round(nav.scrollTop);
    info.lastReachable = last.bottom <= after.bottom + 1 && last.top >= after.top - 1 && last.bottom <= innerHeight + 1;
    document.getElementById("btnMenu").click();
    return info;
  })()`);
  check(
    pcMenu.bottom <= pcMenu.vh + 1,
    `창을 좁힌 PC(900×640)에서도 ☰ 메뉴가 화면 높이 안에 들어옵니다 (${pcMenu.bottom}px ≤ ${pcMenu.vh}px)`,
  );
  check(
    pcMenu.scrollable > 0 && pcMenu.scrolledBy === pcMenu.scrollable && pcMenu.lastReachable,
    `☰ 메뉴에서 스크롤하면 마지막 항목까지 닿습니다 (넘치는 높이 ${pcMenu.scrollable}px)`,
  );
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 720, deviceScaleFactor: 2, mobile: true });
  await wait(300);

  /* 3-4c. 안내 창도 뒤로가기로 닫히는지(메뉴와 같은 규칙) */
  await evaluate(`document.getElementById("btnGuide").click()`);
  await wait(400);
  const modalOpen = await evaluate(`({
    show: document.getElementById("guideModal").classList.contains("show"),
    locked: getComputedStyle(document.body).overflow === "hidden",
  })`);
  check(modalOpen.show, "📘 가이드 창이 열립니다");
  check(modalOpen.locked, "안내 창이 열려 있는 동안 뒤 화면은 스크롤되지 않습니다");
  await evaluate(`history.back()`);
  await wait(600);
  const modalAfterBack = await evaluate(`({
    show: document.getElementById("guideModal").classList.contains("show"),
    path: location.pathname,
    locked: getComputedStyle(document.body).overflow === "hidden",
  })`);
  check(
    !modalAfterBack.show && !modalAfterBack.locked && modalAfterBack.path === urlBeforeBack,
    `뒤로가기로 안내 창만 닫히고 페이지는 그대로입니다 (${modalAfterBack.path})`,
  );

  /* 3-4e. 메뉴 → 안내 창으로 이어지는 흐름(뒤로가기 항목을 서로 놓치지 않는지) */
  await evaluate(`document.getElementById("btnMenu").click()`);
  await wait(300);
  await evaluate(`document.getElementById("btnGuide").click()`);
  await wait(450);
  const chain = await evaluate(`({
    menu: document.getElementById("topbarNav").classList.contains("open"),
    modal: document.getElementById("guideModal").classList.contains("show"),
    path: location.pathname,
  })`);
  check(chain.modal && !chain.menu, "메뉴에서 📘 가이드를 고르면 메뉴는 닫히고 안내 창이 열립니다");
  await evaluate(`history.back()`);
  await wait(600);
  const chainBack = await evaluate(`({
    modal: document.getElementById("guideModal").classList.contains("show"),
    path: location.pathname,
    locked: getComputedStyle(document.body).overflow === "hidden",
  })`);
  check(
    !chainBack.modal && !chainBack.locked && chainBack.path === chain.path,
    `메뉴→창으로 이어진 뒤에도 뒤로가기 한 번이면 창만 닫힙니다 (${chainBack.path})`,
  );

  /* 3-4d. 단어 카드 발음에 유닛 이모지가 섞이지 않는지 */
  // 카드의 단어 칸(.w)에는 유닛 아이콘(💼 📊 …)이 함께 들어 있어,
  // 화면 글자를 그대로 읽히면 "이모지 + 단어"가 낭독됐습니다.
  const spoken = await evaluate(`(() => {
    const ss = window.speechSynthesis;
    if (!ss) return { skip: true };
    const said = [];
    const orig = ss.speak;
    ss.speak = (u) => { said.push(String(u.text)); };
    const card = document.querySelector("#units .card");
    const wordEl = card.querySelector(".w");
    const iconEl = wordEl.querySelector(".unit-emoji");
    card.querySelector(".speak").click();
    ss.speak = orig;
    try { ss.cancel(); } catch (e) {}
    return {
      said,
      icon: iconEl ? iconEl.textContent : "",
      word: card.getAttribute("data-word"),
      wordShown: wordEl.textContent,
      hasEmoji: /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(said[0] || ""),
    };
  })()`);
  check(
    spoken.skip || (spoken.said.length === 1 && !spoken.hasEmoji && spoken.said[0] === spoken.word),
    `단어 카드 발음에 이모지가 섞이지 않습니다 (아이콘 "${spoken.icon}" · 낭독 "${spoken.said?.[0] ?? ""}")`,
  );

  /* 3-5. OS 다크 모드가 기본값인지 */
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await evaluate(`localStorage.clear()`);
  await send("Page.reload", { ignoreCache: true });
  for (let i = 0; i < 40; i++) {
    if ((await evaluate(`!!document.getElementById("btnTheme")`)) === true) break;
    await wait(250);
  }
  await wait(800);
  const dark = await evaluate(`({
    bg: getComputedStyle(document.body).backgroundColor,
    stored: localStorage.getItem("toeic1000_theme"),
    icon: document.getElementById("btnTheme").textContent.trim(),
  })`);
  const rgb = (dark.bg.match(/\d+/g) || []).map(Number);
  const isDark = (rgb[0] + rgb[1] + rgb[2]) / 3 < 90;
  check(isDark, `OS 다크 모드에서 첫 화면이 다크입니다 (배경 ${dark.bg})`);
  check(dark.stored === null, "OS 설정을 따를 때는 선택을 저장하지 않습니다(OS 를 바꾸면 따라감)");

  await evaluate(`document.getElementById("btnTheme").click()`);
  await wait(200);
  const chosen = await evaluate(`localStorage.getItem("toeic1000_theme")`);
  check(chosen === "light", `직접 고른 테마는 저장됩니다 (${chosen})`);

  /* 3-6. 404 페이지 */
  const notFound = await fetch(`${BASE}/404.html`);
  const notFoundHtml = notFound.ok ? await notFound.text() : "";
  check(notFound.ok, `404.html 이 응답합니다 (${notFound.status})`);
  check(/name="robots"[^>]*noindex/i.test(notFoundHtml), "404.html 이 noindex 입니다");

  /* 3-7. 자바스크립트 오류·실패한 요청 */
  const jsErrors = events
    .filter((e) => e.method === "Runtime.exceptionThrown")
    .map((e) => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
  const failedSince = errorsSince(0);
  const failed = failedSince.failed;
  const externalFailed = failedSince.externalFailed;
  check(jsErrors.length === 0, `자바스크립트 오류 0건${jsErrors.length ? " — " + jsErrors.slice(0, 3).join(" | ") : ""}`);
  check(failed.length === 0, `실패한 요청 0건${failed.length ? " — " + failed.slice(0, 3).join(" | ") : ""}`);
  if (externalFailed.length) {
    note(`다른 출처 자원 ${externalFailed.length}건이 응답하지 않았습니다 — 우리 자산은 아닙니다 (${externalFailed[0]})`);
  }

  /* 홈 스타일의 출처 — index.html 이 assets/app.css 를 <link> 로 부릅니다(원본·배포본 공통 ·
     docs/app-split-plan.md 1단계). 경로가 틀리면 화면이 통째로 무너지므로 여기서 확인합니다. */
  const homeStyle = await evaluate(`(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (n) => cs.getPropertyValue(n).trim();
    return {
      inline: [...document.querySelectorAll("style")].reduce((n, s) => n + s.textContent.length, 0),
      links: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href") || ""),
      tokens: [read("--primary"), read("--bg"), read("--text")],
    };
  })()`);
  const appCss = homeStyle.links.filter((h) => /(^|\/)app(-\d+)?\.css$/.test(h));
  check(
    homeStyle.inline > 10000 || appCss.length > 0,
    `홈 스타일을 불러옵니다 (인라인 ${Math.round(homeStyle.inline / 1024)}KB` +
      (appCss.length ? ` · 분리 ${appCss.join(", ")}` : "") +
      ")",
  );
  check(
    homeStyle.tokens.every((v) => v && v !== "none"),
    `홈 스타일이 실제로 적용됩니다 (--primary ${homeStyle.tokens[0]} · --bg ${homeStyle.tokens[1]})`,
  );

  /* ---------------------------------------------------------------- */
  /* 3-8. 정적 페이지(단어장 · 문법 · 가이드 · 404)                    */
  /* ---------------------------------------------------------------- */

  // 정적 페이지는 앱과 다른 템플릿(build-pages.mjs)으로 만들어집니다.
  // 공용 스타일(assets/site.css)이 실제로 적용되는지, 좁은 화면에서 넘치지 않는지 봅니다.
  const STATIC_PAGES = [
    ["units/index.html", "단어장 허브"],
    ["units/unit-01.html", "유닛 페이지"],
    ["units/idioms.html", "숙어 모음"],
    ["grammar/index.html", "문법 허브"],
    ["grammar/basic.html", "문법 교재"],
    ["grammar/basic-01.html", "낱개 과 페이지"],
    ["grammar/cheatsheet.html", "문법 요약"],
    ["conversation/index.html", "회화 허브"],
    ["conversation/conversation-basic.html", "회화 교재"],
    ["conversation/conversation-basic-01.html", "낱개 과 페이지(회화)"],
    ["guides/index.html", "가이드 허브"],
    ["guides/part-5-grammar.html", "가이드"],
    ["privacy.html", "개인정보처리방침"],
    ["404.html", "404"],
  ];

  /** 주소가 실제로 바뀌고 로딩이 끝날 때까지 기다립니다. */
  async function openPage(file) {
    const from = events.length;
    await send("Page.navigate", { url: `${BASE}/${file}` });
    for (let i = 0; i < 80; i++) {
      const state = await evaluate(`location.pathname + "|" + document.readyState`);
      if (typeof state === "string" && state.includes(file) && state.endsWith("complete")) break;
      await wait(250);
    }
    await wait(300);
    return from;
  }

  /** 요청 id → 주소. 실패한 요청이 우리 자산인지 다른 출처인지 가리려고 씁니다. */
  function urlOf(requestId) {
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if (e.method === "Network.requestWillBeSent" && e.params.requestId === requestId) {
        return e.params.request.url;
      }
    }
    return "";
  }
  /** 우리 사이트 밖(웹폰트 CDN·분석 스크립트 등)인가. */
  const isExternal = (url) => !!url && /^https?:/i.test(url) && !url.startsWith(BASE);

  /** 그 페이지에서 새로 발생한 오류만 골라냅니다(앞 페이지의 오류를 다시 세지 않도록). */
  function errorsSince(from) {
    const slice = events.slice(from);
    const failedAll = slice.filter((e) => e.method === "Network.loadingFailed" && !e.params.canceled);
    return {
      js: slice
        .filter((e) => e.method === "Runtime.exceptionThrown")
        .map((e) => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text),
      // 다른 출처 자원(웹폰트 CDN·분석)은 우리가 고칠 수 없어 문제로 세지 않습니다.
      // 그 주소가 살아 있는지는 `npm run audit:external` 이 따로 봅니다.
      failed: failedAll
        .filter((e) => !isExternal(urlOf(e.params.requestId)))
        .map((e) => `${e.params.type}: ${e.params.errorText}`),
      externalFailed: failedAll
        .filter((e) => isExternal(urlOf(e.params.requestId)))
        .map((e) => `${urlOf(e.params.requestId)} (${e.params.errorText})`),
      requests: slice.filter((e) => e.method === "Network.responseReceived").length,
    };
  }

  /**
   * 화면 하나를 한 번에 재는 표현식.
   *   · 가로 넘침과 넘치는 요소
   *   · 손가락으로 누르는 요소의 히트 영역(주요 컨트롤 44px · 그 밖의 링크 24px,
   *     문장 속 인라인 링크는 WCAG 2.5.8 의 예외라 건너뜀)
   *   · 정적 페이지용 스타일 적용 여부와 예문 듣기 버튼 수
   */
  const PROBE = `(() => {
    const vw = document.documentElement.clientWidth;
    // 무엇이 걸렸는지 바로 알 수 있게 텍스트 앞부분을 붙입니다
    // (텍스트가 비어 있으면 "a \"\"" 처럼 나오는데, 그 자체가 단서입니다).
    const label = (el) => {
      const sel = el.id ? "#" + el.id
        : el.className ? "." + String(el.className).trim().split(/\\s+/)[0]
          : el.tagName.toLowerCase();
      const text = (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 14);
      return text ? sel + ' "' + text + '"' : sel;
    };

    const over = document.documentElement.scrollWidth - vw;
    const wide = over > 0
      ? [...new Set([...document.querySelectorAll("body *")]
          .filter((el) => el.getBoundingClientRect().right > vw + 1)
          .slice(0, 4)
          .map(label))]
      : [];

    const BIG = 44, SMALL = 24;
    // 주요 컨트롤은 44px, 문장 흐름에 섞이는 아이콘 버튼은 최소 기준(24px)만 지킵니다.
    // dialogue-speak 은 대화문 한 줄 끝에 붙는 인라인 🔊 라, 예문의 gex-speak(28px)와 같은 성격입니다.
    // (홈 섹션 순서를 묶음 단위로 재배치하면서 대화문이 첫 화면 안으로 올라오기 전까지는
    //  화면 밖에 있어 이 검사에 걸리지 않았습니다 — 목록에 빠져 있던 것을 채웁니다.)
    const SMALL_ICONS = ["gex-speak", "speak", "tts-btn", "fav-btn", "card-check", "wod-btn", "dialogue-speak"];
    const isBig = (el) =>
      el.matches("summary, .cta, .unitlist a, .toc a, .pager a, .quiz-opt, .mode-card, .lvl-btn, .topbar .btn") ||
      (el.matches("button") && !SMALL_ICONS.some((c) => el.classList.contains(c)));
    const small = [];
    const candidates = [...document.querySelectorAll("a[href], button, summary")].filter((el) => {
      // 문장 속 인라인 링크는 줄 높이에 묶여 있으므로 예외(WCAG 2.5.8 "Inline").
      if (el.tagName === "A" && getComputedStyle(el).display === "inline") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && (r.width < BIG || r.height < BIG);
    });
    // 요소 "안쪽"(자식 포함)을 가리켜야 그 요소를 누른 것입니다.
    // 부모(카드 배경)를 가리키는 것은 그 요소를 누른 게 아니므로 인정하지 않습니다 —
    // 그래야 카드 안에 작은 버튼이 있어도 제대로 걸러집니다.
    const belongs = (t, el) => !!t && (t === el || el.contains(t));
    for (const el of candidates.slice(0, 80)) {
      const need = isBig(el) ? BIG : SMALL;
      el.scrollIntoView({ block: "center", inline: "center" });
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.top < 0 || r.bottom > innerHeight) continue; // 화면 밖이면 히트 테스트를 건너뜁니다
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      // 다른 것에 가려져 있으면(열린 모달 터 등) 손가락 문제가 아니므로 건너뜁니다.
      if (!belongs(document.elementFromPoint(cx, cy), el)) continue;
      const d = need / 2 - 2;
      const hits = (x, y) => belongs(document.elementFromPoint(x, y), el);
      const okY = r.height >= need || (hits(cx, cy - d) && hits(cx, cy + d));
      const okX = r.width >= need || (hits(cx - d, cy) && hits(cx + d, cy));
      if (!(okX && okY)) {
        small.push(label(el) + " " + Math.round(r.width) + "×" + Math.round(r.height) + " (필요 " + need + ")");
      }
    }

    const wrap = document.querySelector("main.wrap") || document.querySelector(".wrap") || document.querySelector("main");
    return {
      title: document.title,
      bg: getComputedStyle(document.body).backgroundColor,
      wrapMax: wrap ? getComputedStyle(wrap).maxWidth : "-",
      sheets: [...document.styleSheets].map((s) => (s.href ? s.href.split("/").pop() : "inline")),
      speakButtons: document.querySelectorAll(".gex-speak").length,
      speakHidden: document.querySelectorAll(".gex-speak[hidden]").length,
      overflow: over > 0 ? { over, wide } : 0,
      small: [...new Set(small)],
    };
  })()`;

  const generated = new Set([
    "units/index.html",
    "units/unit-01.html",
    "units/idioms.html",
    "grammar/index.html",
    "grammar/basic.html",
    "grammar/cheatsheet.html",
    "guides/index.html",
    "guides/part-5-grammar.html",
    "404.html",
  ]);

  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });

  const sharedCssUsers = [];
  for (const [file, label] of STATIC_PAGES) {
    const from = await openPage(file);
    const wide = await evaluate(PROBE);

    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 720, deviceScaleFactor: 2, mobile: true });
    await wait(400);
    const narrow = await evaluate(PROBE);
    await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false });

    const { js, failed, requests } = errorsSince(from);
    check(js.length === 0, `${label}(${file}): 자바스크립트 오류 0건${js.length ? " — " + js[0] : ""}`);
    check(failed.length === 0, `${label}(${file}): 실패한 요청 0건${failed.length ? " — " + failed[0] : ""}`);

    for (const [width, seen] of [[1100, wide], [375, narrow]]) {
      const over = seen.overflow;
      check(
        !over || over.over <= 0,
        `${label}(${file}): ${width}px 에서 가로 넘침이 없습니다` +
          (over && over.over > 0 ? ` (${over.over}px · ${over.wide.join(", ")})` : ""),
      );
    }

    if (generated.has(file)) {
      // 공용 스타일이 실제로 붙었는지 — 파일이 404 면 .wrap 의 max-width 가 사라집니다.
      check(wide.sheets.includes("site.css"), `${label}(${file}): 공용 스타일(site.css)을 불러옵니다`);
      check(wide.wrapMax === "880px", `${label}(${file}): 공용 스타일이 적용됩니다 (.wrap max-width ${wide.wrapMax})`);

      // 본문 바로가기 — 정적 페이지는 상단바가 앞에 있어 키보드 사용자가 페이지마다 Tab 을
      // 세 번씩 눌러야 본문에 닿습니다. ① 문서에서 첫 번째 초점 대상이어야 하고,
      // ② 초점을 받으면 화면 안으로 들어와야 합니다(화면 밖에 두는 숨김이라 표시가 없으면
      // 눌러도 보이지 않습니다). ③ 가리키는 곳이 실제 <main> 이어야 합니다.
      const skip = await evaluate(`(() => {
        const link = document.querySelector("a.skip-link");
        if (!link) return { found: false };
        const first = document.querySelectorAll("a[href], button, select, input, textarea, [tabindex]:not([tabindex='-1'])")[0];
        const target = document.getElementById("main");
        const before = Math.round(link.getBoundingClientRect().left);
        link.focus();
        const after = Math.round(link.getBoundingClientRect().left);
        const focused = document.activeElement === link;
        link.blur();
        return { found: true, first: first === link, target: !!target && target.tagName === "MAIN", before, after, focused };
      })()`);
      check(
        skip.found && skip.first && skip.target && skip.focused && skip.before < 0 && skip.after >= 0,
        `${label}(${file}): 본문 바로가기가 첫 Tab 이고 초점을 받으면 나타납니다` +
          (skip.found
            ? ` (첫 Tab ${skip.first} · 대상 <main> ${skip.target} · 초점 ${skip.focused} · 왼쪽 ${skip.before}→${skip.after}px)`
            : " — a.skip-link 가 없습니다"),
      );
    }

    // 예문 듣기 버튼이 있으면 공용 스크립트가 붙어 클릭에 반응해야 합니다.
    // 헤드리스 Chrome 은 음성을 하나도 못 찾아 synth.speak() 가 곧바로 실패하므로,
    // "낭독이 시작됐는가" 대신 "클릭이 speak() 까지 도달했는가"를 봅니다
    // (speak.js 가 만들어진 리스너가 없으면 이 호출 자체가 일어나지 않습니다).
    if (wide.speakButtons > 0 && wide.speakHidden < wide.speakButtons) {
      const spoke = await evaluate(`(() => {
        const b = document.querySelector(".gex-speak:not([hidden])");
        const s = window.speechSynthesis;
        const orig = s.speak;
        let called = 0;
        s.speak = function () { called++; };
        b.click();
        const highlighted = b.classList.contains("speaking");
        s.speak = orig;
        b.click();  // 눌린 표시를 되돌립니다
        return { called, highlighted };
      })()`);
      check(
        spoke && spoke.called === 1,
        `${label}(${file}): 예문 듣기 버튼이 낭독을 호출합니다 (speak.js 연결됨 · 클릭 강조 ${spoke && spoke.highlighted})`,
      );
    } else if (wide.speakButtons > 0) {
      note(`${label}(${file}): 이 브라우저에 음성 합성이 없어 버튼이 숨겨졌습니다(${wide.speakButtons}개)`);
    }

    check(
      narrow.small.length === 0,
      `${label}(${file}): 누르는 요소의 히트 영역이 충분합니다 (44px / 24px)` +
        (narrow.small.length ? ` — 부족: ${narrow.small.slice(0, 4).join(", ")}` : ""),
    );

    sharedCssUsers.push(wide.sheets.includes("site.css") ? file : `${file}(인라인)`);
    note(`${label} (${file}) · 요청 ${requests}개 · 배경 ${wide.bg} · 스타일 ${wide.sheets.includes("site.css") ? "site.css" : "인라인"}`);
  }
  note(`정적 페이지 ${STATIC_PAGES.length}개 점검 — 공용 스타일 사용 ${sharedCssUsers.filter((f) => !f.includes("(")).length}개`);

  /* ---------------------------------------------------------------- */
  /* 3-9. 앱 화면별 점검 (375px) — 홈 말고도 학습 화면이 여럿입니다     */
  /* ---------------------------------------------------------------- */

  // 상단바 버튼을 눌러 화면을 옮겨 가며, 그 화면이 가로로 넘치지 않는지·
  // 누르는 요소가 너무 작지 않은지 봅니다(모바일에서 가장 자주 깨지는 두 가지).
  const APP_SCREENS = [
    ["btnHome", "홈"],
    ["btnList", "목록"],
    ["btnFlash", "암기"],
    ["btnQuiz", "퀴즈"],
    ["btnExam", "시험"],
    ["btnSrs", "복습"],
    ["btnListen", "리스닝"],
    ["btnMock", "모의고사"],
    ["btnDiag", "진단"],
    ["btnDash", "대시보드"],
    ["btnGuide", "가이드"],
  ];

  await openPage("index.html");
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 720, deviceScaleFactor: 2, mobile: true });
  await wait(600);

  for (const [id, name] of APP_SCREENS) {
    const from = events.length;
    await evaluate(`document.getElementById("${id}").click()`);
    await wait(600);
    const seen = await evaluate(PROBE);
    const { js } = errorsSince(from);
    check(js.length === 0, `앱 ${name} 화면: 자바스크립트 오류 0건${js.length ? " — " + js[0] : ""}`);
    check(
      !seen.overflow || seen.overflow.over <= 0,
      `앱 ${name} 화면: 375px 가로 넘침이 없습니다` +
        (seen.overflow && seen.overflow.over > 0 ? ` (${seen.overflow.over}px · ${seen.overflow.wide.join(", ")})` : ""),
    );
    check(
      seen.small.length === 0,
      `앱 ${name} 화면: 누르는 요소의 히트 영역이 충분합니다` +
        (seen.small.length ? ` — 부족: ${seen.small.slice(0, 5).join(", ")}` : ""),
    );
  }
  note(`앱 화면 ${APP_SCREENS.length}개를 375px 에서 점검(넘침 · 오류 · 히트 영역)`);

  // 채점 결과가 화면 낭독기에서 읽히는가 — 결과 상자가 라이브 영역이어야 하고(role=status +
  // aria-live), 보기가 비활성화되어 초점을 잃으면 그 상자로 초점이 옴겨야 합니다.
  // (합성 클릭은 실제 Tab 이동과 달리 버튼에 초점을 주지 않습니다. 그래도 "초점을 잃은 경우"에
  //  해당하므로 같은 경로를 탑니다.)
  // 앞의 화면 점검은 마지막에 「가이드」로 끝납니다. 퀴즈 화면으로 돌아와야 결과 상자가
  // 실제로 보이는 상태가 되고(숨은 화면의 요소에는 초점을 줄 수 없습니다) 초점을 확인할 수 있습니다.
  await evaluate(`document.getElementById("btnQuiz").click()`);
  await wait(500);
  const quizA11y = await evaluate(`(() => {
    const start = document.getElementById("quizStart");
    if (start) start.click();
    const opt = document.querySelector("#quizBox .quiz-opt");
    if (!opt) return { found: false };
    // 실제 Tab 조작과 같은 상황을 만듭니다 — 보기를 누르면 그 버튼이 비활성화되어
    // 초점이 문서 밖(body)으로 떨어지고, 그때만 결과 상자로 초점을 옴깁니다.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    opt.click();
    const fb = document.getElementById("quizFeedback");
    if (!fb) return { found: false };
    const active = document.activeElement;
    return {
      found: true,
      live: fb.getAttribute("role") === "status" && fb.getAttribute("aria-live") === "polite",
      graded: /정답|오답/.test(fb.textContent || ""),
      focused: active === fb,
      active: active ? (active.id || active.tagName) : "none",
    };
  })()`);
  check(
    quizA11y.found && quizA11y.live && quizA11y.graded && quizA11y.focused,
    "퀴즈 채점: 결과가 라이브 영역에 표시되고 초점이 그곳으로 옴깁니다" +
      (quizA11y.found
        ? ` (라이브 ${quizA11y.live} · 채점 문구 ${quizA11y.graded} · 초점 ${quizA11y.focused}${quizA11y.focused ? "" : " · 초점대상 " + quizA11y.active})`
        : " — #quizBox .quiz-opt 를 찾지 못했습니다"),
  );

  /* ---------------------------------------------------------------- */
  /* 3-10. 배포 상태(--live) — 색인·자산이 실제 주소에서 살아 있는지     */
  /* ---------------------------------------------------------------- */

  if (LIVE) {
    // ① robots.txt 가 사이트맵을 알려 주는지
    const robots = await (await fetch(`${LIVE_SITE}/robots.txt`)).text();
    check(/Sitemap:\s*https:\/\/toeic\.monster\/sitemap\.xml/i.test(robots), "robots.txt 가 사이트맵 주소를 알려 줍니다");

    // ② 사이트맵의 모든 주소가 실제로 응답하는지(색인 대상이 404 면 검색에서 밀립니다)
    const sitemap = await (await fetch(`${LIVE_SITE}/sitemap.xml`)).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const dead = [];
    for (const loc of locs) {
      try {
        const r = await fetch(loc, { method: "HEAD", redirect: "follow" });
        if (!r.ok) dead.push(`${r.status} ${loc}`);
      } catch (e) {
        dead.push(`실패 ${loc}`);
      }
    }
    check(dead.length === 0, `사이트맵 주소 ${locs.length}개가 모두 응답합니다${dead.length ? ` — ${dead.slice(0, 3).join(", ")}` : ""}`);

    // ③ 없는 주소는 404 상태 + 우리 404 페이지로 응답하는지
    const missing = await fetch(`${LIVE_SITE}/no-such-page-${Date.now()}`, { redirect: "follow" });
    const missingHtml = await missing.text();
    check(missing.status === 404, `없는 주소가 404 로 응답합니다 (${missing.status})`);
    check(/페이지를 찾을 수 없습니다/.test(missingHtml), "없는 주소가 커스텀 404 페이지를 보여 줍니다");

    // ④ 공유 카드·공용 자산이 배포본에 있는지(로컬에서 고치고 푸시를 잊는 사고 방지)
    const assets = [
      ["/assets/site.css", "text/css"],
      ["/assets/speak.js", "javascript"],
      ["/apple-touch-icon.png", "image/png"],
      ["/icon-192.png", "image/png"],
      ["/og-image.png", "image/png"],
    ];
    const missingAssets = [];
    for (const [path, type] of assets) {
      const r = await fetch(LIVE_SITE + path, { method: "HEAD" });
      const got = (r.headers.get("content-type") || "").split(";")[0];
      if (!r.ok || !got.includes(type)) missingAssets.push(`${path}(${r.status} ${got})`);
    }
    check(missingAssets.length === 0, `배포본에 공용 자산이 있습니다${missingAssets.length ? ` — ${missingAssets.join(", ")}` : ""}`);

    // ⑤ 홈이 압축돼 내려오는지(gzip 없이 원본을 받으면 모바일에서 몇 배 느립니다)
    const home = await fetch(`${LIVE_SITE}/`);
    check(
      !!home.headers.get("content-encoding"),
      `홈이 압축되어 내려옵니다 (${home.headers.get("content-encoding") || "압축 없음"})`,
    );
    const homeKb = Number(home.headers.get("content-length") || 0) / 1024;
    if (homeKb) note(`배포본 홈 전송량 ${homeKb.toFixed(0)}KB (압축)`);
  }

  /* 정적 페이지도 OS 다크 모드를 따르는지(대표 1페이지) */
  // 앞 단계에서 앱이 테마를 저장했을 수 있으므로(직접 고른 값이 우선) 먼저 지웁니다.
  await openPage("units/unit-01.html");
  await evaluate(`localStorage.clear()`);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await openPage("units/unit-01.html");
  const staticDark = await evaluate(`getComputedStyle(document.body).backgroundColor`);
  const darkRgb = (staticDark.match(/\d+/g) || []).map(Number);
  check(
    (darkRgb[0] + darkRgb[1] + darkRgb[2]) / 3 < 90,
    `정적 페이지도 OS 다크 모드를 따릅니다 (배경 ${staticDark})`,
  );
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });

  /* ---------------------------------------------------------------- */
  /* 3-10. 내비게이션 — 교재 과 이동 · 가이드 이전/다음 · 이어서 학습  */
  /* ---------------------------------------------------------------- */

  // 교재 한 권은 12과가 한 페이지에 이어져 77KB까지 커집니다.
  // 과를 읽는 중에 위 목차까지 되돌아가지 않도록 넣은 두 장치(과 끝 링크 · 현재 과 바)와,
  // 홈의 「이어서 학습」이 실제 브라우저에서 동작하는지 확인합니다.

  const bookFrom = await openPage("grammar/basic.html");
  const bookNav = await evaluate(`(() => {
    const links = [...document.querySelectorAll(".chnav a")];
    return {
      chapters: document.querySelectorAll("section.gram[id]").length,
      bar: !!document.getElementById("chBar"),
      toc: !!document.getElementById("toc"),
      links: links.length,
      anchorsOk: links.every((a) => !!document.getElementById((a.getAttribute("href") || "").slice(1))),
    };
  })()`);
  check(bookNav.chapters === 12, `교재: 과 섹션 ${bookNav.chapters}개를 찾았습니다 (12개)`);
  check(bookNav.toc && bookNav.bar, "교재: 목차 앵커(#toc)와 현재 과 바(#chBar)가 있습니다");
  check(bookNav.anchorsOk && bookNav.links > 0, `교재: 과 끝 이동 링크 ${bookNav.links}개가 모두 실제 앵커를 가리킵니다`);

  // 7과로 내려가면, 지금 보고 있는 과를 알려 주는 바가 따라옵니다.
  await evaluate(`document.getElementById("ch-07").scrollIntoView()`);
  await wait(700);
  const barShown = await evaluate(`(() => {
    const bar = document.getElementById("chBar");
    const next = document.getElementById("chBarNext");
    const r = bar.getBoundingClientRect();
    return {
      hidden: bar.hidden,
      text: document.getElementById("chBarCur").textContent.trim(),
      next: next.hidden ? "" : next.getAttribute("href"),
      inViewport: r.top >= -1 && r.bottom <= window.innerHeight + 1,
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  })()`);
  check(!barShown.hidden && /^07과/.test(barShown.text), `교재: 7과로 가면 현재 과 바가 뜹니다 ("${barShown.text}")`);
  check(barShown.next === "#ch-08", `교재: 바의 「다음 과」가 8과를 가리킵니다 (${barShown.next})`);
  check(
    barShown.inViewport && barShown.over <= 0,
    `교재: 바가 화면 안에 들어오고 375px 에서 넘치지 않습니다 (넘침 ${barShown.over}px)`,
  );

  // 페이지 끝에서는 같은 링크(pager)가 화면에 있으니 바를 내립니다.
  await evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
  await wait(700);
  const barAtEnd = await evaluate(`document.getElementById("chBar").hidden`);
  check(barAtEnd, "교재: 페이지 끝에서는 바가 내려가 본문을 가리지 않습니다");
  check(errorsSince(bookFrom).js.length === 0, "교재: 현재 과 바 스크립트가 오류 없이 실행됩니다");

  // pager 가 단계명을 두 번 찍던 문제("중급 중급 영문법")가 사라졌는지.
  await openPage("grammar/intermediate.html");
  const midPager = await evaluate(`[...document.querySelectorAll(".pager a")].map((a) => a.textContent.trim()).join(" | ")`);
  const midPagerDup = ["초급 초급", "중급 중급", "고급 고급", "기초 기초"].filter((s) => midPager.includes(s));
  check(midPagerDup.length === 0, `교재: pager 에 단계명이 겹치지 않습니다 (${midPager})`);

  // 가이드 9편은 이전/다음 편으로 이어 볼 수 있습니다.
  await openPage("guides/part-2-traps.html");
  const guideHrefs = await evaluate(`[...document.querySelectorAll(".pager a")].map((a) => a.getAttribute("href")).join(",")`);
  check(
    guideHrefs.includes("part-7-double-passage.html") && guideHrefs.includes("vocabulary-30day.html"),
    `가이드: 이전·다음 편으로 이어 볼 수 있습니다 (${guideHrefs})`,
  );

  // 「이어서 학습」 — 기록이 없으면 숨김, 기록이 있으면 마지막으로 본 단어부터.
  await openPage("index.html");
  await evaluate(`localStorage.clear()`);
  await openPage("index.html");
  const resumeHidden = await evaluate(`document.getElementById("homeResume").hidden`);
  check(resumeHidden === true, "이어서 학습: 기록이 없는 첫 방문에는 버튼이 보이지 않습니다");

  await evaluate(`(() => {
    localStorage.setItem("toeic1000_learned", JSON.stringify({ available: "2026-09-16" }));
    localStorage.setItem("toeic1000_lastword", "require");
  })()`);
  await openPage("index.html");
  const resumeState = await evaluate(
    `(() => { const b = document.getElementById("homeResume"); return { hidden: b.hidden, text: b.textContent.trim() }; })()`,
  );
  check(
    !resumeState.hidden && resumeState.text.indexOf("이어서 학습 1/") !== -1,
    `이어서 학습: 기록이 있으면 진도와 함께 보입니다 ("${resumeState.text}")`,
  );

  await evaluate(`document.getElementById("homeResume").click()`);
  await wait(600);
  const resumeCard = await evaluate(
    `(() => ({ shown: document.getElementById("flashcardView").classList.contains("show"), word: document.getElementById("fcWord").textContent.trim() }))()`,
  );
  check(
    resumeCard.shown && resumeCard.word === "require",
    `이어서 학습: 마지막으로 본 단어부터 시작합니다 ("${resumeCard.word}")`,
  );
  await evaluate(`localStorage.clear()`);

  /* ---------------------------------------------------------------- */
  /* 3-10b. 깊은 구간 이동 — 섹션 이동 버튼 · 「/」 검색 단축키          */
  /* ---------------------------------------------------------------- */

  // 홈은 53섹션짜리 긴 페이지입니다. 섹션 칩은 맨 위에 있어, 깊이 내려가면
  // 다른 섹션으로 가려고 위로 되돌아가야 했습니다(맨 위로 버튼만 있었음).
  await openPage("index.html");
  const deepHidden = await evaluate(
    `(() => ({ jump: document.getElementById("secJump").hidden, top: document.getElementById("toTop").hidden }))()`,
  );
  check(
    deepHidden.jump && deepHidden.top,
    "깊은 구간 이동: 맨 위에서는 「섹션 이동」과 「맨 위로」가 숨어 있습니다",
  );

  // 목차 칩으로 깊은 섹션까지 내려가면 버튼이 나타나야 합니다.
  // 칩은 부드러운 스크롤로 46,000px 아래 섹션까지 내려갑니다 — 고정 대기(1.2초)로는 도착 전에
  // 재어 어느 섹션인지 어긋났습니다(그 뒤 계산이 한 칸씩 밀렸습니다).
  // 실제로 멈춘 것을 보고, 위치 표시가 갱신될 때까지 기다린 뒤 정지 위치를 읽습니다.
  await evaluate(`document.querySelector('.sn-chip[data-target="30일 스프린트"]').click()`);
  await waitForScrollSettle({ initial: 800 });
  for (let i = 0; i < 25; i++) {
    const shown = await evaluate(`(document.getElementById("snCurrent") || {}).textContent || ""`);
    if (shown) break;
    await wait(120);
  }
  const deepShown = await evaluate(
    `(() => ({
      jump: document.getElementById("secJump").hidden,
      y: Math.round(window.pageYOffset),
      now: (document.getElementById("snCurrent") || {}).textContent || "",
    }))()`,
  );
  check(
    !deepShown.jump && deepShown.y > 700,
    `깊은 구간 이동: 스크롤이 깊어지면 버튼이 나타납니다 (y=${deepShown.y})`,
  );

  // 「다음 섹션」 — 아래 섹션으로 내려가고 위치 표시도 바뀝니다.
  // 위치 표시는 IntersectionObserver 가 갱신하므로, 이동이 멈춘 뒤 한 박자 늦게 바뀝니다.
  // 고정 대기(또는 「바뀌었나?」 한 번 보기)로 재면 스크롤 중이던 이전 값이 남아 간간히 실패합니다.
  // 그래서 실제로 표시가 바뀔 때까지 기다린 뒤에 잽니다(스크롤 정지 확인은 그대로).
  await evaluate(`document.getElementById("secNext").click()`);
  await waitForScrollSettle({ initial: 300 });
  for (let i = 0; i < 25; i++) {
    const shown = await evaluate(`(document.getElementById("snCurrent") || {}).textContent || ""`);
    if (shown && shown !== deepShown.now) break;
    await wait(120);
  }
  const afterNext = await evaluate(
    `(() => ({
      y: Math.round(window.pageYOffset),
      now: (document.getElementById("snCurrent") || {}).textContent || "",
    }))()`,
  );
  check(
    afterNext.y > deepShown.y + 40,
    `섹션 이동: 「다음 섹션」이 아래 섹션으로 내려갑니다 (y ${deepShown.y} → ${afterNext.y})`,
  );
  check(
    afterNext.now !== deepShown.now && afterNext.now.indexOf("지금:") === 0,
    `섹션 이동: 위치 표시가 새 섹션으로 바뀝니다 ("${deepShown.now}" → "${afterNext.now}")`,
  );

  // 「이전 섹션」 — 다시 위로 올라옵니다.
  await evaluate(`document.getElementById("secPrev").click()`);
  await waitForScrollSettle({ initial: 300 });
  const afterPrev = await evaluate(`Math.round(window.pageYOffset)`);
  check(
    afterPrev < afterNext.y - 40,
    `섹션 이동: 「이전 섹션」이 위 섹션으로 돌아갑니다 (y ${afterNext.y} → ${afterPrev})`,
  );

  // 「/」 — 53섹션을 훑어보지 않고 바로 찾기 위한 단축키.
  await evaluate(`window.scrollTo(0, 0)`);
  await wait(400);
  const slashFocus = await evaluate(`(() => {
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
    return document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : "";
  })()`);
  check(
    slashFocus === "searchInput",
    `검색 단축키: 「/」를 누르면 단어 검색으로 이동해 검색창에 초점이 갑니다 (${slashFocus || "없음"})`,
  );

  const slashTyping = await evaluate(`(() => {
    const box = document.getElementById("searchInput");
    box.focus();
    box.value = "";
    box.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
    const v = box.value;
    box.blur();
    return v;
  })()`);
  check(
    slashTyping === "",
    `검색 단축키: 검색창에 입력 중이면 「/」를 가로채지 않습니다 (값 "${slashTyping}")`,
  );

  /* ---------------------------------------------------------------- */
  /* 3-10c. 전체 목차 오버레이 · 화면 전환 기록                        */
  /* ---------------------------------------------------------------- */

  // 53섹션이 4묶음으로 접혀 있고 목차는 화면 맨 위에 있어, 깊이 내려가면 목차로 가려면
  // 「맨 위로」를 거쳐야 했습니다. 섹션 메뉴를 복제한 목차를 어디서든 열 수 있어야 합니다.
  await openPage("index.html");
  await evaluate(`window.scrollTo(0, 2200)`);
  await wait(700);
  const tocOpen = await evaluate(`(() => {
    const btn = document.getElementById("btnToc");
    if (!btn) return { found: false };
    const hidden = btn.parentElement.hidden;
    if (hidden) return { found: true, hidden: true };
    btn.click();
    return {
      found: true,
      hidden: false,
      shown: document.getElementById("tocModal").classList.contains("show"),
      chips: document.querySelectorAll("#tocModalBody .sn-chip").length,
      inline: document.querySelectorAll(".section-nav .sn-chip").length,
    };
  })()`);
  check(tocOpen.found && !tocOpen.hidden, "전체 목차: 깊은 구간에서 목차 버튼이 나타납니다");
  check(tocOpen.shown === true, "전체 목차: 목차 버튼으로 창이 열립니다");
  check(
    tocOpen.chips > 0 && tocOpen.chips === tocOpen.inline,
    `전체 목차: 섹션 메뉴 ${tocOpen.inline}개가 그대로 들어 있습니다 (복제 ${tocOpen.chips}개)`,
  );

  // 목차에서 섹션을 고르면 창이 닫히고 그 섹션 위로 이동해야 합니다.
  const tocPick = await evaluate(`(() => {
    const chip = [...document.querySelectorAll("#tocModalBody .sn-chip")]
      .find((c) => c.getAttribute("data-target") === "30일 스프린트");
    if (!chip) return { found: false };
    chip.click();
    return { found: true };
  })()`);
  // 44,000px 를 부드럽게 넘고, 기록 복원 뒤 다시 이동합니다 — 멈출 때까지 봅니다.
  await waitForScrollSettle();
  const tocAfter = await evaluate(`(() => ({
    shown: document.getElementById("tocModal").classList.contains("show"),
    y: Math.round(window.pageYOffset),
    top: Math.round(document.querySelector('.home-section[aria-label="30일 스프린트"]').getBoundingClientRect().top),
  }))()`);
  check(tocPick.found && !tocAfter.shown, "전체 목차: 섹션을 고르면 창이 닫힙니다");
  check(
    Math.abs(tocAfter.top) < 200,
    `전체 목차: 고른 섹션이 화면 위쪽으로 옵니다 (top=${tocAfter.top}px · y=${tocAfter.y})`,
  );

  // 화면 전환을 기록에 남기지 않으면, 목록을 보다 뒤로가기를 누를 때 사이트를 떠납니다.
  await openPage("index.html");
  await evaluate(`document.getElementById("btnList").click()`);
  await wait(800);
  const onList = await evaluate(
    `(() => ({ listShown: !document.getElementById("units").classList.contains("hide"), hash: location.hash }))()`,
  );
  check(onList.listShown, "화면 기록: 「목록」을 고르면 목록 화면이 열립니다");
  check(onList.hash === "#view=list", `화면 기록: 주소에도 화면이 남습니다 (${onList.hash || "해시 없음"})`);

  await evaluate(`window.history.back()`);
  await wait(1000);
  const viewAfterBack = await evaluate(`(() => ({
    home: !document.getElementById("homeView").classList.contains("hide"),
    hash: location.hash,
  }))()`);
  check(
    viewAfterBack.home,
    `화면 기록: 뒤로가기 한 번이면 홈으로 돌아옵니다 (hash="${viewAfterBack.hash}")`,
  );

  // 주소로도 화면이 열려야 합니다(새로고침·공유·직접 입력).
  await openPage("index.html#view=quiz");
  await wait(600);
  const deepView = await evaluate(
    `(() => ({ quiz: !document.getElementById("quizView").classList.contains("hide"), btn: document.getElementById("btnQuiz").classList.contains("active") }))()`,
  );
  check(deepView.quiz && deepView.btn, "화면 기록: #view=quiz 주소로 퀴즈 화면이 바로 열립니다");

  /* ---------------------------------------------------------------- */
  /* 3-11. 낱개 과 페이지 · 홈 묶음 펼침 상태 기억                    */
  /* ---------------------------------------------------------------- */

  // 12과가 이어지는 책 페이지에서 한 과만 떼어 둔 주소(검색·공유용)입니다.
  // 책과 서로를 링크하고, 앞뒤 과로 이어지는지 확인합니다(정적 검사는 audit:site 담당).
  const chapterFrom = await openPage("grammar/basic-05.html");
  const chapterPage = await evaluate(`(() => {
    const nav = document.querySelector(".chnav");
    const links = nav ? [...nav.querySelectorAll("a")].map((a) => a.getAttribute("href")) : [];
    return {
      canonical: (document.querySelector('link[rel="canonical"]') || {}).href || "",
      up: links[0] || "",
      prev: links[1] || "",
      next: links[2] || "",
      backToBook: (document.querySelector('.lead a') || {}).getAttribute ? document.querySelector('.lead a').getAttribute("href") : "",
      sections: document.querySelectorAll("section.gram").length,
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  })()`);
  check(chapterPage.canonical.endsWith("/grammar/basic-05.html"), `낱개 과 페이지: canonical 이 스스로를 가리킵니다 (${chapterPage.canonical})`);
  check(
    chapterPage.up === "basic.html" && chapterPage.prev === "basic-04.html" && chapterPage.next === "basic-06.html",
    `낱개 과 페이지: 책 · 이전 · 다음 과로 이어집니다 (${chapterPage.up} / ${chapterPage.prev} / ${chapterPage.next})`,
  );
  check(chapterPage.sections === 1 && chapterPage.over <= 0, "낱개 과 페이지: 과 하나만 담고 375px 에서 넘치지 않습니다");
  check(errorsSince(chapterFrom).js.length === 0, "낱개 과 페이지: 자바스크립트 오류 0건");

  // 홈 묶음(어휘 익히기 등)의 펼침 상태가 화면을 옮겼다 돌아와도 유지되는지.
  await evaluate(`localStorage.clear()`);
  await openPage("index.html");
  await evaluate(`document.getElementById("home-group-part").open = true`);
  await wait(300);
  await openPage("index.html");
  const groupKept = await evaluate(`(() => ({ part: document.getElementById("home-group-part").open, vocab: document.getElementById("home-group-vocab").open }))()`);
  check(
    groupKept.part === true && groupKept.vocab === true,
    `홈 묶음: 펼쳐 둔 상태가 다시 열어도 유지됩니다 (파트별=${groupKept.part} · 어휘=${groupKept.vocab})`,
  );
  await evaluate(`localStorage.clear()`);

  // 낱개 과 페이지에서 같은 책의 다른 과로 건너갈 수 있는지(사용자 이동 + 크롤러 발견 경로).
  await openPage("conversation/conversation-intermediate-04.html");
  const sibling = await evaluate(`(() => {
    const links = [...document.querySelectorAll(".toc a")];
    return {
      total: links.length,
      current: links.filter((a) => a.getAttribute("aria-current") === "page").length,
      hrefs: links.map((a) => a.getAttribute("href")).join(","),
    };
  })()`);
  check(
    sibling.total === 12 && sibling.current === 1,
    `낱개 과 페이지: 같은 책 12개 과로 이어지고 현재 과가 표시됩니다 (${sibling.total}개 · 현재 ${sibling.current}개)`,
  );
  check(
    sibling.hrefs.includes("conversation-intermediate-05.html"),
    "낱개 과 페이지: 이웃 과 주소가 목록에 들어 있습니다",
  );

  // 교재 → 앱 딥링크: 낱개 과 페이지의 「✏️ 앱에서 이 과 문제 풀기」가 그 과만 뽑아 줘야 합니다.
  // (앞 페이지가 하위 폴더라 상대 경로는 그 폴더 기준이 됩니다 — 루트 절대 경로로 갑니다.)
  await evaluate(`location.href = "/index.html?level=basic&ch=5#grammar-quiz"`);
  for (let i = 0; i < 40; i++) {
    if (await evaluate(`!!document.getElementById("grammarBox")`)) break;
    await wait(250);
  }
  // 교재 페이지에서 넘어온 흐름은 문제가 자동으로 시작됩니다(딥링크 → 0.4초 뒤 시작).
  // 고정 시간에 기대지 않고, 문제가 실제로 뜨는지까지 기다립니다.
  for (let i = 0; i < 24; i++) {
    if (await evaluate(`document.getElementById("grammarBox").textContent.indexOf("과") !== -1`)) break;
    await wait(250);
  }
  const deep = await evaluate(`(() => {
    const sel = document.getElementById("grammarLevelSel");
    const hint = document.getElementById("grammarChapterHint");
    const text = document.getElementById("grammarBox").textContent;
    return {
      level: sel ? sel.value : "",
      hintShown: hint ? !hint.hidden : false,
      hint: hint ? hint.textContent : "",
      hasCh5: text.indexOf("초급 5과") !== -1,
      hasOther: text.indexOf("초급 4과") !== -1 || text.indexOf("초급 6과") !== -1 || text.indexOf("중급 5과") !== -1,
      snippet: text.split("\\n").join(" ").slice(0, 70),
    };
  })()`);
  check(deep.level === "basic", `앱 딥링크: ?level=basic 이 단계 선택에 반영됩니다 (${deep.level})`);
  check(
    deep.hintShown && deep.hint.indexOf("5과만") !== -1,
    `앱 딥링크: “이 과만” 상태가 화면에 보입니다 (${deep.hint})`,
  );
  check(
    deep.hasCh5 && !deep.hasOther,
    `앱 딥링크: 그 과의 문제만 나옵니다 (5과=${deep.hasCh5} · 다른 과=${deep.hasOther} · 내용 "${deep.snippet}")`,
  );

  await evaluate(`localStorage.clear()`);
} finally {
  await shutdown();
}

/* ------------------------------------------------------------------ */
/* 4. 리포트                                                           */
/* ------------------------------------------------------------------ */

console.log("🌐 실제 브라우저 점검 (헤드리스 Chrome)");
console.log(`   · 서빙 폴더: ${SERVING}${LIVE ? ` (대신 ${LIVE_SITE})` : ""}`);
notes.forEach((n) => console.log("   " + n));
if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 브라우저 점검 모두 통과");
