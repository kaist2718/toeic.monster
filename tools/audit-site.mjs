#!/usr/bin/env node
/**
 * toeic.monster 사이트 감사 도구 (링크 · 메타 · 사이트맵 · 문서 수치)
 *
 * 기존 감사가 "콘텐츠 내용"을 본다면, 이 도구는 "사이트 구조"를 봅니다.
 *   1) 내부 링크·앵커 무결성 (index.html · units/*.html · guides/*.html)
 *   2) HTML 중복 id
 *   3) 정적 자산(src·link) 파일 존재 여부
 *   4) 메타 태그(description·canonical·OG·twitter)와 구조화 데이터(JSON-LD) 형식
 *   5) sitemap.xml 과 실제 페이지의 일치 (noindex 페이지가 사이트맵에 들어가지 않았는지)
 *   6) docs/*.md 의 `audit:counts` 블록 수치와 실제 값의 일치
 *
 * 실행:  node tools/audit-site.mjs
 *        node tools/audit-site.mjs --external   (외부 링크 HTTP 상태까지 확인 · 네트워크 필요)
 * 종료 코드: 문제가 있으면 1, 없으면 0 (CI·커밋 전 점검용)
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://toeic.monster";
const CHECK_EXTERNAL = process.argv.includes("--external");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const has = (p) => fs.existsSync(path.join(ROOT, p));

const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);
const note = (msg) => notes.push(msg);

/* ------------------------------------------------------------------ */
/* 1. 실제 값 계산용 데이터 로드                                        */
/* ------------------------------------------------------------------ */

function loadData() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (let i = 1; i <= 30; i++) {
    const f = `data/unit${String(i).padStart(2, "0")}.js`;
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  for (const f of ["data/idioms.js", "data/extra.js"]) {
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  return {
    vocab: sandbox.window.VOCAB_UNITS || {},
    idioms: sandbox.window.VOCAB_IDIOMS || [],
    extra: sandbox.window.TOEIC_EXTRA || {},
  };
}

const { vocab, idioms, extra } = loadData();
const unitIds = Object.keys(vocab);
const totalWords = unitIds.reduce((sum, id) => sum + vocab[id].length, 0);

/* ------------------------------------------------------------------ */
/* 2. HTML 페이지 수집과 기본 점검                                      */
/* ------------------------------------------------------------------ */

const pages = [];
for (const f of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) pages.push(f);
for (const dir of ["units", "guides"]) {
  for (const f of fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".html"))) {
    pages.push(`${dir}/${f}`);
  }
}
pages.sort();

const srcOf = {};   // 원본(JSON-LD 추출용)
const markOf = {};  // script·style 본문을 제거한 마크업(링크·자산 탐색용)
const idsOf = {};

/** script·style 본문을 지워 인라인 JS 문자열 속 href/src 를 오탐하지 않게 한다. */
function stripCodeBodies(src) {
  return src
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, "<script$1></script>")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

