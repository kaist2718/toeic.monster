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

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
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

try {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 820, deviceScaleFactor: 1, mobile: false });
  await send("Page.reload", { ignoreCache: true });

  // 첫 화면이 실제로 그려질 때까지 기다립니다(고정 대기 시간에 기대지 않도록).
  for (let i = 0; i < 60; i++) {
    if ((await evaluate(`document.querySelectorAll("#homeView .home-section").length`)) >= 52) break;
    await wait(500);
  }
  await wait(1000);

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
    };
  })()`);

  check(desktop.homeSections === 52, `홈 섹션 52개가 그려졌습니다 (${desktop.homeSections}개)`);
  check(desktop.renderedAtHome === 0, `첫 화면에 숨은 단어 카드를 그리지 않습니다 (${desktop.renderedAtHome}장)`);
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
  // 화면 글자를 그대로 읽히면 "이모지 + 단어"가 낭독됬습니다.
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
  const failed = events
    .filter((e) => e.method === "Network.loadingFailed" && !e.params.canceled)
    .map((e) => `${e.params.type}: ${e.params.errorText}`);
  check(jsErrors.length === 0, `자바스크립트 오류 0건${jsErrors.length ? " — " + jsErrors.slice(0, 3).join(" | ") : ""}`);
  check(failed.length === 0, `실패한 요청 0건${failed.length ? " — " + failed.slice(0, 3).join(" | ") : ""}`);

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
    ["grammar/cheatsheet.html", "문법 요약"],
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

  /** 그 페이지에서 새로 발생한 오류만 골라냅니다(앞 페이지의 오류를 다시 세지 않도록). */
  function errorsSince(from) {
    const slice = events.slice(from);
    return {
      js: slice
        .filter((e) => e.method === "Runtime.exceptionThrown")
        .map((e) => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text),
      failed: slice
        .filter((e) => e.method === "Network.loadingFailed" && !e.params.canceled)
        .map((e) => `${e.params.type}: ${e.params.errorText}`),
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
} finally {
  await shutdown();
}

/* ------------------------------------------------------------------ */
/* 4. 리포트                                                           */
/* ------------------------------------------------------------------ */

console.log("🌐 실제 브라우저 점검 (헤드리스 Chrome)");
notes.forEach((n) => console.log("   " + n));
if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 브라우저 점검 모두 통과");
