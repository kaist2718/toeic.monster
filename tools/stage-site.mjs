#!/usr/bin/env node
/**
 * 배포용 사이트 폴더(_site) 구성 — 공개할 파일만 골라 담습니다.
 *
 * 왜 필요한가:
 *   이 저장소는 사이트 파일과 운영 도구가 한 루트에 섞여 있습니다. main 브랜치를
 *   그대로 배포하면 tools/·promo/·docs/·package.json 까지 인터넷에 공개됩니다
 *   (docs/monetization-plan.md 같은 내부 문서 포함). 그래서 배포 전에
 *   **공개 목록에 있는 파일만** _site 로 복사하고, 빠진 것이 없는지 검증합니다.
 *
 * 무엇을 하는가:
 *   0) 담으면서 배포본을 다듬습니다 — 큰 인라인 <style> 을 assets/*.css 로 빼고,
 *      주석과 태그 사이 공백을 걷어냅니다. 저장소의 원본은 그대로 두고 _site 에만
 *      적용하므로, 이 파일이 index.html 의 유일한 원본이라는 규칙이 유지됩니다
 *      (도구들이 index.html 안의 인라인 JS·CSS 를 읽습니다).
 *      실측: index.html 719KB → 624KB, 정적 페이지 36개 −7.7%
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

/** 큰 인라인 <style> 을 assets/*.css 로 빼고 <link> 로 바꿉니다. 반환: {html, files}(파일은 상대 경로). */
function splitInlineCss(html, page) {
  const dir = path.posix.dirname(page);
  const files = new Map();
  let n = 0;
  const out = html.replace(/<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi, (whole, attrs, body) => {
    if (Buffer.byteLength(body, "utf8") < 2048) return whole;
    n += 1;
    const base = page === "index.html" ? "app" : "p-" + page.replace(/\.html$/, "").replace(/\//g, "-");
    const name = path.posix.join("assets", n === 1 ? `${base}.css` : `${base}-${n}.css`);
    const media = (/\bmedia="([^"]*)"/i.exec(attrs) || [])[1];
    files.set(name, body.replace(/^\s+|\s+$/g, ""));
    const href = path.posix.relative(dir, name);
    return `<link rel="stylesheet" href="${href}"${media ? ` media="${media}"` : ""}>`;
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
let cssOut = 0;
const cssFiles = [];

for (const page of stagedHtml) {
  const full = path.join(OUT, page);
  const original = fs.readFileSync(full, "utf8");
  const split = splitInlineCss(original, page);
  for (const [name, body] of split.files) {
    fs.mkdirSync(path.dirname(path.join(OUT, name)), { recursive: true });
    fs.writeFileSync(path.join(OUT, name), body + "\n", "utf8");
    cssFiles.push(`${name} (${(Buffer.byteLength(body, "utf8") / 1024).toFixed(1)}KB, ${page})`);
    cssOut += Buffer.byteLength(body, "utf8") + 1;
    fileCount++;
    byteCount += Buffer.byteLength(body, "utf8") + 1;
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
if (cssFiles.length) console.log(`   · 인라인 CSS 분리: ${cssFiles.join(", ")}`);
console.log(
  `   · HTML 최소화: ${stagedHtml.length}개 ${(rawHtml / 1024).toFixed(1)}KB → ` +
    `${(slimHtml / 1024).toFixed(1)}KB (${((slimHtml - rawHtml) / 1024).toFixed(1)}KB, ` +
    `${(((slimHtml - rawHtml) / rawHtml) * 100).toFixed(1)}%)` +
    (cssOut ? ` + 분리한 CSS ${(cssOut / 1024).toFixed(1)}KB` : ""),
);

if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 배포할 파일만 담겼고, 빠진 자산도 없습니다");