for (const page of pages) {
  const src = read(page);
  srcOf[page] = src;
  const markup = stripCodeBodies(src);
  markOf[page] = markup;

  // 2-1. 중복 id
  const ids = [...markup.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
  if (dupes.length) fail(`${page}: 중복 id — ${dupes.join(", ")}`);
  idsOf[page] = new Set(ids);
}

/** 마크업에서 id 집합을 얻는다(캐시). */
function idsOfFile(file) {
  if (!idsOf[file]) {
    const src = has(file) ? read(file) : "";
    markOf[file] = markOf[file] || stripCodeBodies(src);
    idsOf[file] = new Set([...markOf[file].matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  }
  return idsOf[file];
}

/* ------------------------------------------------------------------ */
/* 3. 링크 · 자산 무결성                                                */
/* ------------------------------------------------------------------ */

const external = new Map(); // url -> Set(pages)

/** href/src 를 실제 파일 경로로 바꾼다. 외부·특수 URL 이면 null. */
function resolveLocal(fromPage, value) {
  if (!value) return null;
  const v = value.trim();
  if (/^(https?:)?\/\//i.test(v)) return { external: v };
  if (/^(mailto:|tel:|javascript:|data:|#)/i.test(v)) {
    return v.startsWith("#") ? { sameFile: true, raw: v } : null;
  }
  const [rawWithQuery, frag = ""] = v.split("#");
  const rawPath = rawWithQuery.split("?")[0];
  let file;
  if (!rawPath) file = fromPage;
  else if (rawPath.startsWith("/")) {
    file = rawPath.slice(1);
  } else {
    file = path.posix.normalize(path.posix.join(path.posix.dirname(fromPage), rawPath));
  }
  if (file === "" || file.endsWith("/")) file += "index.html";
  return { file, frag, raw: v };
}

for (const page of pages) {
  const src = markOf[page];

  // 3-1. a[href]
  for (const m of src.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
    const href = m[1];
    const target = resolveLocal(page, href);
    if (!target) continue;
    if (target.external) {
      const clean = target.external.replace(/\/$/, "");
      if (!external.has(clean)) external.set(clean, new Set());
      external.get(clean).add(page);
      continue;
    }
    const file = target.sameFile ? page : target.file;
    const frag = target.sameFile ? target.raw.slice(1) : target.frag;
    if (target.sameFile && !frag) continue; // href="#" 는 허용
    if (!has(file)) {
      fail(`${page}: 링크 대상 파일이 없습니다 — "${href}"`);
      continue;
    }
    if (frag && file.endsWith(".html")) {
      if (!idsOfFile(file).has(frag)) {
        fail(`${page}: 링크 앵커를 찾을 수 없습니다 — "${href}"`);
      }
    }
  }

  // 3-2. 정적 자산 (script/img/source src, link href)
  for (const m of src.matchAll(/<(?:script|img|source)\b[^>]*\bsrc="([^"]*)"/g)) {
    const target = resolveLocal(page, m[1]);
    if (!target || target.external || target.sameFile) continue;
    if (!has(target.file)) fail(`${page}: 자산 파일이 없습니다 — "${m[1]}"`);
  }
  for (const m of src.matchAll(/<link\b[^>]*\bhref="([^"]*)"/g)) {
    const target = resolveLocal(page, m[1]);
    if (!target || target.external || target.sameFile) continue;
    if (!has(target.file)) fail(`${page}: 연결 파일이 없습니다 — "${m[1]}"`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. 메타 태그 · 구조화 데이터                                         */
/* ------------------------------------------------------------------ */

/** <meta name="..."|property="..."> 의 content 를 속성 순서와 무관하게 찾는다. */
function metaTag(src, attr) {
  const a = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m1 = src.match(new RegExp(`<meta[^>]*\\s${a}[^>]*\\scontent="([^"]*)"`, "i"));
  if (m1) return m1[1];
  const m2 = src.match(new RegExp(`<meta[^>]*\\scontent="([^"]*)"[^>]*\\s${a}`, "i"));
  return m2 ? m2[1] : null;
}

const indexPathable = [];
for (const page of pages) {
  const src = srcOf[page];
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(src);
  const title = (src.match(/<title>([\s\S]*?)<\/title>/i) || [])[1];
  if (!title || !title.trim()) fail(`${page}: <title> 이 없습니다.`);
  else if (title.length > 80) note(`${page}: <title> 이 깁니다(${title.length}자) — 검색 결과에서 잘릴 수 있습니다.`);

  if (noindex) {
    note(`${page}: robots=noindex 페이지(사이트맵 제외 대상)`);
    continue;
  }
  indexPathable.push(page);

  const desc = metaTag(src, 'name="description"');
  if (!desc) fail(`${page}: meta description 이 없습니다.`);
  else if (desc.length < 40 || desc.length > 170) {
    fail(`${page}: meta description 길이가 부적절합니다(${desc.length}자, 권장 40~170).`);
  }

  const canonical = (src.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i) || [])[1];
  if (!canonical) fail(`${page}: canonical 링크가 없습니다.`);
  else if (!canonical.startsWith(SITE)) fail(`${page}: canonical 이 사이트 주소가 아닙니다 — ${canonical}`);

  const ogUrl = metaTag(src, 'property="og:url"');
  if (ogUrl && canonical && ogUrl !== canonical) {
    fail(`${page}: og:url 과 canonical 이 다릅니다 — ${ogUrl} / ${canonical}`);
  }
  for (const prop of ["og:type", "og:title", "og:description", "og:image", "og:url"]) {
    if (!metaTag(src, `property="${prop}"`)) fail(`${page}: ${prop} 메타 태그가 없습니다.`);
  }
  if (!metaTag(src, 'name="twitter:card"')) fail(`${page}: twitter:card 메타 태그가 없습니다.`);

  // 4-1. JSON-LD (@graph 로 묶인 경우도 각 항목을 검사)
  const blocks = [...src.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!blocks.length) note(`${page}: 구조화 데이터(JSON-LD)가 없습니다.`);
  blocks.forEach((b, i) => {
    let data;
    try {
      data = JSON.parse(b[1]);
    } catch (e) {
      fail(`${page}: JSON-LD ${i + 1}번째 블록이 올바른 JSON 이 아닙니다 — ${e.message}`);
      return;
    }
    const node = data && !Array.isArray(data) ? data : null;
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data && data["@graph"])
        ? data["@graph"]
        : [data];
    if (node && !node["@context"]) fail(`${page}: JSON-LD 에 @context 가 없습니다.`);
    items.forEach((item) => {
      if (!item || typeof item !== "object") return fail(`${page}: JSON-LD ${i + 1}번째 항목이 객체가 아닙니다.`);
      if (!item["@type"]) fail(`${page}: JSON-LD 항목에 @type 이 없습니다.`);
      if (item === node && !item["@context"]) fail(`${page}: JSON-LD 에 @context 가 없습니다.`);
    });
  });
}

/* ------------------------------------------------------------------ */
/* 5. sitemap.xml 일치 점검                                             */
/* ------------------------------------------------------------------ */

const sitemapPath = "sitemap.xml";
const sitemapSrc = read(sitemapPath);
const locs = [...sitemapSrc.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

if (!locs.length) fail("sitemap.xml 에 <loc> 항목이 없습니다.");

const locFiles = new Set();
for (const loc of locs) {
  if (!loc.startsWith(SITE)) {
    fail(`sitemap.xml: 다른 사이트 주소가 들어 있습니다 — ${loc}`);
    continue;
  }
  let rel = loc.slice(SITE.length).replace(/^\//, "");
  if (rel === "" || rel.endsWith("/")) rel += "index.html";
  if (!has(rel)) fail(`sitemap.xml: 실제 파일이 없는 URL 입니다 — ${loc}`);
  else if (locFiles.has(rel)) fail(`sitemap.xml: 중복 URL 입니다 — ${loc}`);
  locFiles.add(rel);
}

for (const page of indexPathable) {
  if (!locFiles.has(page)) fail(`sitemap.xml 에 색인 대상 페이지가 빠졌습니다 — ${page}`);
}
for (const page of pages) {
  if (locFiles.has(page) && !indexPathable.includes(page)) {
    fail(`sitemap.xml 에 noindex 페이지가 포함되어 있습니다 — ${page}`);
  }
}

/* ------------------------------------------------------------------ */
/* 6. docs/*.md 의 audit:counts 블록 검증                               */
/* ------------------------------------------------------------------ */

const countOf = (key) => (extra[key] || []).length;
const questionCount = (test) =>
  (extra.swFormat || [])
    .filter((row) => row.test === test)
    .reduce((sum, row) => {
      const m = String(row.q).match(/^(\d+)\s*-\s*(\d+)$/);
      return sum + (m ? Number(m[2]) - Number(m[1]) + 1 : 1);
    }, 0);

const ACTUAL = {
  units: unitIds.length,
  vocab: totalWords,
  idioms: idioms.length,
  guides: (extra.guides || []).length,
  paraphrase: countOf("paraphrase"),
  frequency: countOf("frequency"),
  part1: countOf("part1"),
  part6: countOf("part6"),
  part7: countOf("part7"),
  speaking_questions: questionCount("Speaking"),
  writing_questions: questionCount("Writing"),
  sitemap_urls: locs.length,
  pages: pages.length,
};

const docsDir = path.join(ROOT, "docs");
let countBlocks = 0;
for (const file of fs.readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
  const src = fs.readFileSync(path.join(docsDir, file), "utf8");
  for (const block of src.match(/<!--\s*audit:counts[\s\S]*?-->/g) || []) {
    countBlocks++;
    for (const line of block.split("\n")) {
      const m = line.match(/^\s*([a-z_]+)\s*=\s*([\d,]+)\s*$/);
      if (!m) continue;
      const key = m[1];
      const declared = Number(m[2].replace(/,/g, ""));
      if (!(key in ACTUAL)) {
        fail(`docs/${file}: 알 수 없는 audit:counts 키입니다 — ${key}`);
        continue;
      }
      if (ACTUAL[key] !== declared) {
        fail(`docs/${file}: ${key} 수치가 실제와 다릅니다 (문서 ${declared} / 실제 ${ACTUAL[key]})`);
      }
    }
  }
}
if (!countBlocks) note("docs/*.md 에 audit:counts 블록이 없습니다(문서 수치 검증 생략).");

/* ------------------------------------------------------------------ */
/* 7. 외부 링크 (기본은 목록만, --external 이면 HTTP 확인)               */
/* ------------------------------------------------------------------ */

const externalUrls = [...external.keys()].sort();

if (CHECK_EXTERNAL && externalUrls.length) {
  const check = async (url) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      let res = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctrl.signal });
      if (res.status === 405 || res.status === 403) {
        res = await fetch(url, { method: "GET", redirect: "follow", signal: ctrl.signal });
      }
      if (!res.ok) fail(`외부 링크 응답 ${res.status}: ${url} (${[...external.get(url)].join(", ")})`);
      return res.status;
    } catch (e) {
      fail(`외부 링크 확인 실패: ${url} — ${e.message}`);
      return 0;
    } finally {
      clearTimeout(timer);
    }
  };
  const results = [];
  for (const url of externalUrls) results.push(await check(url));
  notes.push(`외부 링크 ${externalUrls.length}개 확인 완료(응답 ${results.filter(Boolean).length}개)`);
}

/* ------------------------------------------------------------------ */
/* 8. 리포트                                                            */
/* ------------------------------------------------------------------ */

console.log("🔗 toeic.monster 사이트 감사");
console.log(`   · HTML 페이지 ${pages.length}개 (색인 대상 ${indexPathable.length}개)`);
console.log(`   · sitemap.xml URL ${locs.length}개`);
console.log(`   · 외부 링크 ${externalUrls.length}개${CHECK_EXTERNAL ? " (HTTP 확인함)" : " (목록만 확인 · --external 로 검사)"}`);
console.log(`   · 문서 수치 블록 ${countBlocks}개 검증`);

if (notes.length) {
  console.log("\nℹ️  참고 (실패 아님)");
  notes.forEach((n) => console.log("   - " + n));
}
if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 링크·자산·메타·사이트맵·문서 수치 점검 모두 통과");
