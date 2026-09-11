#!/usr/bin/env node
/**
 * toeic.monster 정적 페이지 생성기 (프리렌더)
 *
 * 이 사이트는 어휘 목록을 브라우저에서 JS로 그리는 단일 페이지 앱이라
 * 검색엔진(특히 JS 실행 능력이 제한적인 네이버 Yeti)이 단어 내용을 읽지 못합니다.
 * 이 스크립트는 data/*.js 의 어휘 데이터를 읽어 "크롤러가 그대로 읽을 수 있는"
 * 정적 HTML 페이지를 만들고 sitemap.xml 을 갱신합니다.
 *
 * 실행:  node tools/build-pages.mjs
 * 산출물(커밋 대상):
 *   units/index.html        — 주제별 단어장 허브
 *   units/unit-01..30.html  — 유닛별 단어 목록 (1000단어 전체)
 *   units/idioms.html       — 빈출 구동사·숙어 60선
 *   sitemap.xml             — 위 페이지들을 포함한 전체 사이트맵
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용). 여러 번 실행해도 결과가 같습니다.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://toeic.monster";
const OUT_DIR = path.join(ROOT, "units");
const OG_IMAGE = SITE + "/og-image.png";

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), s, "utf8");
};

/* ------------------------------------------------------------------ */
/* 1. 데이터 읽기                                                      */
/* ------------------------------------------------------------------ */

/** index.html 안의 `var UNITS = [ ... ];` 배열을 그대로 평가해서 가져온다. */
function loadUnitMeta() {
  const html = read("index.html");
  const start = html.indexOf("var UNITS = [");
  if (start === -1) throw new Error("index.html 에서 UNITS 배열을 찾지 못했습니다.");
  const end = html.indexOf("];", start);
  if (end === -1) throw new Error("UNITS 배열의 끝을 찾지 못했습니다.");
  const src = html.slice(start, end + 2);
  const units = vm.runInNewContext(src + "\nUNITS;", {}, { timeout: 5000 });
  if (!Array.isArray(units) || !units.length) throw new Error("UNITS 배열이 비어 있습니다.");
  return units;
}

/** data/unitNN.js + data/idioms.js 를 브라우저와 같은 방식으로 실행해 데이터를 얻는다. */
function loadVocab() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (let i = 1; i <= 30; i++) {
    const file = `data/unit${String(i).padStart(2, "0")}.js`;
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  }
  vm.runInContext(read("data/idioms.js"), sandbox, { filename: "data/idioms.js", timeout: 5000 });
  const vocab = sandbox.window.VOCAB_UNITS || {};
  const idioms = sandbox.window.VOCAB_IDIOMS || [];
  if (!Object.keys(vocab).length) throw new Error("어휘 데이터를 읽지 못했습니다.");
  if (!idioms.length) throw new Error("숙어 데이터를 읽지 못했습니다.");
  return { vocab, idioms };
}

/** 데이터가 마지막으로 바뀐 날짜(git 기준). 재실행 시 결과가 같도록 고정값을 쓴다. */
function lastModified() {
  if (process.env.BUILD_DATE) return process.env.BUILD_DATE;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", "data", "index.html"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    /* git 이 없으면 오늘 날짜 사용 */
  }
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* 2. 공통 유틸                                                        */
/* ------------------------------------------------------------------ */

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** JSON-LD 를 <script> 안에 넣어도 안전하도록 이스케이프 */
function jsonLd(obj) {
  return JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");
}

const LEVEL_CLASS = { 초급: "lvl-easy", 중급: "lvl-mid", 고급: "lvl-hard" };
const LEVEL_ICON = { 초급: "🟢", 중급: "🟡", 고급: "🔴" };

const unitPath = (id) => `unit-${String(id).padStart(2, "0")}.html`;
const unitUrl = (id) => `${SITE}/units/${unitPath(id)}`;

/* ------------------------------------------------------------------ */
/* 3. 페이지 템플릿                                                    */
/* ------------------------------------------------------------------ */

