#!/usr/bin/env node
/**
 * 배포본 성능 실측 — 첫 방문·재방문 전송량, FCP·LCP, 캐시 적중 (헤드리스 Chrome).
 *
 * 왜 필요한가:
 *   "가벼워졌다"는 말은 숫자로 확인해야 합니다. 특히 `tools/stage-site.mjs` 가 배포본을
 *   다듬는 일이 실제로 (1) 첫 방문을 무겁게 하지 않고 (2) 재방문을 가볍게 하는지,
 *   그리고 앱 스크립트·스타일(`assets/app.js`·`app.css`)이 캐시에 담기는지 봐야 합니다.
 *
 * 하는 일:
 *   1) 첫 방문 — 빈 캐시로 문서를 열고 요청 수 · 압축 전송량 · TTFB/FCP/LCP/DCL/load
 *   2) 재방문   — 새로고침해 HTTP 캐시·서비스 워커가 얼마나 돌려주는지(전송량·캐시 적중 수)
 *   3) 가장 큰 파일 몇 개 (압축된 크기 기준)
 *
 * 실행:
 *   node tools/measure-perf.mjs                    # 저장소 루트(원본)
 *   node tools/measure-perf.mjs --site-root _site  # 배포본(분리·최소화된 결과)
 *   node tools/measure-perf.mjs --live             # 배포된 사이트
 *   node tools/measure-perf.mjs --compare          # 원본 vs _site 를 한 번에 재고 차이를 표로
 *   node tools/measure-perf.mjs --top 8
 * 종료 코드: 문제가 있으면 1, 아니면 0
 *
 * 로컬 계측에는 gzip 을 걸어 둡니다(배포 서버와 같은 조건 — 압축 여부가 전송량을 크게 바꿉니다).
 * 외부 의존성 없음(Node 내장 모듈 + DevTools 프로토콜만 사용).
 */

import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MIME = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".txt": "text/plain;charset=utf-8",
  ".json": "application/json",
};
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml)|image\/svg)/;

const number = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : Number(process.argv[i + 1]) || fallback;
};
const TOP = number("--top", 6);
const LIVE = process.argv.includes("--live");
const COMPARE = process.argv.includes("--compare");
const LIVE_SITE = "https://toeic.monster";

const rootArgIndex = process.argv.findIndex((a) => a === "--site-root" || a.startsWith("--site-root="));
const siteRootArg = (() => {
  if (rootArgIndex < 0) return null;
  return process.argv[rootArgIndex].includes("=")
    ? process.argv[rootArgIndex].split("=").slice(1).join("=")
    : process.argv[rootArgIndex + 1] || "";
})();

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
  console.log("ℹ️  Chrome 을 찾지 못해 계측을 건너뜁니다 (CHROME_BIN 으로 지정할 수 있습니다).");
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/* 1. 로컬 서버 (gzip) — 배포 서버와 같은 조건으로 재기 위해            */
/* ------------------------------------------------------------------ */

const servers = [];

/** 폴더 하나를 gzip 으로 내려보내는 서버를 띄우고 주소를 돌려줍니다. */
async function serve(dir) {
  const root = path.resolve(ROOT, dir);
  if (!fs.existsSync(root)) throw new Error(`폴더가 없습니다 — ${dir} (npm run stage 를 먼저 돌리세요)`);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent((req.url || "/").split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    const f = path.join(root, p);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404, { "content-type": "text/plain;charset=utf-8" });
      res.end("not found");
      return;
    }
    const type = MIME[path.extname(f)] || "application/octet-stream";
    const body = fs.readFileSync(f);
    if (COMPRESSIBLE.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
      const gz = zlib.gzipSync(body, { level: 6 });
      res.writeHead(200, {
        "content-type": type,
        "content-encoding": "gzip",
        "content-length": gz.length,
        vary: "accept-encoding",
      });
      res.end(gz);
      return;
    }
    res.writeHead(200, { "content-type": type, "content-length": body.length });
    res.end(body);
  });
  servers.push(server);
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return `http://127.0.0.1:${server.address().port}`;
}

/* ------------------------------------------------------------------ */
/* 2. 헤드리스 Chrome (계측용 프로필 하나)                              */
/* ------------------------------------------------------------------ */

