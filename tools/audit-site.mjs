#!/usr/bin/env node
/**
 * toeic.monster 사이트 감사 도구 (링크 · 메타 · 사이트맵 · 문서 수치)
 *
 * 기존 감사가 "콘텐츠 내용"을 본다면, 이 도구는 "사이트 구조"를 봅니다.
 *   1) 내부 링크·앵커 무결성 (index.html · units/*.html · guides/*.html · grammar/*.html)
 *   2) HTML 중복 id
 *   3) 정적 자산(src·link) 파일 존재 여부
 *   4) 메타 태그(description·canonical·OG·twitter)와 구조화 데이터(JSON-LD) 형식
 *   5) sitemap.xml 과 실제 페이지의 일치 (noindex 페이지가 사이트맵에 들어가지 않았는지)
 *   6) docs/*.md 의 `audit:counts` 블록 수치와 실제 값의 일치
 *   6-1) index.html 에 박혀 있는 고정 표시값(배지 요약·숙어 수)과 실제 데이터의 일치
 *   (문법·회화의 낱개 과 페이지도 다른 정적 페이지와 같은 기준으로 검사합니다 — 링크·앵커·사이트맵 일치.)
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

/** 단계별 문법 교재 데이터 파일 — build-pages.mjs 와 같은 목록을 씁니다. */
const GRAMMAR_FILES = ["data/grammar-basic.js", "data/grammar-intermediate.js", "data/grammar-advanced.js"];

/** 단계별 회화 교재 — build-pages.mjs 와 같은 목록을 씁니다. */
const CONVERSATION_FILES = [
  "data/conversation-basic.js",
  "data/conversation-intermediate.js",
  "data/conversation-advanced.js",
];

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
  for (const f of ["data/idioms.js", "data/extra.js", ...GRAMMAR_FILES, ...CONVERSATION_FILES]) {
    vm.runInContext(read(f), sandbox, { filename: f, timeout: 5000 });
  }
  return {
    vocab: sandbox.window.VOCAB_UNITS || {},
    idioms: sandbox.window.VOCAB_IDIOMS || [],
    extra: sandbox.window.TOEIC_EXTRA || {},
    grammar: sandbox.window.GRAMMAR_BOOKS || [],
    conversation: sandbox.window.CONVERSATION_BOOKS || [],
  };
}

const { vocab, idioms, extra, grammar, conversation } = loadData();
const unitIds = Object.keys(vocab);
const totalWords = unitIds.reduce((sum, id) => sum + vocab[id].length, 0);

/* ------------------------------------------------------------------ */
/* 2. HTML 페이지 수집과 기본 점검                                      */
/* ------------------------------------------------------------------ */

