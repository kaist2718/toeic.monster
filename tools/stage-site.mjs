#!/usr/bin/env node
/**
 * 배포용 사이트 폴더(_site) 구성 — 공개할 파일만 골라 담습니다.
 *
 * 왜 필요한가:
 *   이 저장소는 사이트 파일과 운영 도구가 한 루트에 섞여 있습니다. main 브랜치를
 *   그대로 배포하면 tools/·promo/·docs/·package.json 까지 인터넷에 공개됩니다
 *   (docs/monetization-strategy.md 같은 내부 문서 포함). 그래서 배포 전에
 *   **공개 목록에 있는 파일만** _site 로 복사하고, 빠진 것이 없는지 검증합니다.
 *
 * 무엇을 하는가:
 *   0) 담으면서 배포본을 다듬습니다 — 주석과 태그 사이 공백을 걷고, 남아 있는 큰 인라인
 *      <style>·<script> 가 있으면 assets/*.css·*.js 로 빼냅니다.
 *      앱 스타일(assets/app.css · docs/app-split-plan.md 1단계)과 앱 스크립트(assets/app.js ·
 *      2단계)는 2026-09-18 부터 저장소 원본이 파일이라 배포본에서 따로 빼내지 않습니다.
 *      저장소의 원본은 그대로 두고 _site 에만 적용합니다.
 *      실측: index.html 628KB → 290KB + app.js 354KB · app.css 80KB(재방문 시 캐시)
 *
 * 무엇을 검사하는가:
 *   ① 공개 목록의 파일·폴더가 실제로 있는가 (없으면 실패 — 조용히 빠지는 것을 막습니다)
 *   ② sitemap.xml 의 모든 URL 이 _site 안에 실제 파일로 존재하는가
 *      (새 섹션을 만들고 공개 목록에 넣지 않으면 여기서 걸립니다)
 *   ③ _site 안의 HTML 이 부르는 로컬 자산(link·script·img)이 모두 있는가
 *      (인라인 CSS 를 뺀 뒤에도 그 link 가 실제로 있는지 여기서 확인됩니다)
 *   ④ _site 안에 개발·운영 경로(tools/·promo/·docs/·package.json)가 섞이지 않았는가
 *
 * 실행:  node tools/stage-site.mjs
 * 종료 코드: 문제가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const SITE = "https://toeic.monster";

/** 사이트로 그대로 배포하는 루트 파일. 새 파일을 만들면 여기에도 넣어야 배포됩니다. */
const PUBLIC_FILES = [
  "index.html",
  "404.html",
  "privacy.html",
  "terms.html",
  "manifest.webmanifest",
  "sw.js",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  "icon.svg",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "apple-touch-icon.png",
  "og-image.png",
];

/** 사이트로 그대로 배포하는 폴더. */
const PUBLIC_DIRS = ["assets", "data", "units", "guides", "grammar", "conversation"];

/** _site 안에 절대 있으면 안 되는 것들(개발·운영 자료). */
const NEVER_PUBLIC = ["tools", "promo", "docs", ".github", "package.json", ".gitignore", "_site"];

const problems = [];
const fail = (msg) => problems.push(msg);
const exists = (p) => fs.existsSync(path.join(ROOT, p));

/* ------------------------------------------------------------------ */
/* 1. _site 새로 만들고 공개 목록만 복사                                */
/* ------------------------------------------------------------------ */

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

let fileCount = 0;
let byteCount = 0;

for (const f of PUBLIC_FILES) {
  if (!exists(f)) {
    fail(`공개 목록에 있는 파일이 없습니다 — ${f}`);
    continue;
  }
  fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  fileCount++;
  byteCount += fs.statSync(path.join(OUT, f)).size;
}

for (const dir of PUBLIC_DIRS) {
  const from = path.join(ROOT, dir);
  if (!exists(dir)) {
    fail(`공개 목록에 있는 폴더가 없습니다 — ${dir}/ (빌드를 돌렸나요?)`);
    continue;
  }
  fs.cpSync(from, path.join(OUT, dir), { recursive: true });
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else {
        fileCount++;
        byteCount += fs.statSync(full).size;
      }
    }
  };
  walk(path.join(OUT, dir));
}

/* ------------------------------------------------------------------ */
/* 1-2. 배포본 다듬기 — 인라인 CSS 분리 · HTML 최소화                   */
/* ------------------------------------------------------------------ */

/**
 * <script>·<style>·<pre>·<textarea> 안쪽은 손대지 않습니다.
 * JS 안의 문자열(`a  b`)이나 CSS 의 선택자 사이 공백이 합쳐지면 동작이 바뀝니다.
 */