const profile = path.join(os.tmpdir(), `toeic-measure-perf-${process.pid}`);
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

async function debuggerPort() {
  const file = path.join(profile, "DevToolsActivePort");
  for (let i = 0; i < 100; i++) {
    if (fs.existsSync(file)) {
      const [p] = fs.readFileSync(file, "utf8").split("\n");
      if (p) return Number(p);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Chrome DevTools 에 연결하지 못했습니다.");
}

const cdp = `http://127.0.0.1:${await debuggerPort()}`;

async function shutdown(code) {
  try {
    const v = await (await fetch(cdp + "/json/version")).json();
    const w = new WebSocket(v.webSocketDebuggerUrl);
    await new Promise((r) => w.addEventListener("open", r, { once: true }));
    w.send(JSON.stringify({ id: 1, method: "Browser.close" }));
    await new Promise((r) => setTimeout(r, 800));
  } catch {
    /* 무시 */
  }
  chrome.kill();
  servers.forEach((s) => s.close());
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* Windows 에서 가끔 잠겨 있습니다 */
  }
  process.exit(code);
}

/* ------------------------------------------------------------------ */
/* 3. 계측                                                             */
/* ------------------------------------------------------------------ */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const KB = (n) => `${(n / 1024).toFixed(1)}KB`;
const problems = [];
const note = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  console.log(`  ✗ ${msg}`);
  problems.push(msg);
};

let BASE = LIVE_SITE;
if (!LIVE) {
  const targets = COMPARE ? [null, siteRootArg || "_site"] : [siteRootArg];
  if (COMPARE) {
    BASE = { "저장소 원본": await serve("."), "배포본(_site)": await serve(targets[1]) };
  } else {
    BASE = await serve(targets[0] || ".");
  }
}

