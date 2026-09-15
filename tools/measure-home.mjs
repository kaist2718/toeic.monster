#!/usr/bin/env node
/**
 * 홈 화면 길이 계측 + 묶음 아코디언 동작 점검 — 헤드리스 Chrome.
 *
 * 왜 필요한가:
 *   "홈이 길다"는 체감은 원인이 여러 개입니다(섹션 수 · 각 섹션 높이 · 접힘 여부).
 *   어떤 섹션이 페이지를 실제로 길게 만드는지 모르면 어디를 접을지 정할 수 없습니다.
 *   그리고 접었다면 "접힌 곳으로 이동하는 길"이 실제로 뚫려 있는지도 확인해야 합니다.
 *
 * 하는 일:
 *   1) 문서 전체 스크롤 높이 · 묶음 상태 · 섹션별 높이(긴 순)
 *   2) 상호작용 점검 — 접힌 묶음 안으로 가는 세 가지 길이 모두 열리는지
 *        · 섹션 메뉴 칩 클릭        · 주소 해시(#…) 직접 진입        · 인쇄(beforeprint)
 *
 * 실행:  node tools/measure-home.mjs                 (1100px)
 *        node tools/measure-home.mjs --width 375     (모바일 폭)
 *        node tools/measure-home.mjs --all-closed    (모두 접었을 때 높이도 함께)
 *        node tools/measure-home.mjs --top 15
 * 종료 코드: 동작 점검이 실패하면 1, 아니면 0
 *
 * 외부 의존성 없음(Node 내장 모듈 + DevTools 프로토콜만 사용).
 */

import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
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

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : Number(process.argv[i + 1]) || fallback;
};
const TOP = arg("--top", Infinity);
const WIDTH = arg("--width", 1100);

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

/* ---------------- 임시 서버 + 헤드리스 Chrome ---------------- */

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
const port = server.address().port;

const profile = path.join(os.tmpdir(), `toeic-measure-home-${process.pid}`);
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
  server.close();
  try {
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  } catch {
    /* Windows 에서 가끔 잠겨 있습니다 */
  }
  process.exit(code);
}

/* ---------------- 계측 ---------------- */