function protectBlocks(html) {
  const kept = [];
  const masked = html.replace(/<(script|style|pre|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, (m) => {
    kept.push(m);
    return `\u0000${kept.length - 1}\u0000`;
  });
  return { masked, restore: (s) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => kept[Number(i)]) };
}

/** 주석을 지우고 태그 사이 공백만 걷어냅니다(텍스트 안쪽 공백은 그대로 — `white-space: pre-wrap` 대비). */
function minifyHtml(html) {
  const { masked, restore } = protectBlocks(html);
  const out = masked.replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><");
  return restore(out);
}

/**
 * 남아 있는 큰 인라인 <style>·<script> 를 assets/*.css·assets/*.js 로 빼고 link·script src 로 바꿉니다.
 * 반환: {html, files}(파일은 _site 기준 상대 경로).
 *
 * 왜 이렇게 하나:
 *   앱 스크립트는 2026-09-18 부터 원본부터 assets/app.js 파일이고(docs/app-split-plan.md 2단계),
 *   index.html 은 그 파일을 <script defer src> 로 부릅니다. 그래서 앱은 여기서 빼낼 것이 없고,
 *   정적 페이지·앞으로 추가될 코드에 큰 인라인 블록이 남아 있을 때만 같은 방식으로 빼냅니다.
 *   (실측: index.html 628KB → 290KB, app.js 354KB · app.css 80KB 는 재방문 시 캐시)
 */
function splitInlineBlocks(html, page) {
  const dir = path.posix.dirname(page);
  // 파일 이름은 `p-페이지` 꼴입니다. 예전에는 index.html 만 `app` 이었는데,
  // 이제 앱 스크립트·스타일이 원본부터 assets/app.js·app.css 라 이름이 부딪힐 수 있어
  // 다른 페이지와 같은 규칙을 씁니다(그 큰 인라인 블록이 복사한 app.js 를 덮어쓰지 않게).
  const base = "p-" + page.replace(/\.html$/, "").replace(/\//g, "-");
  const files = new Map();
  const counters = { css: 0, js: 0 };

  /** @param {"css"|"js"} kind */
  const fileName = (kind) => {
    counters[kind] += 1;
    const suffix = counters[kind] === 1 ? "" : `-${counters[kind]}`;
    return path.posix.join("assets", `${base}${suffix}.${kind}`);
  };

  const out = html
    .replace(/<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi, (whole, attrs, body) => {
      if (Buffer.byteLength(body, "utf8") < 2048) return whole;
      const name = fileName("css");
      const media = (/\bmedia="([^"]*)"/i.exec(attrs) || [])[1];
      files.set(name, body.replace(/^\s+|\s+$/g, ""));
      const href = path.posix.relative(dir, name);
      return `<link rel="stylesheet" href="${href}"${media ? ` media="${media}"` : ""}>`;
    })
    .replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (whole, attrs, body) => {
      // JSON-LD(`type=…`)는 구조화 데이터라 문서 안에 있어야 하고, src 가 있으면 이미 외부 파일입니다.
      if (/\btype=/i.test(attrs) || /\bsrc=/i.test(attrs)) return whole;
      if (Buffer.byteLength(body, "utf8") < 4096) return whole;
      const name = fileName("js");
      files.set(name, body.replace(/^\s+|\s+$/g, ""));
      // defer — 맨 뒤에 있어 실행 순서가 그대로입니다(앱이 readyState 를 보고 시작합니다).
      //          파서를 막지 않아 첫 화면이 먼저 그려집니다.
      return `<script defer src="${path.posix.relative(dir, name)}"></script>`;
    });

  return { html: out, files };
}

// _site 안 HTML 을 모아 다듬기 전후 크기를 기록합니다.
const stagedHtml = [];
(function collect(dir, prefix) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) collect(path.join(dir, e.name), rel);
    else if (e.name.endsWith(".html")) stagedHtml.push(rel);
  }
})(OUT, "");

let rawHtml = 0;
let slimHtml = 0;
let splitOut = 0;
const splitFiles = [];

for (const page of stagedHtml) {
  const full = path.join(OUT, page);
  const original = fs.readFileSync(full, "utf8");
  const split = splitInlineBlocks(original, page);
  for (const [name, body] of split.files) {
    fs.mkdirSync(path.dirname(path.join(OUT, name)), { recursive: true });
    const bytes = Buffer.byteLength(body, "utf8") + 1;
    fs.writeFileSync(path.join(OUT, name), body + "\n", "utf8");
    splitFiles.push(`${name} ${(bytes / 1024).toFixed(1)}KB`);
    splitOut += bytes;
    fileCount++;
    byteCount += bytes;
  }
  const slim = minifyHtml(split.html);
  const before = fs.statSync(full).size;
  const after = Buffer.byteLength(slim, "utf8");
  rawHtml += before;
  slimHtml += after;
  byteCount += after - before;
  fs.writeFileSync(full, slim, "utf8");
}