// 빈 탭으로 열고 계측을 먼저 준비합니다(URL 로 열면 그 첫 로드가 재지 못한 채 지나갑니다).
const tab = await (await fetch(`${cdp}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
const events = [];
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
    return;
  }
  if (msg.method) events.push(msg);
});
await new Promise((r) => ws.addEventListener("open", r, { once: true }));

const send = (method, params = {}) =>
  new Promise((res) => {
    const id = ++nextId;
    pending.set(id, res);
    ws.send(JSON.stringify({ id, method, params }));
  });

/**
 * 페이지 안에서 돌릴 계측 코드 — 문서 스크립트보다 먼저 심습니다.
 * FCP·LCP 는 그려지는 순간에만 알 수 있어 미리 관찰자를 걸어 둡니다.
 * (CDP 를 넘길 때 줄바꿈은 이스케이프하지 않고 그대로 넣습니다 — 문자열 안에 넣지 않습니다.)
 */
const BOOTSTRAP = `
window.__perf = { lcp: 0, cls: 0, fcp: 0, longTasks: 0, longMs: 0, idleUntil: 0 };
try {
  // 첫 화면이 뜬 뒤 브라우저가 얼마나 오래 \"바쁴\" 수 있는지를 보려고 긴 작업(long task · 50ms 이상)을 셽니다.
  // 데이터·섹션 렌더를 뒤로 미루는 일의 효과는 전송량이 아니라 이 값으로 드러납니다.
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (e) {
      window.__perf.longTasks++;
      window.__perf.longMs += Math.round(e.duration);
      // 마지막 긴 작업이 끝난 시점 — \"첫 입력이 먹기 시작하는 시간\"의 근사치입니다.
      window.__perf.idleUntil = Math.round(e.startTime + e.duration);
    });
  }).observe({ type: "longtask", buffered: true });
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (e) {
      if (e.startTime > window.__perf.lcp) window.__perf.lcp = e.startTime;
    });
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (e) {
      if (!e.hadRecentInput) window.__perf.cls += e.value;
    });
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver(function (list) {
    list.getEntries().forEach(function (e) {
      if (e.name === "first-contentful-paint") window.__perf.fcp = e.startTime;
    });
  }).observe({ type: "paint", buffered: true });
} catch (e) {}
`;

/** 한 번의 방문을 재고 { requests, bytes, cache, metrics, biggest } 를 돌려줍니다. */
async function visit({ label, url, reload }) {
  events.length = 0;
  if (reload) await send("Page.reload", { ignoreCache: false });
  else await send("Page.navigate", { url });
  // load 뒤에도 늦게 오는 요청(웹폰트·분석)이 있어 잠깐 더 봅니다.
  for (let i = 0; i < 40; i++) {
    const ready = events.some((e) => e.method === "Page.loadEventFired");
    if (ready && i > 6) break;
    await wait(250);
  }

  const urls = new Map();
  const kinds = new Map();
  const done = new Map();
  const cache = { disk: [], serviceWorker: [], memory: [], network: [] };
  for (const e of events) {
    if (e.method === "Network.requestWillBeSent") {
      urls.set(e.params.requestId, e.params.request.url);
      kinds.set(e.params.requestId, e.params.type || "Other");
    }
    if (e.method === "Network.responseReceived") {
      const r = e.params.response;
      const u = urls.get(e.params.requestId) || r.url;
      if (r.fromDiskCache) cache.disk.push(u);
      else if (r.fromServiceWorker) cache.serviceWorker.push(u);
      else if (r.fromPrefetchCache) cache.memory.push(u);
      else cache.network.push(u);
    }
    if (e.method === "Network.loadingFinished") {
      done.set(e.params.requestId, Math.round(e.params.encodedDataLength || 0));
    }
  }

  const items = [...done].map(([id, bytes]) => ({
    url: urls.get(id) || "(알 수 없음)",
    kind: kinds.get(id) || "Other",
    bytes,
  }));
  const bytes = items.reduce((n, it) => n + it.bytes, 0);
  const biggest = [...items].sort((a, b) => b.bytes - a.bytes).slice(0, TOP);
  // 종류별 합계 — "무엇이 무거운가"를 바로 보기 위해서(Font 가 큰 경우가 많습니다).
  const byKind = [...items.reduce((m, it) => m.set(it.kind, (m.get(it.kind) || 0) + it.bytes), new Map())]
    .sort((a, b) => b[1] - a[1]);

  const perf = await (async () => {
    const r = await send("Runtime.evaluate", {
      expression: `(() => {
        const nav = performance.getEntriesByType("navigation")[0] || {};
        const p = window.__perf || {};
        return {
          ttfb: Math.round(nav.responseStart || 0),
          fcp: Math.round(p.fcp || 0),
          lcp: Math.round(p.lcp || 0),
          cls: Number((p.cls || 0).toFixed(3)),
          dcl: Math.round(nav.domContentLoadedEventEnd || 0),
          load: Math.round(nav.loadEventEnd || 0),
          longTasks: p.longTasks || 0,
          longMs: p.longMs || 0,
          idleUntil: p.idleUntil || 0,
          nodes: document.getElementsByTagName("*").length,
          scripts: document.scripts.length,
        };
      })()`,
      returnByValue: true,
    });
    return r.result?.result?.value || {};
  })();

  // 브라우저가 문서를 그리는 데 쓴 작업 시간(스크립트·레이아웃·스타일) — 전송량과 별개로 "가벼운가"를 봅니다.
  const engine = await (async () => {
    const r = await send("Performance.getMetrics");
    const m = new Map((r.result?.metrics || []).map((x) => [x.name, x.value]));
    const ms = (name) => Math.round((m.get(name) || 0) * 1000);
    return {
      scriptMs: ms("ScriptDuration"),
      taskMs: ms("TaskDuration"),
      layoutMs: ms("LayoutDuration"),
      styleMs: ms("RecalcStyleDuration"),
      heapKB: Math.round((m.get("JSHeapUsedSize") || 0) / 1024),
    };
  })();

  return {
    label,
    requests: items.length,
    bytes,
    biggest,
    byKind,
    perf,
    engine,
    cached: cache.disk.length + cache.serviceWorker.length + cache.memory.length,
    cache,
  };
}

/** Network 타입을 사람이 읽는 이름으로. */
const KIND_LABEL = {
  Document: "문서",
  Script: "스크립트",
  Stylesheet: "스타일",
  Font: "폰트",
  Image: "이미지",
  XHR: "요청",
  Fetch: "요청",
  Manifest: "매니페스트",
  Other: "기타",
};
const kindsLine = (r) => {
  if (!r.byKind.length) return "";
  const top = r.byKind.slice(0, 5).map(([k, v]) => `${KIND_LABEL[k] || k} ${KB(v)}`);
  return `  종류별: ${top.join(" · ")}`;
}

const fmtMs = (v) => `${v}ms`;
/** 시작 작업량 — 첫 화면이 뜬 뒤 브라우저가 쓰는 시간(전송량과 별개인 "가벼움" 지표). */
const engineLine = (r) =>
  `  작업량: 긴 작업 ${r.perf.longTasks}개 · ${r.perf.longMs}ms · 마지막 ${r.perf.idleUntil}ms` +
  ` · 스크립트 실행 ${r.engine.scriptMs}ms · 레이아웃 ${r.engine.layoutMs}ms` +
  ` · DOM 노드 ${r.perf.nodes.toLocaleString("en-US")}개 · 힙 ${r.engine.heapKB}KB`;

const line = (r) =>
  `${r.label.padEnd(8)} 요청 ${String(r.requests).padStart(3)}개 · 전송 ${KB(r.bytes).padStart(9)}` +
  ` · 캐시 ${String(r.cached).padStart(3)}개` +
  ` · TTFB ${fmtMs(r.perf.ttfb)} · FCP ${fmtMs(r.perf.fcp)} · LCP ${fmtMs(r.perf.lcp)}` +
  ` · DCL ${fmtMs(r.perf.dcl)} · load ${fmtMs(r.perf.load)}` +
  (r.perf.cls ? ` · CLS ${r.perf.cls}` : "");

/**
 * 한 대상(원본 또는 배포본)을 첫 방문·재방문으로 재고 결과를 돌려줍니다.
 * 대상이 바뀔 때는 캐시를 비웁니다 — 안 비우면 먼저 잰 대상이 받아 둔 웹폰트(다른 출처라
 * 주소가 같습니다)가 캐시에 남아, 두 번째 대상이 "첫 방문"인데도 수백 KB 를 아낀 것처럼 보입니다.
 */
async function measure(target, { fresh = false } = {}) {
  const url = `${target}/`;
  if (fresh) await send("Network.clearBrowserCache");
  const cold = await visit({ label: "첫 방문", url });
  const warm = await visit({ label: "재방문", url, reload: true });
  return { cold, warm };
}

// 계측 준비 — Network 를 켜지 않으면 요청·전송량 이벤트가 오지 않습니다.
await send("Runtime.enable");
await send("Page.enable");
await send("Network.enable");
await send("Performance.enable"); // 작업 시간(스크립트·레이아웃·스타일)·힙 — "가벼운가"를 보는 지표
await send("Emulation.setDeviceMetricsOverride", { width: 1100, height: 820, deviceScaleFactor: 1, mobile: false });
await send("Page.addScriptToEvaluateOnNewDocument", { source: BOOTSTRAP });

const results = new Map();

if (typeof BASE === "object") {
  for (const [name, target] of Object.entries(BASE)) results.set(name, await measure(target, { fresh: true }));
} else {
  const name = LIVE ? "배포된 사이트" : siteRootArg ? `_site(${siteRootArg})` : "저장소 원본";
  results.set(name, await measure(BASE));
}

console.log("");
console.log("════════ 성능 실측 ════════");
console.log(
  `대상: ${[...results.keys()].join(" · ")}` +
    (LIVE ? ` (${LIVE_SITE})` : " (로컬 · gzip 적용)") +
    " · 헤드리스 Chrome",
);
for (const [name, r] of results) {
  console.log("");
  console.log(`[${name}]`);
  console.log(`  ${line(r.cold)}`);
  console.log(kindsLine(r.cold));
  console.log(engineLine(r.cold));
  console.log(`  ${line(r.warm)}`);
  console.log(
    `  큰 파일: ` + r.cold.biggest.map((b) => `${b.url.replace(/^https?:\/\/[^/]+/, "")} ${KB(b.bytes)}`).join(" · "),
  );
  // 재방문에 남는 전송은 대부분 서비스 워커의 배경 재확인(stale-while-revalidate)입니다.
  // 화면을 막지 않는다는 것을 알 수 있게 따로 적습니다.
  if (r.warm.bytes > 0) {
    console.log(
      `  재방문 잔여: ` + r.warm.biggest.map((b) => `${b.url.replace(/^https?:\/\/[^/]+/, "")} ${KB(b.bytes)}`).join(" · "),
    );
  }
}

if (results.size === 2) {
  const [a, b] = [...results.values()];
  const names = [...results.keys()];
  const pct = (from, to) => (from ? `${(((to - from) / from) * 100).toFixed(0)}%` : "-");
  console.log("");
  console.log("── 원본 → 배포본 ──");
  console.log(
    `  첫 방문 전송량 ${KB(a.cold.bytes)} → ${KB(b.cold.bytes)} (${pct(a.cold.bytes, b.cold.bytes)})` +
      ` · 요청 ${a.cold.requests} → ${b.cold.requests}`,
  );
  console.log(
    `  재방문 전송량 ${KB(a.warm.bytes)} → ${KB(b.warm.bytes)} (${pct(a.warm.bytes, b.warm.bytes)})` +
      ` · 캐시 적중 ${a.warm.cached} → ${b.warm.cached}`,
  );
  console.log(
    `  LCP ${fmtMs(a.cold.perf.lcp)} → ${fmtMs(b.cold.perf.lcp)}` +
      ` · FCP ${fmtMs(a.cold.perf.fcp)} → ${fmtMs(b.cold.perf.fcp)}`,
  );
  console.log(`  (${names[0]} → ${names[1]})`);
}

/* 자명하게 깨진 것만 실패로 봅니다 — 성능 수치는 기계마다 다릅니다. */
for (const [name, r] of results) {
  if (!r.cold.requests) fail(`${name}: 문서를 열지 못했습니다(요청 0개).`);
  else if (!r.cold.perf.load) fail(`${name}: load 이벤트를 받지 못했습니다.`);
  else note(`${name}: 첫 방문 ${KB(r.cold.bytes)} · 재방문 ${KB(r.warm.bytes)}`);
}
if (results.size === 2) {
  const [a, b] = [...results.values()];
  // 첫 방문은 5% 까지 여유를 둡니다(로컬 계측 잡음).
  // 재방문은 예전에 "배포본이 더 가볍다"를 요구했는데, 이제 앱 스크립트·데이터까지 원본부터
  // 파일로 나뉘어 있어(docs/app-split-plan.md 2·3단계) 그 차이가 0.1KB 반올림에 묻히는 잡음이 됐습니다.
  // 그래서 기준을 "늘지 않았다"로 맞춥니다 — 계획서의 완료 기준도 그 값입니다.
  //
  // 재방문 잔여분은 대부분 분석 비콘(/api/send)과 캐시 재검증(0바이트)이고, 실행할 때마다 몇 바이트씩
  // 달라집니다(0.3KB ↔ 0.3KB 가 309B → 313B 로 흔들려 실패로 잡힌 적이 있습니다).
  // 그래서 1KB 까지는 같은 것으로 봅니다 — 이 기준이 잡으려는 것은 "재방문에 무언가를 새로 받는 것"입니다.
  const WARM_NOISE = 1024;
  const coldOk = b.cold.bytes <= a.cold.bytes * 1.05;
  const warmOk = b.warm.bytes <= a.warm.bytes + WARM_NOISE;
  (coldOk ? note : fail)(
    `첫 방문이 무거워지지 않았습니다 (${KB(a.cold.bytes)} → ${KB(b.cold.bytes)})`,
  );
  (warmOk ? note : fail)(
    `재방문이 무거워지지 않았습니다 (${KB(a.warm.bytes)} → ${KB(b.warm.bytes)} · ` +
      `${a.warm.bytes}B → ${b.warm.bytes}B · 잡음 허용 ${WARM_NOISE}B)`,
  );
}

console.log("");
if (problems.length) {
  console.log(`❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  await shutdown(1);
}
console.log("✅ 성능 실측 완료");
await shutdown(0);