const CSS = `
:root{--primary:#3b5bdb;--primary-dark:#2f4bb8;--bg:#f6f7fb;--card:#fff;--text:#212529;--muted:#5f6673;--border:#e5e7eb;--accent:#f59f00;--kpron-text:#8a5a00;--soft:#eef2ff;--cyan:#0b7285;--kpron-bg:#fff8e6}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Pretendard Variable",Pretendard,"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:var(--bg);color:var(--text);line-height:1.7}
a{color:var(--primary)}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}
header.bar{background:var(--primary);color:#fff}
header.bar .wrap{padding:14px 20px;display:flex;flex-wrap:wrap;align-items:baseline;gap:10px}
header.bar a{color:#fff;text-decoration:none;font-weight:800;font-size:20px;letter-spacing:-.5px}
header.bar small{opacity:.88;font-size:12.5px}
main{padding:0 0 30px}
.crumb{font-size:13px;color:var(--muted);margin:20px 0 12px}
.crumb a{text-decoration:none}
.crumb a:hover{text-decoration:underline}
h1{font-size:25px;line-height:1.4;letter-spacing:-.5px;color:var(--primary-dark)}
h2.sec{font-size:17px;margin:26px 0 12px;color:var(--text)}
.lead{font-size:14px;color:var(--muted);margin:8px 0 14px}
.cta{display:inline-block;background:var(--primary);color:#fff;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;padding:11px 18px;margin:2px 0 6px}
.cta:hover{background:var(--primary-dark)}
h1 .lvl{font-size:12px;font-weight:700;border-radius:99px;padding:3px 10px;vertical-align:3px;margin-left:6px}
.lvl-easy{background:#d3f9d8;color:#166534}
.lvl-mid{background:#fff3bf;color:#7a5c00}
.lvl-hard{background:#ffe3e3;color:#b02a2a}
ol.words{list-style:none;display:grid;gap:12px;margin-top:6px}
ol.words li{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:15px 17px}
.w-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin-bottom:5px}
.w-word{font-size:19px;font-weight:800;color:var(--primary-dark);letter-spacing:-.3px;word-break:break-word}
.w-ipa{font-size:13px;color:var(--muted)}
.w-kr{font-size:13.5px;font-weight:700;color:var(--kpron-text);background:var(--kpron-bg);border-radius:6px;padding:1px 7px}
.w-mean{font-size:15px;font-weight:700;margin-bottom:6px}
.w-ex{font-size:13.5px;font-style:italic;color:#495057}
.w-expron{font-size:12.5px;font-weight:600;color:var(--cyan)}
.w-exko{font-size:12.5px;color:var(--muted)}
.pager{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;margin-top:28px;font-size:14px;font-weight:700}
.pager a{text-decoration:none}
.pager a:hover{text-decoration:underline}
.pager .mid{font-weight:600;font-size:13px}
.unitlist{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-top:6px}
.unitlist a{display:block;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 15px;text-decoration:none;color:var(--text)}
.unitlist a:hover{border-color:var(--primary)}
.unitlist b{display:block;font-size:11.5px;color:var(--primary);letter-spacing:.3px;margin-bottom:3px}
.unitlist span{font-size:14.5px;font-weight:700}
.unitlist em{display:block;font-size:12px;color:var(--muted);font-style:normal;margin-top:3px}
footer.ft{border-top:1px solid var(--border);margin-top:34px;padding-top:16px;font-size:12.5px;color:var(--muted)}
footer.ft a{margin-right:12px;text-decoration:none}
footer.ft a:hover{text-decoration:underline}
footer.ft p{margin-top:8px}
`;