const pages = [];
for (const f of fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))) pages.push(f);
for (const dir of ["units", "guides", "grammar", "conversation"]) {
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
/* 3-2b. 정적 페이지 공용 자산(assets/)                                  */
/* ------------------------------------------------------------------ */

// 정적 페이지 124개는 같은 스타일을 씁니다. 페이지마다 인라인으로 되돌리면 1.2MB 가 다시
// 중복되고, 예문 듣기 버튼이 있는데 공용 스크립트를 빠뜨리면 버튼이 아무 반응 없이 남습니다.
const SHARED_CSS = "assets/site.css";
const SHARED_SPEAK = "assets/speak.js";
const INLINE_STYLE_MAX = 2048; // 정적 페이지에 남아 있어도 되는 인라인 스타일의 최대 크기
const isGeneratedPage = (p) => p === "404.html" || /^(?:units|guides|grammar)\//.test(p);

if (!has(SHARED_CSS)) {
  fail(`${SHARED_CSS} 이 없습니다 — \`node tools/build-pages.mjs\` 를 실행하세요.`);
} else {
  note(`공용 스타일 ${SHARED_CSS} — ${(fs.statSync(path.join(ROOT, SHARED_CSS)).size / 1024).toFixed(1)}KB`);
}

for (const page of pages.filter(isGeneratedPage)) {
  const biggest = [...srcOf[page].matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].reduce(
    (n, m) => Math.max(n, m[1].length),
    0,
  );
  if (biggest > INLINE_STYLE_MAX) {
    fail(
      `${page}: 인라인 <style> 이 ${(biggest / 1024).toFixed(1)}KB 입니다` +
        ` — 공용 스타일(${SHARED_CSS})을 <link> 하세요(같은 내용을 페이지 수만큼 다시 받게 됩니다).`,
    );
  }
  const speakButtons = (markOf[page].match(/class="gex-speak"/g) || []).length;
  const loadsSpeak = new RegExp(`<script[^>]*src="[^"]*${SHARED_SPEAK.split("/").pop()}"`).test(srcOf[page]);
  if (speakButtons && !loadsSpeak) {
    fail(`${page}: 예문 듣기 버튼 ${speakButtons}개가 있는데 ${SHARED_SPEAK} 를 불러오지 않습니다(버튼이 동작하지 않습니다).`);
  }
  if (!speakButtons && loadsSpeak) {
    fail(`${page}: 예문 듣기 버튼이 없는데 ${SHARED_SPEAK} 를 불러옵니다(쓸데없는 요청).`);
  }
}

/* ------------------------------------------------------------------ */
/* 3-3. manifest 아이콘 · apple-touch-icon                              */
/* ------------------------------------------------------------------ */

// 설치형 앱(PWA)과 iOS 홈 화면은 SVG 아이콘을 쓰지 않습니다.
// PNG 가 있는지, 실제 파일이 있는지, apple-touch-icon 이 SVG 로 되돌아가지 않았는지 봅니다.
if (has("manifest.webmanifest")) {
  let manifest = null;
  try {
    manifest = JSON.parse(read("manifest.webmanifest"));
  } catch (e) {
    fail(`manifest.webmanifest: JSON 을 읽을 수 없습니다 — ${e.message}`);
  }
  if (manifest) {
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    if (!icons.length) fail("manifest.webmanifest: icons 가 없습니다.");
    const sizes = new Set();
    for (const icon of icons) {
      if (!icon || !icon.src) {
        fail("manifest.webmanifest: src 가 없는 아이콘이 있습니다.");
        continue;
      }
      if (!has(icon.src)) fail(`manifest.webmanifest: 아이콘 파일이 없습니다 — ${icon.src}`);
      if (icon.sizes) sizes.add(icon.sizes);
    }
    if (!icons.some((i) => i && i.src && /\.png$/i.test(i.src))) {
      fail("manifest.webmanifest: PNG 아이콘이 없습니다 — iOS·설치형 앱은 SVG 만으로는 아이콘을 못 씁니다.");
    }
    if (icons.length) note(`manifest 아이콘 ${icons.length}개 (${[...sizes].join(", ")})`);
  }
}

for (const page of pages) {
  const m = srcOf[page].match(/<link[^>]*rel="apple-touch-icon"[^>]*href="([^"]*)"/i);
  if (m && /\.svg(\?|$)/i.test(m[1])) {
    fail(`${page}: apple-touch-icon 이 SVG 입니다 — iOS 가 무시합니다 (${m[1]})`);
  }
}

/* ------------------------------------------------------------------ */
/* 3-3a. 소셜 공유 카드(og:image)                                       */
/* ------------------------------------------------------------------ */

// 공유 카드는 카톡·슬랙·X 가 그대로 받아 가는 이미지입니다.
// 캡처 직후의 PNG 는 압축이 느슨해 몇 배로 커지므로, 존재 여부와 용량을 함께 봅니다
// (`python tools/make-og-image.py` 로 무손실 재압축).
const OG_MAX_BYTES = 160 * 1024;
const ogFiles = new Map(); // 파일 경로 -> 이 이미지를 쓰는 페이지들

const metaContent = (src, attr) => {
  const a = attr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m =
    src.match(new RegExp(`<meta[^>]*\\s${a}[^>]*\\scontent="([^"]+)"`, "i")) ||
    src.match(new RegExp(`<meta[^>]*\\scontent="([^"]+)"[^>]*\\s${a}`, "i"));
  return m ? m[1] : null;
};