/* ------------------------------------------------------------------ */
/* 2. 검증                                                             */
/* ------------------------------------------------------------------ */

/** _site 안에 실제로 있는 파일인지. */
const inSite = (rel) => fs.existsSync(path.join(OUT, rel));

/** URL·상대 주소를 _site 기준 상대 경로로 바꿉니다(디렉터리 주소는 index.html). */
const toFile = (entry) => {
  let f = String(entry).trim().replace(/^\.?\//, "");
  if (f === "" || f.endsWith("/")) f += "index.html";
  return f;
};

// ② sitemap.xml 의 모든 URL 이 _site 에 있는가
const sitemapPath = path.join(OUT, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) {
  fail("sitemap.xml 이 _site 에 없습니다.");
} else {
  const locs = [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (!locs.length) fail("sitemap.xml 에 <loc> 항목이 없습니다.");
  for (const loc of locs) {
    if (!loc.startsWith(SITE)) {
      fail(`sitemap.xml: 다른 사이트 주소가 들어 있습니다 — ${loc}`);
      continue;
    }
    const rel = toFile(loc.slice(SITE.length));
    if (!inSite(rel)) {
      fail(
        `sitemap.xml 의 페이지가 _site 에 없습니다 — ${loc}\n` +
          "     → 새 섹션을 만들었다면 tools/stage-site.mjs 의 PUBLIC_DIRS 에 폴더를 추가하세요.",
      );
    }
  }
}

// ③ _site 안 HTML 이 부르는 로컬 자산이 모두 있는가
const htmlFiles = [];
(function collectHtml(dir, prefix) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) collectHtml(path.join(dir, e.name), rel);
    else if (e.name.endsWith(".html")) htmlFiles.push(rel);
  }
})(OUT, "");

const missingAssets = new Set();
for (const page of htmlFiles) {
  const html = fs.readFileSync(path.join(OUT, page), "utf8");
  for (const m of html.matchAll(/<(?:link|script|img|source)\b[^>]*\b(?:href|src)="([^"]+)"/g)) {
    const value = m[1].trim();
    if (!value) continue;
    if (/^(https?:)?\/\//i.test(value) || /^(mailto:|tel:|data:|#)/i.test(value)) continue;
    const clean = value.split("?")[0].split("#")[0];
    const rel = clean.startsWith("/")
      ? clean.slice(1)
      : path.posix.normalize(path.posix.join(path.posix.dirname(page), clean));
    if (!rel || !inSite(rel)) missingAssets.add(`${value} (${page})`);
  }
}
for (const a of missingAssets) fail(`_site 안에서 자산을 찾을 수 없습니다 — ${a}`);

// ④ 개발·운영 경로가 섞이지 않았는가
for (const bad of NEVER_PUBLIC) {
  if (fs.existsSync(path.join(OUT, bad))) {
    fail(`_site 에 공개하면 안 되는 경로가 들어 있습니다 — ${bad}`);
  }
}

/* ------------------------------------------------------------------ */
/* 3. 리포트                                                           */
/* ------------------------------------------------------------------ */

console.log("📦 배포용 사이트 폴더(_site) 구성");
console.log(`   · 파일 ${fileCount}개 · ${(byteCount / 1024 / 1024).toFixed(1)}MB`);
console.log(`   · 공개 파일 ${PUBLIC_FILES.length}개 · 공개 폴더 ${PUBLIC_DIRS.join(", ")}`);
console.log(`   · 제외: ${NEVER_PUBLIC.join(", ")}`);
if (splitFiles.length) console.log(`   · 인라인 블록 분리: ${splitFiles.join(" · ")}`);
console.log(
  `   · HTML 최소화: ${stagedHtml.length}개 ${(rawHtml / 1024).toFixed(1)}KB → ` +
    `${(slimHtml / 1024).toFixed(1)}KB (${((slimHtml - rawHtml) / 1024).toFixed(1)}KB, ` +
    `${(((slimHtml - rawHtml) / rawHtml) * 100).toFixed(1)}%)` +
    (splitOut ? ` — 별도 파일 ${(splitOut / 1024).toFixed(1)}KB(재방문 시 캐시)` : ""),
);

if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 배포할 파일만 담겼고, 빠진 자산도 없습니다");