function page({ title, description, canonical, ld, body }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#3b5bdb">
<meta name="author" content="toeic.monster">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="toeic.monster">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="ko_KR">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" href="../icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../icon.svg">
<style>${CSS}</style>
<script type="application/ld+json">
${ld}
</script>
</head>
<body>
<header class="bar">
  <div class="wrap">
    <a href="../">toeic.monster</a>
    <small>발음·예문으로 외우는 TOEIC 필수 어휘 1,000</small>
  </div>
</header>
<main class="wrap">
${body}
</main>
<footer class="ft wrap">
  <nav>
    <a href="../">홈</a><a href="./">주제별 단어장</a><a href="idioms.html">빈출 구동사·숙어</a><a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>
  </nav>
  <p>👾 toeic.monster · TOEIC 어휘 무료 학습 사이트 · 학습 기록은 브라우저에만 저장됩니다</p>
</footer>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* 4. 유닛 페이지                                                      */
/* ------------------------------------------------------------------ */

function wordItem(w) {
  const [word, ipa, kpron, mean, ex, exKo, exPron] = w;
  return `      <li>
        <div class="w-row"><span class="w-word">${esc(word)}</span><span class="w-ipa">${esc(ipa)}</span><span class="w-kr">${esc(kpron)}</span></div>
        <p class="w-mean">${esc(mean)}</p>
        <p class="w-ex">${esc(ex)}</p>
        <p class="w-expron">${esc(exPron || "")}</p>
        <p class="w-exko">${esc(exKo)}</p>
      </li>`;
}

function buildUnitPage(u, words, prev, next) {
  const file = "units/" + unitPath(u.id);
  const canonical = unitUrl(u.id);
  const n = words.length;
  const title = `UNIT ${u.id} ${u.title} — TOEIC 필수 단어 ${n}개 | toeic.monster`;
  const description = `${u.sub}. TOEIC에 자주 나오는 "${u.title}" 주제 단어 ${n}개를 발음기호·한글 발음·예문·해석과 함께 정리했습니다. 무료로 암기 카드와 퀴즈로 복습하세요.`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `UNIT ${u.id} ${u.title} — TOEIC 필수 단어 ${n}개`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "단어 목록",
        educationalUse: "self-study",
        teaches: words.map((w) => w[0]),
        isPartOf: {
          "@type": "CollectionPage",
          name: "TOEIC 주제별 단어장 30개",
          url: `${SITE}/units/`,
        },
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "주제별 단어장", item: `${SITE}/units/` },
          { "@type": "ListItem", position: 3, name: `UNIT ${u.id} ${u.title}`, item: canonical },
        ],
      },
    ],
  });

  const pager = [
    prev
      ? `<a href="${unitPath(prev.id)}">← UNIT ${prev.id} ${esc(prev.title)}</a>`
      : `<span></span>`,
    `<a class="mid" href="./">📚 주제별 단어장 전체 보기</a>`,
    next
      ? `<a href="${unitPath(next.id)}">UNIT ${next.id} ${esc(next.title)} →</a>`
      : `<span></span>`,
  ].join("\n    ");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">주제별 단어장</a> › <span>UNIT ${u.id}</span>
  </nav>

  <h1>UNIT ${u.id} ${esc(u.title)}<span class="lvl ${LEVEL_CLASS[u.level] || "lvl-mid"}">${LEVEL_ICON[u.level] || "🟡"} ${esc(u.level)}</span></h1>
  <p class="lead">${esc(u.sub)} · 총 ${n}개 단어</p>
  <a class="cta" href="../?unit=${u.id}">🃏 이 유닛을 암기 카드·퀴즈로 학습하기</a>

  <h2 class="sec">UNIT ${u.id} 필수 단어 ${n}개</h2>
  <ol class="words">
${words.map(wordItem).join("\n")}
  </ol>

  <nav class="pager" aria-label="유닛 이동">
    ${pager}
  </nav>`;

  return { file, html: page({ title, description, canonical, ld, body }) };
}

/* ------------------------------------------------------------------ */
/* 5. 허브 페이지                                                      */
/* ------------------------------------------------------------------ */

function buildHubPage(units) {
  const canonical = `${SITE}/units/`;
  const total = units.reduce((n, u) => n + u.words.length, 0);
  const title = "주제별 TOEIC 단어장 30개 — 유닛별 필수 어휘 모음 | toeic.monster";
  const description = `TOEIC 필수 어휘 ${total.toLocaleString("en-US")}개를 비즈니스·금융·여행·IT 등 30개 주제로 나눴습니다. 유닛별 단어 목록에서 발음기호·한글 발음·예문·해석을 한 번에 확인하세요.`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "주제별 TOEIC 단어장 30개",
        description,
        url: canonical,
        inLanguage: "ko",
        isPartOf: { "@type": "WebSite", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "ItemList",
        name: "TOEIC 주제별 유닛 30개",
        numberOfItems: units.length,
        itemListElement: units.map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `UNIT ${u.id} ${u.title}`,
          url: unitUrl(u.id),
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "주제별 단어장", item: canonical },
        ],
      },
    ],
  });

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <span>주제별 단어장</span>
  </nav>

  <h1>주제별 TOEIC 단어장 30개</h1>
  <p class="lead">토익에 자주 나오는 필수 어휘 ${total.toLocaleString("en-US")}개를 주제별 30개 유닛으로 나눴습니다. 유닛을 누르면 단어·발음기호·한글 발음·예문·해석을 한 번에 볼 수 있습니다.</p>
  <a class="cta" href="../">🃏 암기 카드·퀴즈·실전 시험으로 학습하기</a>

  <h2 class="sec">유닛 목록</h2>
  <ul class="unitlist">
${units
  .map(
    (u) => `    <li><a href="${unitPath(u.id)}">
      <b>UNIT ${u.id} · ${LEVEL_ICON[u.level] || "🟡"} ${esc(u.level)}</b>
      <span>${u.icon ? u.icon + " " : ""}${esc(u.title)}</span>
      <em>단어 ${u.words.length}개</em>
    </a></li>`,
  )
  .join("\n")}
  </ul>

  <h2 class="sec">함께 보면 좋은 자료</h2>
  <ul class="unitlist">
    <li><a href="idioms.html">
      <b>구동사·숙어</b>
      <span>💡 빈출 구동사·숙어 60선</span>
      <em>뜻과 예문, 해석까지</em>
    </a></li>
  </ul>`;

  return { file: "units/index.html", html: page({ title, description, canonical, ld, body }) };
}