for (const page of pages) {
  const url = metaContent(srcOf[page], 'property="og:image"');
  if (!url) continue;
  if (!url.startsWith(SITE)) {
    fail(`${page}: og:image 가 사이트 주소가 아닙니다 — ${url}`);
    continue;
  }
  const rel = url.slice(SITE.length).replace(/^\//, "");
  if (!ogFiles.has(rel)) ogFiles.set(rel, []);
  ogFiles.get(rel).push(page);
}

for (const [rel, users] of ogFiles) {
  if (!has(rel)) {
    fail(`${rel}: og:image 파일이 없습니다 — ${users.join(", ")}`);
    continue;
  }
  const bytes = fs.statSync(path.join(ROOT, rel)).size;
  const kb = (bytes / 1024).toFixed(0) + "KB";
  if (bytes > OG_MAX_BYTES) {
    fail(
      `${rel}: 공유 카드가 너무 큽니다 — ${kb} (권장 ${OG_MAX_BYTES / 1024}KB 이하)` +
        "\n     → `python tools/make-og-image.py` 로 무손실 재압축하세요.",
    );
  } else {
    note(`공유 카드 ${rel} — ${kb} · ${users.length}개 페이지가 사용`);
  }

  // PNG 라면 헤더에서 실제 크기를 읽어, 선언한 og:image:width/height 와 맞는지 봅니다.
  const head = fs.readFileSync(path.join(ROOT, rel)).subarray(0, 24);
  const isPng = head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (isPng) {
    const width = head.readUInt32BE(16);
    const height = head.readUInt32BE(20);
    const declaredW = Number(metaContent(srcOf[users[0]], 'property="og:image:width"') || 0);
    const declaredH = Number(metaContent(srcOf[users[0]], 'property="og:image:height"') || 0);
    if (declaredW && declaredW !== width) fail(`${rel}: og:image:width(${declaredW}) 와 실제 이미지 너비(${width})가 다릅니다.`);
    if (declaredH && declaredH !== height) fail(`${rel}: og:image:height(${declaredH}) 와 실제 이미지 높이(${height})가 다릅니다.`);
  }
}

/* ------------------------------------------------------------------ */
/* 3-3b. 404 페이지                                                     */
/* ------------------------------------------------------------------ */

if (!has("404.html")) {
  fail("404.html 이 없습니다 — 깨진 주소가 GitHub Pages 기본 404 로 떨어집니다.");
} else {
  const notFound = read("404.html");
  if (!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(notFound)) {
    fail("404.html: robots=noindex 가 없습니다 — 검색엔진이 404 페이지를 색인할 수 있습니다.");
  }
  // 이 파일은 루트(/)뿐 아니라 임의의 주소에서도 응답됩니다.
  // 상대 경로는 요청 주소를 기준으로 풀리므로 엉뚱한 곳을 가리키게 됩니다.
  const relativeLinks = [...notFound.matchAll(/<(?:a|link)\b[^>]*\bhref="(\.\.?\/[^"]*)"/g)].map((m) => m[1]);
  if (relativeLinks.length) {
    fail(
      `404.html: 상대 경로 링크가 있습니다 — ${[...new Set(relativeLinks)].slice(0, 3).join(", ")}` +
        " (404 는 임의의 주소에서도 보이므로 루트 절대 경로를 쓰세요)",
    );
  }
  note("404.html 있음 (noindex · 루트 절대 경로)");
}

/* ------------------------------------------------------------------ */
/* 3-4. 홈 섹션 이동 메뉴(칩) ↔ 섹션 1:1 일치                           */
/* ------------------------------------------------------------------ */

// 칩은 aria-label 로 섹션을 찾습니다. 라벨이 바뀌면 이동이 조용히 실패하므로,
// "가리키는 섹션이 없는 칩"과 "메뉴에서 닿을 수 없는 섹션"을 함께 잡습니다.
if (srcOf["index.html"]) {
  const homeSrc = srcOf["index.html"];
  const navStart = homeSrc.indexOf('class="section-nav');
  if (navStart === -1) {
    fail("index.html: 섹션 이동 메뉴(.section-nav)를 찾지 못했습니다.");
  } else {
    const nav = homeSrc.slice(navStart, homeSrc.indexOf("</nav>", navStart));
    const chipTargets = [...nav.matchAll(/class="sn-chip" data-target="([^"]+)"/g)].map((m) => m[1]);
    const homeLabels = [...homeSrc.matchAll(/<section\b[^>]*class="home-section"[^>]*aria-label="([^"]+)"/g)].map(
      (m) => m[1],
    );
    const labelSet = new Set(homeLabels);
    const chipSet = new Set(chipTargets);

    const dupChips = [...new Set(chipTargets.filter((x, i) => chipTargets.indexOf(x) !== i))];
    if (dupChips.length) fail(`index.html: 섹션 메뉴 칩이 중복입니다 — ${dupChips.join(", ")}`);

    const orphanChips = chipTargets.filter((t) => !labelSet.has(t));
    if (orphanChips.length) fail(`index.html: 이동 대상 섹션이 없는 칩 — ${orphanChips.join(", ")}`);

    const unreachable = homeLabels.filter((l) => !chipSet.has(l));
    if (unreachable.length) fail(`index.html: 메뉴에서 이동할 수 없는 섹션 — ${unreachable.join(", ")}`);

    note(`홈 섹션 ${homeLabels.length}개 · 섹션 메뉴 칩 ${chipTargets.length}개(모두 연결됨)`);

    // 3-5. 묶음(🗂 전체 목차) 구성
    //   · 한 묶음에 몰리지 않았는지(칩 개수)
    //   · 묶음 안에서 문서 순서대로 가는지 — 아니면 칩을 따라가며 페이지를 위로 되감아야 합니다.
    const homeIndex = new Map(homeLabels.map((label, i) => [label, i]));
    const groupChunks = nav.split('class="sn-group"').slice(1);
    if (groupChunks.length < 2) fail("index.html: 섹션 메뉴 묶음(sn-group)이 2개 미만입니다.");
    const groupSizes = [];
    groupChunks.forEach((chunk, gi) => {
      const label = (chunk.match(/class="sn-group-label">([^<]*)</) || [])[1] || `${gi + 1}번째 묶음`;
      const targets = [...chunk.matchAll(/class="sn-chip" data-target="([^"]+)"/g)].map((m) => m[1]);
      groupSizes.push(`${label} ${targets.length}`);
      if (!targets.length) fail(`index.html: "${label}" 묶음에 칩이 없습니다.`);
      for (let i = 1; i < targets.length; i++) {
        const prev = homeIndex.get(targets[i - 1]);
        const cur = homeIndex.get(targets[i]);
        if (prev === undefined || cur === undefined) continue; // 연결 오류는 위에서 이미 잡힘
        if (prev >= cur) {
          fail(`index.html: "${label}" 묶음의 칩 순서가 문서 순서와 다릅니다 — ${targets[i - 1]} → ${targets[i]}`);
        }
      }
    });
    note(`섹션 메뉴 묶음: ${groupSizes.join(" · ")}`);
  }
}