const site = `http://127.0.0.1:${port}/index.html`;
const target = await (await fetch(`${cdp}/json/new?${encodeURIComponent(site)}`, { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let nextId = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
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
  if (r.result?.exceptionDetails) throw new Error("평가 실패: " + r.result.exceptionDetails.text);
  return r.result?.result?.value;
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const failures = [];
const check = (ok, msg) => {
  console.log(`  ${ok ? "✓" : "✗"} ${msg}`);
  if (!ok) failures.push(msg);
};

await send("Runtime.enable");
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: 820, deviceScaleFactor: 1, mobile: false });
// 스크롤 애니메이션을 끄고 이동 결과를 곧바로 확인할 수 있게 합니다.
await send("Emulation.setEmulatedMedia", {
  features: [{ name: "prefers-reduced-motion", value: "reduce" }],
});
await send("Page.reload", { ignoreCache: true });

for (let i = 0; i < 60; i++) {
  if ((await evaluate(`document.querySelectorAll("#homeView .home-section").length`)) >= 52) break;
  await wait(500);
}
await wait(1000);

const GROUPS = await evaluate(`[...document.querySelectorAll("#homeView details.home-group")].map((d) => ({
  id: d.id,
  title: d.querySelector(".home-group-title").textContent.trim(),
  meta: d.querySelector(".home-group-meta").textContent.trim(),
  open: d.open,
  sections: d.querySelectorAll(".home-section").length,
}))`);

const data = await evaluate(`(() => {
  const secs = [...document.querySelectorAll("#homeView .home-section")];
  const d = document.documentElement;
  return {
    docHeight: d.scrollHeight,
    homeHeight: Math.round(document.getElementById("homeView").getBoundingClientRect().height),
    sectionCount: secs.length,
    sections: secs.map((s, i) => ({
      i: i + 1,
      label: s.getAttribute("aria-label") || "(라벨 없음)",
      h: Math.round(s.getBoundingClientRect().height),
      hidden: !!s.closest("details:not([open])"),
    })),
  };
})()`);

const total = data.sections.reduce((n, s) => n + s.h, 0);

console.log("");
console.log(`════════ 홈 화면 길이 계측 (${WIDTH}px) ════════`);
console.log(`문서 전체 스크롤 높이 : ${data.docHeight.toLocaleString("en-US")}px`);
console.log(`#homeView 높이        : ${data.homeHeight.toLocaleString("en-US")}px`);
console.log(`홈 섹션 개수          : ${data.sectionCount}개`);
console.log(`묶음(기본 펼침)       : ${GROUPS.map((g) => `${g.title} ${g.open ? "펼침" : "접힘"}`).join(" · ")}`);
const closedCount = data.sections.filter((s) => s.hidden).length;
console.log(`접힌 묶음 안 섹션      : ${closedCount}개 / 전체 ${data.sectionCount}개`);
// "전부 접었을 때"는 기본 펼침을 어디까지 열어 둘지 정하는 근거가 됩니다.
if (process.argv.includes("--all-closed")) {
  const allClosed = await evaluate(
    `(() => {
       [...document.querySelectorAll("#homeView details.home-group")].forEach((d) => { d.open = false; });
       return document.documentElement.scrollHeight;
     })()`,
  );
  console.log(`전부 접었을 때 높이    : ${allClosed.toLocaleString("en-US")}px`);
  await evaluate(`document.querySelector("#homeView details.home-group").open = true`);
}
console.log("");
console.log(`── 긴 섹션 상위 ${Math.min(TOP, data.sectionCount)}개 (접힘 표시 ●) ──`);
for (const s of [...data.sections].sort((a, b) => b.h - a.h).slice(0, TOP)) {
  const bar = "█".repeat(Math.max(1, Math.round(s.h / 200)));
  console.log(`${String(s.i).padStart(2)}위  ${String(s.h).padStart(6)}px ${s.hidden ? "●" : " "} ${bar}  ${s.label}`);
}

/* ---------------- 상호작용 점검 ---------------- */
// 접었다면 "접힌 곳으로 가는 길"이 뚫려 있어야 합니다. 세 가지 진입로를 모두 봅니다.

console.log("");
console.log("── 묶음 동작 점검 ──");

/** 접힌 묶음과 그 안의 섹션 하나를 골라 돌려줍니다. */
const pick = await evaluate(`(() => {
  const g = [...document.querySelectorAll("#homeView details.home-group")].find((d) => !d.open);
  if (!g) return null;
  const s = g.querySelector(".home-section");
  return { group: g.id, label: s.getAttribute("aria-label") };
})()`);

if (!pick) {
  console.log("  ℹ️  접힌 묶음이 없어 동작 점검을 건너뜁니다.");
} else {
  // 1) 섹션 메뉴 칩
  const viaChip = await evaluate(`(() => {
    const g = document.getElementById(${JSON.stringify(pick.group)});
    const chip = [...document.querySelectorAll(".sn-chip")]
      .find((c) => c.getAttribute("data-target") === ${JSON.stringify(pick.label)});
    if (!chip) return { found: false };
    chip.click();
    const sec = g.querySelector('.home-section[aria-label=' + JSON.stringify(${JSON.stringify(pick.label)}) + ']');
    const r = sec.getBoundingClientRect();
    return { found: true, opened: g.open, inView: r.top >= -2 && r.top < innerHeight };
  })()`);
  check(viaChip.found, `「${pick.label}」 섹션 메뉴 칩을 찾았습니다(묶음 ${pick.group})`);
  check(viaChip.opened, "칩을 누르면 접힌 묶음이 먼저 펼쳐집니다");
  check(viaChip.inView, "펼친 뒤 해당 섹션이 화면에 들어옵니다");

  // 2) 주소 해시로 직접 진입 (goToHash 경로)
  await evaluate(`document.getElementById(${JSON.stringify(pick.group)}).open = false`);
  const viaHash = await evaluate(`(() => {
    location.hash = "#" + encodeURIComponent(${JSON.stringify(pick.label)});
    return true;
  })()`);
  await wait(300);
  const hashState = await evaluate(
    `document.getElementById(${JSON.stringify(pick.group)}).open`,
  );
  check(viaHash && hashState, "주소 해시로 들어와도 접힌 묶음이 펼쳐집니다");
  await evaluate(`history.replaceState(null, "", location.pathname)`);

  // 3) 인쇄 — 닫힌 채로 나가면 종이에서 내용이 통째로 빠집니다.
  const before = await evaluate(`[...document.querySelectorAll("#homeView details.home-group")].filter((d) => !d.open).length`);
  await evaluate(`window.dispatchEvent(new Event("beforeprint"))`);
  const during = await evaluate(`[...document.querySelectorAll("#homeView details.home-group")].filter((d) => !d.open).length`);
  check(before > 0 && during === 0, `인쇄 전에 접힌 묶음을 모두 펼칩니다(${before}개 → ${during}개)`);
  await evaluate(`window.dispatchEvent(new Event("afterprint"))`);
  const after = await evaluate(`[...document.querySelectorAll("#homeView details.home-group")].filter((d) => !d.open).length`);
  check(after === before, `인쇄가 끝나면 접힘 상태로 돌아옵니다(${during}개 → ${after}개)`);
}

console.log("");
if (failures.length) {
  console.log(`❌ 묶음 동작 점검 ${failures.length}건 실패`);
  shutdown(1);
} else {
  console.log("✅ 묶음 동작 점검 통과");
  shutdown(0);
}