/* ------------------------------------------------------------------ */
/* 6. 숙어 페이지                                                      */
/* ------------------------------------------------------------------ */

function buildIdiomsPage(idioms) {
  const canonical = `${SITE}/units/idioms.html`;
  const n = idioms.length;
  const title = `TOEIC 빈출 구동사·숙어 ${n}선 — 뜻·예문·해석 | toeic.monster`;
  const description = `토익 시험에 자주 나오는 구동사와 숙어 ${n}개를 뜻·영문 예문·한글 해석과 함께 정리했습니다. put off, look into, take over 처럼 시험에 반복 출제되는 표현을 예문으로 익히세요.`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `TOEIC 빈출 구동사·숙어 ${n}선`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "숙어 목록",
        educationalUse: "self-study",
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "주제별 단어장", item: `${SITE}/units/` },
          { "@type": "ListItem", position: 3, name: `빈출 구동사·숙어 ${n}선`, item: canonical },
        ],
      },
    ],
  });

  const items = idioms
    .map(
      (it) => `      <li>
        <div class="w-row"><span class="w-word">${esc(it[0])}</span></div>
        <p class="w-mean">${esc(it[1])}</p>
        <p class="w-ex">${esc(it[2])}</p>
        <p class="w-exko">${esc(it[3])}</p>
      </li>`,
    )
    .join("\n");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">주제별 단어장</a> › <span>구동사·숙어</span>
  </nav>

  <h1>TOEIC 빈출 구동사·숙어 ${n}선</h1>
  <p class="lead">시험에 반복 출제되는 표현 ${n}개를 뜻과 예문, 해석과 함께 정리했습니다.</p>
  <a class="cta" href="../">🔊 발음까지 들으며 학습하기</a>

  <h2 class="sec">구동사·숙어 목록</h2>
  <ol class="words">
${items}
  </ol>

  <nav class="pager" aria-label="이동">
    <span></span>
    <a class="mid" href="./">📚 주제별 단어장 전체 보기</a>
    <span></span>
  </nav>`;

  return { file: "units/idioms.html", html: page({ title, description, canonical, ld, body }) };
}

/* ------------------------------------------------------------------ */
/* 7. 사이트맵                                                         */
/* ------------------------------------------------------------------ */

function buildSitemap(units, lastmod) {
  const rows = [];
  const add = (loc, changefreq, priority, date) => {
    rows.push(
      `  <url>\n` +
        `    <loc>${loc}</loc>\n` +
        `    <lastmod>${date || lastmod}</lastmod>\n` +
        `    <changefreq>${changefreq}</changefreq>\n` +
        `    <priority>${priority}</priority>\n` +
        `  </url>`,
    );
  };

  add(`${SITE}/`, "daily", "1.0");
  add(`${SITE}/units/`, "weekly", "0.9");
  units.forEach((u) => add(unitUrl(u.id), "monthly", "0.7"));
  add(`${SITE}/units/idioms.html`, "monthly", "0.7");
  add(`${SITE}/privacy.html`, "yearly", "0.3");
  add(`${SITE}/terms.html`, "yearly", "0.3");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

/* ------------------------------------------------------------------ */
/* 8. 실행                                                             */
/* ------------------------------------------------------------------ */

function main() {
  const meta = loadUnitMeta();
  const { vocab, idioms } = loadVocab();
  const lastmod = lastModified();

  const units = meta
    .filter((u) => Array.isArray(vocab[u.id]) && vocab[u.id].length)
    .sort((a, b) => a.id - b.id)
    .map((u) => ({ ...u, words: vocab[u.id] }));

  const missing = meta.length - units.length;
  if (missing > 0) console.warn(`⚠️  단어 데이터가 없는 유닛 ${missing}개는 건너뜁니다.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  let written = 0;
  units.forEach((u, i) => {
    const { file, html } = buildUnitPage(u, u.words, units[i - 1], units[i + 1]);
    write(file, html);
    written++;
  });

  const hub = buildHubPage(units);
  const idiomsPage = buildIdiomsPage(idioms);
  write(hub.file, hub.html);
  write(idiomsPage.file, idiomsPage.html);
  write("sitemap.xml", buildSitemap(units, lastmod));

  const words = units.reduce((n, u) => n + u.words.length, 0);
  console.log(`✅ 정적 페이지 생성 완료`);
  console.log(`   · 유닛 페이지 ${written}개 (단어 ${words.toLocaleString("en-US")}개)`);
  console.log(`   · 허브 1개 · 숙어 페이지 1개 (숙어 ${idioms.length}개)`);
  console.log(`   · sitemap.xml 갱신 (lastmod ${lastmod})`);
}

main();
