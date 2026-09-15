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
 *     6) 모바일 폭에서 가로 넘침·필터 스크롤 단서(mask)가 있는지
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
  server.close();
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* Windows 에서 가끔 잠겨 있습니다 — 임시 폴더라 무해합니다. */
  }
}

/* ------------------------------------------------------------------ */
/* 3. 페이지 열고 계측                                                 */
/* ------------------------------------------------------------------ */

const site = `http://127.0.0.1:${sitePort}/index.html`;
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

  /* 3-3. 목록을 열면 그때 그려지는지 */
  await evaluate(`document.getElementById("btnList").click()`);
  await wait(600);
  const cards = await evaluate(`document.querySelectorAll("#units .card").length`);
  check(cards === 1000, `목록을 처음 열 때 단어 카드 ${cards}장을 그립니다 (1,000장이어야 함)`);
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
  const notFound = await fetch(`http://127.0.0.1:${sitePort}/404.html`);
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
    await send("Page.navigate", { url: `http://127.0.0.1:${sitePort}/${file}` });
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

  const layoutProbe = `(() => {
    const overflowAt = () => {
      const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      if (over <= 0) return 0;
      const wide = [...document.querySelectorAll("body *")]
        .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 4)
        .map((el) => (el.id ? "#" + el.id : el.className ? "." + String(el.className).trim().split(/\\s+/)[0] : el.tagName.toLowerCase()));
      return { over, wide: [...new Set(wide)] };
    };
    const wrap = document.querySelector("main.wrap") || document.querySelector(".wrap") || document.querySelector("main");
    return {
      title: document.title,
      bg: getComputedStyle(document.body).backgroundColor,
      wrapMax: wrap ? getComputedStyle(wrap).maxWidth : "-",
      sheets: [...document.styleSheets].map((s) => (s.href ? s.href.split("/").pop() : "inline")),
      speakButtons: document.querySelectorAll(".gex-speak").length,
      speakHidden: document.querySelectorAll(".gex-speak[hidden]").length,
      overflow: overflowAt(),
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
    const wide = await evaluate(layoutProbe);

    await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 720, deviceScaleFactor: 2, mobile: true });
    await wait(400);
    const narrow = await evaluate(layoutProbe);
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

    /* 손가락으로 누르는 요소가 너무 작지 않은지(375px 화면).

       기준을 두 단계로 나뉩니다:
         · 44px — 주요 버튼·카드 링크(사과·머티리얼 권장)
         · 24px — 그 밖의 링크·아이콘 버튼(WCAG 2.5.8 AA 최소 목표 크기)
       문장 속에 섞인 인라인 링크(display:inline)는 같은 규격의 예외 대상이라 건너뜁니다.
       보이는 크기가 작아도 ::after 같은 방법으로 히트 영역을 넓혔으면 통과입니다
       (실제로 눌리는지는 elementFromPoint 로 브라우저에게 물어봅니다). */
    const smallTargets = await evaluate(`(() => {
      const BIG = 44, SMALL = 24;
      // 문장 흐름 속에 섞이는 아이콘 버튼(.gex-speak, 22px)은 WCAG 최소 기준(24px)만 지키게 합니다.
      const isBig = (el) =>
        el.matches("summary, .cta, .unitlist a, .toc a, .pager a") ||
        (el.matches("button") && !el.classList.contains("gex-speak"));
      const label = (el) =>
        el.id ? "#" + el.id
          : el.className ? "." + String(el.className).trim().split(/\\s+/)[0]
            : el.tagName.toLowerCase();
      const out = [];
      const candidates = [...document.querySelectorAll("a[href], button, summary")].filter((el) => {
        // 문장 속 인라인 링크는 줄 높이에 묶여 있으므로 예외(WCAG 2.5.8 "Inline").
        if (el.tagName === "A" && getComputedStyle(el).display === "inline") return false;
        const r = el.getBoundingClientRect();
        return (r.width > 0 && r.height > 0) && (r.width < BIG || r.height < BIG);
      });
      for (const el of candidates.slice(0, 80)) {
        const need = isBig(el) ? BIG : SMALL;
        el.scrollIntoView({ block: "center", inline: "center" });
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.top < 0 || r.bottom > innerHeight) continue; // 화면 밖이면 히트 테스트를 건너뜁니다
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const d = need / 2 - 2; // 목표 크기의 가장자리에서 2px 안쪽
        const hits = (x, y) => {
          const t = document.elementFromPoint(x, y);
          return !!t && (t === el || el.contains(t) || t.contains(el));
        };
        const okY = r.height >= need || (hits(cx, cy - d) && hits(cx, cy + d));
        const okX = r.width >= need || (hits(cx - d, cy) && hits(cx + d, cy));
        if (!(okX && okY)) {
          out.push(label(el) + " " + Math.round(r.width) + "×" + Math.round(r.height) + " (필요 " + need + ")");
        }
      }
      return [...new Set(out)];
    })()`);
    check(
      smallTargets.length === 0,
      `${label}(${file}): 누르는 요소의 히트 영역이 충분합니다 (44px / 24px)` +
        (smallTargets.length ? ` — 부족: ${smallTargets.slice(0, 4).join(", ")}` : ""),
    );

    sharedCssUsers.push(wide.sheets.includes("site.css") ? file : `${file}(인라인)`);
    note(`${label} (${file}) · 요청 ${requests}개 · 배경 ${wide.bg} · 스타일 ${wide.sheets.includes("site.css") ? "site.css" : "인라인"}`);
  }
  note(`정적 페이지 ${STATIC_PAGES.length}개 점검 — 공용 스타일 사용 ${sharedCssUsers.filter((f) => !f.includes("(")).length}개`);

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