/* ------------------------------------------------------------------ */
/* 3-6. 홈 프리렌더 · <noscript> 폴백                                   */
/* ------------------------------------------------------------------ */

// 홈 콘텐츠의 상당 부분은 JS 로 그려집니다. 그래서
//   ① 자바스크립트를 실행하지 않는 크롤러(네이버 Yeti)와
//   ② 자바스크립트를 끈 사용자는 홈에서 아무 내용도 읽을 수 없습니다.
// tools/prerender-home.mjs 가 읽을 수 있는 섹션을 미리 심고 안내를 넣습니다.
// 여기서는 "그 자리가 계속 채워져 있는지"를 봅니다(내용 자체의 최신 여부는 `npm run verify` 가 봅니다).
if (srcOf["index.html"]) {
  const homeSrc = srcOf["index.html"];
  // 표시(마커)는 index.html 에서 직접 읽습니다 — 프리렌더 대상이 늘어도 감사는 그대로입니다.
  const markerIds = [...homeSrc.matchAll(/<!-- prerender:start ([a-zA-Z0-9_-]+) -->/g)].map((m) => m[1]);
  // 다만 이 핵심 섹션들은 하나라도 사라지면 크롤러가 홈에서 읽을 게 거의 없어집니다.
  const REQUIRED_MARKERS = ["noscript", "confuseGrid", "wordpartGrid", "wordfamilyGrid", "freqGrid", "idiomGrid"];
  const missingMarkers = REQUIRED_MARKERS.filter(
    (id) => !homeSrc.includes(`<!-- prerender:start ${id} -->`) || !homeSrc.includes(`<!-- prerender:end ${id} -->`),
  );
  const orphanEnds = (homeSrc.match(/<!-- prerender:end /g) || []).length - markerIds.length;
  if (orphanEnds !== 0) {
    fail(`index.html: prerender:start/end 짝이 맞지 않습니다(${orphanEnds}개 차이).`);
  }
  const short = [];
  for (const id of markerIds) {
    if (id === "noscript") continue;
    const start = homeSrc.indexOf(`<!-- prerender:start ${id} -->`);
    const end = homeSrc.indexOf(`<!-- prerender:end ${id} -->`, start + 1);
    if (start < 0 || end < 0) continue;
    if (end - start < 200) short.push(`${id}(${end - start}자)`);
  }
  if (short.length) fail(`index.html: 프리렌더된 내용이 너무 적습니다 — ${short.join(", ")}`);
  if (missingMarkers.length) {
    fail(
      `index.html: 홈 프리렌더 표시가 없습니다 — ${missingMarkers.join(", ")}\n` +
        "     → `node tools/prerender-home.mjs` 를 실행하세요(자바스크립트 없는 크롤러가 홈 내용을 읽지 못합니다).",
    );
  }

  const ns = homeSrc.slice(homeSrc.indexOf("<noscript>"), homeSrc.indexOf("</noscript>"));
  if (!ns) {
    fail("index.html: <noscript> 폴백이 없습니다 — 자바스크립트를 끈 사용자에게 홈이 빈 화면으로 보입니다.");
  } else {
    if (!/<h2[^>]*>[^<]*주제/.test(ns)) fail("index.html: <noscript> 안에 학습 주제 목차가 없습니다.");
    const nsLinks = [...ns.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((m) => m[1]);
    if (nsLinks.length < 3) fail(`index.html: <noscript> 안의 정적 자료 링크가 ${nsLinks.length}개뿐입니다.`);

    // 크롤러(그리고 자바스크립트를 끈 사용자)가 실제로 읽을 수 있는 글자 수.
    // 홈은 JS 로 그리는 부분이 많아 이 수치가 곧 검색 노출의 바닥입니다.
    const homeOnly = homeSrc.slice(homeSrc.indexOf('<div id="homeView">'));
    const withoutCode = homeOnly.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
    const readable = withoutCode.replace(/\s+/g, " ").trim().length;
    note(
      `홈 프리렌더 섹션 ${markerIds.length - 1}개 · <noscript> 링크 ${nsLinks.length}개 · ` +
        `JS 없이 읽히는 글자 ${readable.toLocaleString("en-US")}자`,
    );
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
  grammar_books: grammar.length,
  grammar_chapters: grammar.reduce((n, b) => n + (b.chapters || []).length, 0),
  grammar_quizzes: grammar.reduce(
    (n, b) => n + (b.chapters || []).reduce((m, c) => m + (c.practice || []).length, 0),
    0,
  ),
  conversation_books: conversation.length,
  conversation_chapters: conversation.reduce((n, b) => n + (b.chapters || []).length, 0),
  conversation_quizzes: conversation.reduce(
    (n, b) => n + (b.chapters || []).reduce((m, c) => m + (c.practice || []).length, 0),
    0,
  ),
  paraphrase: countOf("paraphrase"),
  frequency: countOf("frequency"),
  part1: countOf("part1"),
  part6: countOf("part6"),
  part7: countOf("part7"),
  speaking_questions: questionCount("Speaking"),
  writing_questions: questionCount("Writing"),
  sitemap_urls: locs.length,
  pages: pages.length,
  // 낱개 과 페이지(문법·회화) — 책 한 권 안의 과를 따로 여는 주소 수.
  chapter_pages:
    grammar.reduce((n, b) => n + (b.chapters || []).length, 0) +
    conversation.reduce((n, b) => n + (b.chapters || []).length, 0),
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
/* 6-1. index.html 에 박힌 고정 표시값 ↔ 실제 데이터                     */
/* ------------------------------------------------------------------ */

/* 이 숫자들은 화면 첫 렌더에 그대로 보이고, <noscript> 목차에도 실립니다.
   자바스크립트가 값을 다시 채우기 전이라도 틀린 숫자를 보여 주면 안 되므로
   여기서 실제 값과 대조합니다(예: 숙어를 추가했는데 홈에 “표현 0개”가 남는 일). */

const homeSource = read("index.html");

const badgeBlock = (homeSource.match(/var BADGES = \[([\s\S]*?)\n\s*\];/) || [])[1] || "";
const badgeCount = (badgeBlock.match(/\{ ico:/g) || []).length;
if (!badgeCount) {
  fail("index.html: BADGES 목록을 찾지 못했습니다(배지 요약 고정값 검증 불가).");
} else {
  const shown = (homeSource.match(/id="badgeSummary"[^>]*>([^<]*)</) || [])[1];
  const expected = `0 / ${badgeCount} 획득`;
  if (!shown) fail("index.html: 배지 요약(#badgeSummary)의 초기값을 찾지 못했습니다.");
  else if (shown.trim() !== expected) {
    fail(`index.html: 배지 요약의 초기값이 실제와 다릅니다 — "${shown.trim()}" (배지 ${badgeCount}개 → "${expected}")`);
  }
}

const idiomShown = (homeSource.match(/id="idiomCount">([\d,]+)</) || [])[1];
if (!idiomShown) {
  fail("index.html: 숙어 수 고정값(#idiomCount)을 찾지 못했습니다.");
} else if (Number(idiomShown.replace(/,/g, "")) !== idioms.length) {
  fail(`index.html: 숙어 수 고정값이 실제와 다릅니다 (표시 ${idiomShown} / 실제 ${idioms.length})`);
}

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
