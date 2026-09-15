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
 *   units/idioms.html       — 빈출 구동사·숙어 모음
 *   guides/*.html           — 파트별 전략·공략 가이드 (data/extra.js)
 *   grammar/*.html          — 기초·중급·고급 문법 교재 (data/grammar-*.js)
 *   404.html                — 없는 주소 안내 (GitHub Pages 커스텀 404)
 *   assets/site.css         — 정적 페이지 공용 스타일(최소화)
 *   sitemap.xml             — 위 페이지들을 포함한 전체 사이트맵
 *
 * 왜 CSS 를 따로 굽는가:
 *   정적 페이지는 43개인데 모두 같은 스타일을 씁니다. 페이지마다 인라인으로 넣으면
 *   같은 9KB 를 43번 다시 받게 되어 합쳐서 380KB 가 됩니다. 공용 파일로 빼고
 *   최소화하면 한 번만 받고 모든 페이지에서 재사용합니다.
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

/** 공용 자산 경로 — units/·guides/·grammar/ 페이지는 한 단계 아래에 있습니다. */
const ASSET_REL = "../assets/";
/** 404.html 만 루트에 있으므로 절대 경로를 씁니다(임의 주소에서도 응답되는 파일이라 상대 경로 금지). */
const ASSET_ABS = "/assets/";

/** 단계별 문법 교재 데이터 파일 — index.html 과 감사 도구도 같은 목록을 씁니다. */
const GRAMMAR_FILES = ["data/grammar-basic.js", "data/grammar-intermediate.js", "data/grammar-advanced.js"];

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
  for (const file of ["data/idioms.js", "data/extra.js", GRAMMAR_FILES].flat()) {
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  }
  const vocab = sandbox.window.VOCAB_UNITS || {};
  const idioms = sandbox.window.VOCAB_IDIOMS || [];
  const extra = sandbox.window.TOEIC_EXTRA || {};
  const grammar = sandbox.window.GRAMMAR_BOOKS || [];
  if (!Object.keys(vocab).length) throw new Error("어휘 데이터를 읽지 못했습니다.");
  if (!idioms.length) throw new Error("숙어 데이터를 읽지 못했습니다.");
  if (!grammar.length) throw new Error("문법 교재 데이터를 읽지 못했습니다.");
  return { vocab, idioms, extra, grammar };
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
/* 색 토큰은 index.html 과 이름을 맞춰, 앱에서 고른 다크 테마가 정적 페이지에도 그대로 적용되게 합니다. */
:root{--primary:#3b5bdb;--primary-dark:#2f4bb8;--primary-solid:#3b5bdb;--primary-solid-hover:#2f4bb8;--topbar-bg:#3b5bdb;--bg:#f6f7fb;--card:#fff;--text:#212529;--muted:#5f6673;--border:#e5e7eb;--accent:#f59f00;--kpron-text:#8a5a00;--soft:#eef2ff;--cyan:#0b7285;--kpron-bg:#fff8e6;--ex-text:#495057;--correct-bg:#d3f9d8;--green-text:#166534;--warn-bg:#fff3bf;--warn-text:#7a5c00;--wrong-bg:#ffe3e3;--red-text:#b02a2a}
html.dark-pending{--primary:#8ba3ff;--primary-dark:#93a5ff;--primary-solid:#3d51c4;--primary-solid-hover:#33429f;--topbar-bg:#3d51c4;--bg:#10141b;--card:#1a1f2a;--text:#e6e9ef;--muted:#98a1b0;--border:#2c3442;--accent:#ffc93d;--kpron-text:#ffc93d;--soft:#232c44;--cyan:#6fd3e8;--kpron-bg:#3a3020;--ex-text:#c9d1dc;--correct-bg:#1e3526;--green-text:#51cf66;--warn-bg:#3a3318;--warn-text:#ffd43b;--wrong-bg:#3a2326;--red-text:#ff8787}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Pretendard Variable",Pretendard,"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;background:var(--bg);color:var(--text);line-height:1.7}
a{color:var(--primary)}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}
header.bar{background:var(--topbar-bg);color:#fff}
header.bar .wrap{padding:14px 20px;display:flex;flex-wrap:wrap;align-items:baseline;gap:10px}
header.bar a{color:#fff;text-decoration:none;font-weight:800;font-size:20px;letter-spacing:-.5px}
header.bar small{opacity:.88;font-size:12.5px}
main{padding:0 0 30px}
.crumb{font-size:13px;color:var(--muted);margin:20px 0 12px}
.crumb a{display:inline-block;padding:5px 8px;text-decoration:none}
.crumb a:hover{text-decoration:underline}
h1{font-size:25px;line-height:1.4;letter-spacing:-.5px;color:var(--primary-dark)}
h2.sec{font-size:17px;margin:26px 0 12px;color:var(--text)}
.lead{font-size:14px;color:var(--muted);margin:8px 0 14px}
.cta{display:inline-block;background:var(--primary-solid);color:#fff;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;padding:11px 18px;margin:2px 0 6px}
.cta:hover{background:var(--primary-solid-hover)}
h1 .lvl{font-size:12px;font-weight:700;border-radius:99px;padding:3px 10px;vertical-align:3px;margin-left:6px}
.lvl-easy{background:var(--correct-bg);color:var(--green-text)}
.lvl-mid{background:var(--warn-bg);color:var(--warn-text)}
.lvl-hard{background:var(--wrong-bg);color:var(--red-text)}
ol.words{list-style:none;display:grid;gap:12px;margin-top:6px}
ol.words li{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:15px 17px}
.w-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;margin-bottom:5px}
.w-word{font-size:19px;font-weight:800;color:var(--primary-dark);letter-spacing:-.3px;word-break:break-word}
.w-ipa{font-size:13px;color:var(--muted)}
.w-kr{font-size:13.5px;font-weight:700;color:var(--kpron-text);background:var(--kpron-bg);border-radius:6px;padding:1px 7px}
.w-mean{font-size:15px;font-weight:700;margin-bottom:6px}
.w-ex{font-size:13.5px;font-style:italic;color:var(--ex-text)}
.w-expron{font-size:12.5px;font-weight:600;color:var(--cyan)}
.w-exko{font-size:12.5px;color:var(--muted)}
.pager{display:flex;flex-wrap:wrap;gap:12px;justify-content:space-between;align-items:center;margin-top:28px;font-size:14px;font-weight:700}
.pager a{display:inline-block;padding:10px 0;text-decoration:none}
.pager a:hover{text-decoration:underline}
.pager .mid{font-weight:600;font-size:13px}
.unitlist{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;margin-top:6px}
.unitlist a{display:block;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 15px;text-decoration:none;color:var(--text)}
.unitlist a:hover{border-color:var(--primary)}
.unitlist b{display:block;font-size:11.5px;color:var(--primary);letter-spacing:.3px;margin-bottom:3px}
.unitlist span{font-size:14.5px;font-weight:700}
.unitlist em{display:block;font-size:12px;color:var(--muted);font-style:normal;margin-top:3px}
footer.ft{border-top:1px solid var(--border);margin-top:34px;padding-top:16px;font-size:12.5px;color:var(--muted)}
footer.ft a{display:inline-block;padding:5px 8px;text-decoration:none}
footer.ft a:hover{text-decoration:underline}
footer.ft p{margin-top:8px}
/* 문법 교재 */
.book-cover{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px 22px;margin:14px 0 22px}
.book-cover .bc-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:14px}
.book-cover .bc-meta div{background:var(--soft);border-radius:10px;padding:10px 12px}
.book-cover .bc-meta b{display:block;font-size:11.5px;color:var(--muted);font-weight:700;margin-bottom:3px}
.book-cover .bc-meta span{font-size:13px;color:var(--text)}
.book-cover h2{font-size:15px;margin:16px 0 8px;color:var(--primary-dark)}
.book-cover ul{margin:0;padding-left:18px;font-size:13.5px;color:var(--muted)}
.book-cover li{margin-bottom:4px}
.toc{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin-top:8px}
.toc a{display:block;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:11px 14px;text-decoration:none;color:var(--text)}
.toc a:hover{border-color:var(--primary)}
.toc b{display:block;font-size:11.5px;color:var(--primary);letter-spacing:.3px;margin-bottom:3px}
.toc span{font-size:14px;font-weight:700}
.gram{margin:30px 0 0;padding-top:6px}
.gram-head{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--border);padding-bottom:8px;margin-bottom:10px}
.gram-no{flex:0 0 auto;background:var(--primary-solid);color:#fff;font-size:12px;font-weight:800;border-radius:6px;padding:3px 8px}
.gram-head h2{font-size:19px;color:var(--primary-dark);letter-spacing:-.3px}
.gram-sum{font-size:14px;color:var(--muted);margin:6px 0 16px}
.g-point{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:15px 17px;margin-bottom:12px}
.g-point h3{font-size:15.5px;color:var(--text);margin-bottom:6px}
.g-point p{font-size:13.5px;color:var(--text);line-height:1.75}
.g-note{font-size:12.5px;color:var(--muted);background:var(--soft);border-radius:8px;padding:8px 11px;margin-top:8px}
.gtable-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:10px 0 4px;padding-bottom:2px}
.gtable{width:100%;min-width:340px;border-collapse:collapse;font-size:13px;margin:0}
.gtable th,.gtable td{border:1px solid var(--border);padding:7px 10px;text-align:left;vertical-align:top}
.gtable th{background:var(--soft);white-space:nowrap}
@media (max-width:520px){.gtable{font-size:12.5px}.gtable th,.gtable td{padding:6px 8px}}
.gex{margin:9px 0 0;padding-left:12px;border-left:3px solid var(--soft)}
.gex .en{font-size:13.5px;font-weight:600;color:var(--text)}
.gex .ko{font-size:12.5px;color:var(--muted)}
.gmistake{background:var(--card);border:1px solid var(--border);border-left:4px solid var(--accent);border-radius:12px;padding:13px 16px;margin-bottom:12px}
.gmistake h3{font-size:14px;margin-bottom:6px}
.gmistake ul{margin:0;padding-left:18px;font-size:13px;color:var(--muted)}
.gmistake li{margin-bottom:4px}
.gquiz{background:var(--card);border:1px solid var(--border);border-left:4px solid var(--primary);border-radius:12px;padding:13px 16px;margin-bottom:10px}
.gquiz h3{font-size:14px;margin-bottom:6px}
.gquiz-q{font-size:13.5px;font-weight:600;margin-bottom:7px}
.gquiz-opts{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px;margin:0}
.gquiz-opts li{background:var(--soft);border-radius:8px;padding:7px 10px;font-size:13px}
.gquiz details{margin-top:9px}
.gquiz summary{cursor:pointer;font-size:12.5px;font-weight:700;color:var(--primary);padding:12px 0}
.gquiz .gquiz-a{font-size:12.5px;color:var(--muted);margin-top:6px}
.gquiz .gquiz-a b{color:var(--text)}
.gex-speak{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;margin-left:6px;border:1px solid var(--border);border-radius:50%;background:var(--card);color:var(--cyan);cursor:pointer;font-size:12.5px;line-height:1;vertical-align:-5px}
.gex-speak[hidden]{display:none}
.gex-speak:hover{background:var(--soft)}
.gex-speak:active{transform:scale(.93)}
.gex-speak.speaking{background:var(--soft);border-color:var(--primary);box-shadow:0 0 0 3px var(--soft)}
.cheat-grid{list-style:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:10px;margin-top:8px}
.cheat-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
.cheat-card b{display:block;font-size:11.5px;color:var(--primary);letter-spacing:.3px;margin-bottom:3px}
.cheat-card .cheat-title{display:block;font-size:14.5px;font-weight:800;margin-bottom:5px}
.cheat-card p{font-size:12.5px;color:var(--muted);margin-bottom:6px}
.cheat-card ul{margin:0 0 8px;padding-left:16px;font-size:12.5px;color:var(--text)}
.cheat-card li{margin-bottom:3px}
.cheat-card a{font-size:12.5px;font-weight:700;text-decoration:none}
@media print{header.bar,footer.ft,.pager,.cta,.cheat-card a{display:none}body{background:#fff}.wrap{max-width:none;padding:0}.cheat-grid{grid-template-columns:1fr 1fr}.cheat-card{border-color:#bbb;page-break-inside:avoid}}
`;

/**
 * 스타일시트를 최소화합니다 — 주석·줄바꿈·중복 공백만 정리하고 **값은 그대로** 둡니다.
 *
 * 이 CSS 에는 문자열 리터럴(content:"…")이나 url("") 이 없어서 공백을 마음껏 줄일 수 있습니다.
 * calc(100% - 28px) 처럼 공백이 의미를 갖는 자리는 건드리지 않습니다.
 */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")   // 주석
    .replace(/\s+/g, " ")                // 줄바꿈·들여쓰기 → 한 칸
    .replace(/\s*([{};,])\s*/g, "$1")    // 괄호·세미콜론·쉼표 주변 공백
    .trim();
}

/** 공용 스타일을 참조한 페이지 수 — 실행 로그에 쓰기 위해 셉니다. */
let pagesWithSharedCss = 0;

function page({ title, description, canonical, ld, body, footerNav, speak }) {
  pagesWithSharedCss++;
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
<!-- 본문 서체 — Pretendard Variable. 필요한 글자 조각만 내려받는 dynamic subset 이라 첫 로드 부담이 작습니다. -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<!-- 공용 스타일·스크립트 — 43개 정적 페이지가 한 파일을 함께 받아 씁니다(서비스워커가 캐시). -->
<link rel="stylesheet" href="${ASSET_REL}site.css">${speak ? `\n<script defer src="${ASSET_REL}speak.js"><\/script>` : ""}
<link rel="icon" href="../icon.svg" type="image/svg+xml">
<link rel="icon" href="../icon-192.png" type="image/png" sizes="192x192">
<!-- iOS 홈 화면은 SVG 아이콘을 쓰지 않으므로 PNG 를 따로 지정합니다(tools/make-icons.py 로 생성). -->
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<script>
  // 앱(index.html)에서 고른 테마를 정적 페이지에도 첫 페인트 전에 적용해,
  // 다크 모드 사용자가 흰 화면을 번쩍 보지 않게 합니다.
  // 아직 직접 고른 적이 없으면 OS 의 다크 모드 설정을 따릅니다.
  (function () {
    try {
      var t = localStorage.getItem("toeic1000_theme");
      if (!t) t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (t === "dark") {
        document.documentElement.classList.add("dark-pending");
        var m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute("content", "#10141b");
      }
    } catch (e) {}
  })();
</script>
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
    ${footerNav || `<a href="../">홈</a><a href="./">주제별 단어장</a><a href="idioms.html">빈출 구동사·숙어</a><a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>`}
  </nav>
  <p>👾 toeic.monster · TOEIC 어휘 무료 학습 사이트 · 학습 기록은 브라우저에만 저장됩니다</p>
</footer>
</body>
</html>
`;
}

/**
 * 예문 듣기 버튼 스크립트는 이제 공용 파일(assets/speak.js)로 분리했습니다.
 * 43개 페이지가 같은 2.3KB 를 각각 받지 않도록, 페이지는 defer 로 그 파일을 불러옵니다.
 */
/** 📘 버튼을 예문 옆에 붙입니다(듣기 대상 문장은 data-say 에 담습니다). */
function speakBtn(text) {
  // 같은 문장이 여러 번 나오므로, 낭독기에서 어떤 문장인지 구분되도록 문장을 라벨에 넣습니다.
  return ` <button type="button" class="gex-speak" data-say="${esc(text)}" aria-label="예문 듣기: ${esc(text)}" title="예문 듣기">🔊</button>`;
}

/* ------------------------------------------------------------------ */
/* 4. 유닛 페이지                                                      */
/* ------------------------------------------------------------------ */

function wordItem(w) {
  const [word, ipa, kpron, mean, ex, exKo, exPron] = w;
  // 영어 단어·발음기호·예문에는 lang="en" 을 붙여 화면 낭독기가 영어로 읽게 합니다.
  return `      <li>
        <div class="w-row"><span class="w-word" lang="en">${esc(word)}</span><span class="w-ipa" lang="en">${esc(ipa)}</span><span class="w-kr">${esc(kpron)}</span></div>
        <p class="w-mean">${esc(mean)}</p>
        <p class="w-ex" lang="en">${esc(ex)}</p>
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
      <span>💡 빈출 구동사·숙어 모음</span>
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
        <div class="w-row"><span class="w-word" lang="en">${esc(it[0])}</span></div>
        <p class="w-mean">${esc(it[1])}</p>
        <p class="w-ex" lang="en">${esc(it[2])}</p>
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
/* 6-2. 전략·공략 가이드 (data/extra.js)                                */
/* ------------------------------------------------------------------ */

const GUIDE_FOOTER =
  '<a href="../">홈</a><a href="../units/">주제별 단어장</a><a href="index.html">전략·공략 가이드</a>' +
  '<a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>';

function buildGuidesHub(guides) {
  const canonical = `${SITE}/guides/`;
  const description =
    "Part 5 문법, Part 6 장문 공란, Part 7 복수 지문, Part 2 함정 유형, 어휘 30일 커리큘럼, LC 숫자 함정까지 파트별 공략법을 정리했습니다.";
  const title = "TOEIC 파트별 전략·공략 가이드 | toeic.monster";

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "TOEIC 파트별 전략·공략 가이드",
    description,
    url: canonical,
    inLanguage: "ko",
    isPartOf: { "@type": "WebSite", name: "toeic.monster", url: `${SITE}/` },
  });

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <span>전략·공략 가이드</span>
  </nav>

  <h1>TOEIC 파트별 전략·공략 가이드</h1>
  <p class="lead">${esc(description)}</p>
  <a class="cta" href="../">🃏 단어·퀴즈로 바로 학습하기</a>

  <h2 class="sec">가이드 목록</h2>
  <ul class="unitlist">
${guides
  .map(
    (g) => `    <li><a href="${g.slug}.html">
      <b>가이드</b>
      <span>${esc(g.title)}</span>
      <em>${esc(g.desc)}</em>
    </a></li>`,
  )
  .join("\n")}
  </ul>`;

  return { file: "guides/index.html", html: page({ title, description, canonical, ld, body, footerNav: GUIDE_FOOTER }) };
}

function buildGuidePage(g) {
  const canonical = `${SITE}/guides/${g.slug}.html`;
  const title = `${g.title} | toeic.monster`;
  const description = g.desc;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: g.title,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "전략 가이드",
        educationalUse: "self-study",
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "전략·공략 가이드", item: `${SITE}/guides/` },
          { "@type": "ListItem", position: 3, name: g.title, item: canonical },
        ],
      },
    ],
  });

  const sections = (g.sections || [])
    .map(
      (s) =>
        `  <h2 class="sec">${esc(s.h)}</h2>\n  <ol class="words">\n` +
        (s.list || []).map((li) => `    <li><span class="w-mean">${esc(li)}</span></li>`).join("\n") +
        `\n  </ol>`,
    )
    .join("\n");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">전략·공략 가이드</a> › <span>${esc(g.title)}</span>
  </nav>

  <h1>${esc(g.title)}</h1>
  <p class="lead">${esc(g.desc)}</p>
  <a class="cta" href="../">🃏 단어·퀴즈로 바로 학습하기</a>

${sections}

  <nav class="pager" aria-label="이동">
    <span></span>
    <a class="mid" href="./">📕 가이드 전체 보기</a>
    <span></span>
  </nav>`;

  return { file: `guides/${g.slug}.html`, html: page({ title, description, canonical, ld, body, footerNav: GUIDE_FOOTER }) };
}

/* ------------------------------------------------------------------ */
/* 6-3. 단계별 문법 교재 (data/grammar-*.js)                            */
/* ------------------------------------------------------------------ */

const GRAMMAR_FOOTER =
  '<a href="../">홈</a><a href="../units/">주제별 단어장</a><a href="index.html">문법 교재</a>' +
  '<a href="../guides/">전략·공략 가이드</a><a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>';

/** 과 번호에 붙는 앵커 id — 목차 링크와 감사(앵커 검증)가 함께 씁니다. */
const chapterAnchor = (no) => `ch-${String(no).padStart(2, "0")}`;

function buildGrammarHub(books) {
  const canonical = `${SITE}/grammar/`;
  const totalCh = books.reduce((n, b) => n + b.chapters.length, 0);
  const totalQ = books.reduce(
    (n, b) => n + b.chapters.reduce((m, c) => m + (c.practice || []).length, 0),
    0,
  );
  const title = `영문법 교재 3단계 — 기초·중급·고급 | toeic.monster`;
  const description = `be동사부터 분사구문·도치까지, 기초·중급·고급 3단계 영문법 교재 ${totalCh}과와 연습 문제 ${totalQ}문항을 예문·형태 표와 함께 무료로 정리했습니다.`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "영문법 교재 3단계 — 기초·중급·고급",
        description,
        url: canonical,
        inLanguage: "ko",
        isPartOf: { "@type": "WebSite", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "ItemList",
        name: "단계별 영문법 교재",
        numberOfItems: books.length,
        itemListElement: books.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: `${b.level} ${b.title}`,
          url: `${SITE}/grammar/${b.id}.html`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "문법 교재", item: canonical },
        ],
      },
    ],
  });

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <span>문법 교재</span>
  </nav>

  <h1>영문법 교재 3단계 — 기초·중급·고급</h1>
  <p class="lead">${esc(description)}</p>
  <a class="cta" href="../">🃏 단어·퀴즈로 바로 학습하기</a>
  <a class="cta" href="cheatsheet.html">🧾 한 장 요약으로 보기</a>

  <h2 class="sec">교재 목록</h2>
  <ul class="unitlist">
${books
  .map(
    (b) => `    <li><a href="${b.id}.html">
      <b>${LEVEL_ICON[b.level] || "🟡"} ${esc(b.level)} · CEFR ${esc(b.cefr || "")}</b>
      <span>${esc(b.title)}</span>
      <em>${esc(b.subtitle)} · ${b.chapters.length}과</em>
    </a></li>`,
  )
  .join("\n")}
  </ul>

  <h2 class="sec">학습 순서</h2>
  <ol class="words">
    <li><span class="w-mean">기초 영문법으로 문장의 뼈대와 기본 시제를 먼저 정리합니다.</span></li>
    <li><span class="w-mean">중급 영문법에서 완료시제·수동태·관계사·준동사를 익힙니다.</span></li>
    <li><span class="w-mean">고급 영문법으로 도치·강조·문어체 표현을 다듬습니다.</span></li>
  </ol>`;

  return { file: "grammar/index.html", html: page({ title, description, canonical, ld, body, footerNav: GRAMMAR_FOOTER }) };
}

function grammarPoint(p) {
  const table = p.table
    ? `\n      <div class="gtable-wrap">\n      <table class="gtable">\n        <thead><tr>${(p.table.head || [])
        .map((h) => `<th>${esc(h)}</th>`)
        .join("")}</tr></thead>\n        <tbody>${(p.table.rows || [])
        .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
        .join("")}</tbody>\n      </table>\n      </div>`
    : "";
  const examples = (p.examples || [])
    .map(
      (e) =>
        `\n      <div class="gex"><div class="en" lang="en">${esc(e.en)}${speakBtn(e.en)}</div><div class="ko">${esc(e.ko)}</div></div>`,
    )
    .join("");
  const note = p.note ? `\n      <p class="g-note">💡 ${esc(p.note)}</p>` : "";
  return `    <div class="g-point">
      <h3>${esc(p.h)}</h3>
      <p>${esc(p.body)}</p>${table}${examples}${note}
    </div>`;
}

function grammarChapter(c) {
  const points = (c.points || []).map(grammarPoint).join("\n");
  const mistakes = (c.mistakes || []).length
    ? `\n    <div class="gmistake">
      <h3>⚠️ 자주 틀리는 포인트</h3>
      <ul>${c.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
    </div>`
    : "";
  const practice = (c.practice || []).length
    ? `\n    <div class="gquiz">
      <h3>✏️ 연습 문제 ${c.practice.length}문항</h3>${c.practice
        .map(
          (q, i) => `\n      <div class="gquiz-item">
        <p class="gquiz-q">${i + 1}. ${esc(q.q)}</p>
        <ol class="gquiz-opts">${(q.opts || []).map((o) => `<li>${esc(o)}</li>`).join("")}</ol>
        <details><summary>정답과 해설 보기</summary><p class="gquiz-a"><b>정답: ${esc(q.a)}</b><br>${esc(q.why)}</p></details>
      </div>`,
        )
        .join("")}
    </div>`
    : "";

  return `  <section class="gram" id="${chapterAnchor(c.no)}">
    <div class="gram-head"><span class="gram-no">${String(c.no).padStart(2, "0")}과</span><h2>${esc(c.title)}</h2></div>
    <p class="gram-sum">${esc(c.summary)}</p>
${points}${mistakes}${practice}
  </section>`;
}

function buildGrammarBook(book, books) {
  const canonical = `${SITE}/grammar/${book.id}.html`;
  const title = `${book.title} — ${book.subtitle} | toeic.monster`;
  const description = book.desc;
  const idx = books.findIndex((b) => b.id === book.id);
  const prev = books[idx - 1];
  const next = books[idx + 1];

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `${book.title} — ${book.subtitle}`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "문법 교재",
        educationalUse: "self-study",
        educationalLevel: book.cefr,
        teaches: book.chapters.map((c) => c.title),
        isPartOf: { "@type": "CollectionPage", name: "영문법 교재 3단계", url: `${SITE}/grammar/` },
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "문법 교재", item: `${SITE}/grammar/` },
          { "@type": "ListItem", position: 3, name: book.title, item: canonical },
        ],
      },
    ],
  });

  const toc = book.chapters
    .map(
      (c) => `    <li><a href="#${chapterAnchor(c.no)}">
      <b>${String(c.no).padStart(2, "0")}과</b>
      <span>${esc(c.title)}</span>
    </a></li>`,
    )
    .join("\n");

  const pager = [
    prev ? `<a href="${prev.id}.html">← ${esc(prev.level)} ${esc(prev.title)}</a>` : `<span></span>`,
    `<a class="mid" href="./">📘 문법 교재 전체 보기</a>`,
    next ? `<a href="${next.id}.html">${esc(next.level)} ${esc(next.title)} →</a>` : `<span></span>`,
  ].join("\n    ");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">문법 교재</a> › <span>${esc(book.title)}</span>
  </nav>

  <h1>${esc(book.title)}<span class="lvl ${LEVEL_CLASS[book.level] || "lvl-mid"}">${LEVEL_ICON[book.level] || "🟡"} ${esc(book.level)}</span></h1>
  <p class="lead">${esc(book.subtitle)} · 총 ${book.chapters.length}과</p>

  <div class="book-cover">
    <h2>이 교재의 목표</h2>
    <p>${esc(book.goal)}</p>
    <div class="bc-meta">
      <div><b>CEFR</b><span>${esc(book.cefr || "")}</span></div>
      <div><b>대상</b><span>${esc(book.audience)}</span></div>
      <div><b>분량</b><span>${book.chapters.length}과 · 연습 문제 ${book.chapters.reduce((n, c) => n + (c.practice || []).length, 0)}문항</span></div>
    </div>
    <h2>이렇게 학습하세요</h2>
    <ul>${(book.howto || []).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
  </div>

  <a class="cta" href="cheatsheet.html">🧾 한 장 요약 보기</a>
  <a class="cta" href="../index.html?level=${book.id}#grammar-quiz">✏️ 앱에서 이 교재 문제 풀기</a>
  <p class="lead">🔊 를 누르면 예문 발음을 들을 수 있습니다(앱에서 고른 목소리·속도를 그대로 사용).</p>

  <h2 class="sec">목차</h2>
  <ul class="toc">
${toc}
  </ul>

${book.chapters.map(grammarChapter).join("\n\n")}

  <nav class="pager" aria-label="교재 이동">
    ${pager}
  </nav>`;

  return {
    file: `grammar/${book.id}.html`,
    // 교재 페이지에는 예문 듣기 버튼이 있어 공용 스크립트(assets/speak.js)가 필요합니다.
    html: page({ title, description, canonical, ld, body, footerNav: GRAMMAR_FOOTER, speak: true }),
  };
}

function buildGrammarCheatsheet(books) {
  const canonical = `${SITE}/grammar/cheatsheet.html`;
  const chapters = books.reduce((n, b) => n + b.chapters.length, 0);
  const title = `영문법 한 장 요약 — ${chapters}과 핵심 정리 | toeic.monster`;
  const description = `기초·중급·고급 문법 ${chapters}과의 핵심 개념을 한 페이지에 요약했습니다. 인쇄해 두고 시험 전 복습용으로 활용하세요.`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `영문법 한 장 요약 — ${chapters}과 핵심 정리`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "요약 정리",
        educationalUse: "self-study",
        teaches: books.reduce((a, b) => a.concat(b.chapters.map((c) => c.title)), []),
        isPartOf: { "@type": "CollectionPage", name: "영문법 교재 3단계", url: `${SITE}/grammar/` },
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "문법 교재", item: `${SITE}/grammar/` },
          { "@type": "ListItem", position: 3, name: "한 장 요약", item: canonical },
        ],
      },
    ],
  });

  const sections = books
    .map(
      (b) => `  <h2 class="sec">${LEVEL_ICON[b.level] || "🟡"} ${esc(b.level)} · ${esc(b.title)} (CEFR ${esc(b.cefr || "")})</h2>
  <ul class="cheat-grid">
${b.chapters
  .map(
    (c) => `    <li class="cheat-card">
      <b>${String(c.no).padStart(2, "0")}과</b>
      <span class="cheat-title">${esc(c.title)}</span>
      <p>${esc(c.summary)}</p>
      <ul>${(c.points || []).map((p) => `<li>${esc(p.h)}</li>`).join("")}</ul>
      <a href="${b.id}.html#${chapterAnchor(c.no)}">교재에서 자세히 보기 →</a>
    </li>`,
  )
  .join("\n")}
  </ul>`,
    )
    .join("\n\n");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">문법 교재</a> › <span>한 장 요약</span>
  </nav>

  <h1>영문법 한 장 요약 — ${chapters}과 핵심 정리</h1>
  <p class="lead">기초·중급·고급 ${chapters}과의 개념과 형태를 한 페이지에 모았습니다. 브라우저 인쇄(Ctrl+P)로 저장해 두고 시험 전 복습용으로 쓰세요.</p>
  <a class="cta" href="./">📘 문법 교재 전체 보기</a>

${sections}

  <nav class="pager" aria-label="이동">
    <span></span>
    <a class="mid" href="./">📘 문법 교재 전체 보기</a>
    <span></span>
  </nav>`;

  return {
    file: "grammar/cheatsheet.html",
    html: page({ title, description, canonical, ld, body, footerNav: GRAMMAR_FOOTER }),
  };
}

/* ------------------------------------------------------------------ */
/* 6-9. 404 페이지                                                      */
/* ------------------------------------------------------------------ */

/**
 * 404.html — GitHub Pages 는 없는 주소를 이 파일로 되돌려줍니다.
 *
 * 주의: 이 파일은 루트(/)에서 내려가지만 **임의의 주소에서도** 응답됩니다.
 *   그래서 링크·자산에 상대 경로(./units/…)를 쓸 수 없습니다.
 *   (예: /units/foo 를 요청하면 ./units/ 는 /units/units/ 가 됩니다.)
 *   전부 루트 절대 경로("/units/")로 적습니다.
 *
 * 검색엔진에는 noindex 로 알립니다 — 404 는 색인 대상이 아니고,
 * 사이트맵에도 넣지 않습니다(audit-site.mjs 가 두 가지를 함께 검사합니다).
 */
const NOT_FOUND_LINKS = [
  ["/units/", "단어장", "주제별 30개 유닛 · 단어 1,000개"],
  ["/units/idioms.html", "빈출 구동사·숙어", "126개 숙어와 예문"],
  ["/grammar/", "문법 교재", "기초·중급·고급 36과 + 연습 108문항"],
  ["/grammar/cheatsheet.html", "문법 한 장 요약", "시험 직전에 훑는 핵심 정리"],
  ["/guides/", "전략·유형 가이드", "파트별 공략 9편"],
];

function build404Page() {
  pagesWithSharedCss++;
  const links = NOT_FOUND_LINKS.map(
    ([href, title, sub]) => `      <li><a href="${href}"><b>${esc(title)}</b><span>${esc(sub)}</span></a></li>`,
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>페이지를 찾을 수 없습니다 (404) — toeic.monster</title>
<meta name="description" content="요청한 주소의 페이지를 찾을 수 없습니다. toeic.monster 의 학습 자료로 이동해 주세요.">
<!-- 404 는 색인 대상이 아니지만, 링크는 따라가도 되므로 follow 를 남깁니다. -->
<meta name="robots" content="noindex, follow">
<meta name="theme-color" content="#3b5bdb">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<script>
  // 앱(index.html)에서 고른 테마를 그대로 적용합니다. 직접 고른 적이 없으면 OS 설정을 따릅니다.
  (function () {
    try {
      var t = localStorage.getItem("toeic1000_theme");
      if (!t) t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      if (t === "dark") {
        document.documentElement.classList.add("dark-pending");
        var m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute("content", "#10141b");
      }
    } catch (e) {}
  })();
</script>
<link rel="stylesheet" href="${ASSET_ABS}site.css">
</head>
<body>
<header class="bar">
  <div class="wrap">
    <a href="/">toeic.monster</a>
    <small>발음·예문으로 외우는 TOEIC 필수 어휘 1,000</small>
  </div>
</header>
<main class="wrap">
  <h1>페이지를 찾을 수 없습니다</h1>
  <p class="lead">주소가 바뀌었거나 오타가 있을 수 있습니다. 아래 학습 자료는 그대로 볼 수 있습니다.</p>
  <p><a class="cta" href="/">홈으로 가서 학습 시작하기</a></p>
  <h2 class="sec">바로 볼 수 있는 학습 자료</h2>
  <ul class="unitlist">
${links}
  </ul>
</main>
<footer class="ft wrap">
  <nav>
    <a href="/">홈</a><a href="/units/">주제별 단어장</a><a href="/units/idioms.html">빈출 구동사·숙어</a><a href="/privacy.html">개인정보처리방침</a><a href="/terms.html">이용약관</a>
  </nav>
  <p>👾 toeic.monster · TOEIC 어휘 무료 학습 사이트 · 학습 기록은 브라우저에만 저장됩니다</p>
</footer>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* 7. 사이트맵                                                         */
/* ------------------------------------------------------------------ */

function buildSitemap(units, lastmod, guides, grammar) {
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
  if (guides && guides.length) {
    add(`${SITE}/guides/`, "monthly", "0.6");
    guides.forEach((g) => add(`${SITE}/guides/${g.slug}.html`, "monthly", "0.6"));
  }
  if (grammar && grammar.length) {
    add(`${SITE}/grammar/`, "monthly", "0.8");
    grammar.forEach((b) => add(`${SITE}/grammar/${b.id}.html`, "monthly", "0.8"));
    add(`${SITE}/grammar/cheatsheet.html`, "monthly", "0.7");
  }
  // privacy.html·terms.html 은 robots=noindex 이므로 사이트맵에 넣지 않는다.
  // (noindex 페이지를 사이트맵에 제출하면 서치콘솔에서 오류로 보고된다.)

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>\n`;
}

/* ------------------------------------------------------------------ */
/* 8. 실행                                                             */
/* ------------------------------------------------------------------ */

function main() {
  const meta = loadUnitMeta();
  const { vocab, idioms, extra, grammar } = loadVocab();
  const guides = Array.isArray(extra.guides) ? extra.guides : [];
  const lastmod = lastModified();

  const units = meta
    .filter((u) => Array.isArray(vocab[u.id]) && vocab[u.id].length)
    .sort((a, b) => a.id - b.id)
    .map((u) => ({ ...u, words: vocab[u.id] }));

  const missing = meta.length - units.length;
  if (missing > 0) console.warn(`⚠️  단어 데이터가 없는 유닛 ${missing}개는 건너뜁니다.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 공용 스타일 — 정적 페이지 43개가 이 한 파일을 함께 받아 씁니다.
  // (페이지마다 인라인으로 넣으면 같은 내용을 43번 다시 받게 됩니다.)
  const siteCss = minifyCss(CSS);
  write("assets/site.css", siteCss);

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

  guides.forEach((g) => {
    const gp = buildGuidePage(g);
    write(gp.file, gp.html);
  });
  if (guides.length) {
    const gh = buildGuidesHub(guides);
    write(gh.file, gh.html);
  }

  grammar.forEach((b) => {
    const gp = buildGrammarBook(b, grammar);
    write(gp.file, gp.html);
  });
  if (grammar.length) {
    const gh = buildGrammarHub(grammar);
    write(gh.file, gh.html);
    const cs = buildGrammarCheatsheet(grammar);
    write(cs.file, cs.html);
  }

  // 404 는 색인 대상이 아니므로 사이트맵에 넣지 않습니다(noindex).
  write("404.html", build404Page());
  write("sitemap.xml", buildSitemap(units, lastmod, guides, grammar));

  const words = units.reduce((n, u) => n + u.words.length, 0);
  const chapters = grammar.reduce((n, b) => n + b.chapters.length, 0);
  const quizzes = grammar.reduce((n, b) => n + b.chapters.reduce((m, c) => m + (c.practice || []).length, 0), 0);
  console.log(`✅ 정적 페이지 생성 완료`);
  console.log(`   · 유닛 페이지 ${written}개 (단어 ${words.toLocaleString("en-US")}개)`);
  console.log(`   · 허브 1개 · 숙어 페이지 1개 (숙어 ${idioms.length}개)`);
  console.log(`   · 가이드 페이지 ${guides.length}개 + 허브 1개`);
  console.log(`   · 문법 교재 ${grammar.length}권 + 허브 1개 + 한 장 요약 (${chapters}과 · 연습 문제 ${quizzes}문항)`);
  console.log(`   · 404.html 1개 (색인 제외 — robots=noindex)`);
  console.log(
    `   · assets/site.css ${(siteCss.length / 1024).toFixed(1)}KB ` +
      `(최소화 ${(CSS.length / 1024).toFixed(1)}KB → ${(100 * (1 - siteCss.length / CSS.length)).toFixed(0)}% 감소)` +
      ` · 정적 페이지 ${pagesWithSharedCss}개가 함께 사용 (중복 ${((CSS.length * pagesWithSharedCss) / 1024 / 1024).toFixed(1)}MB → ${(
        siteCss.length / 1024
      ).toFixed(1)}KB)`,
  );
  console.log(`   · sitemap.xml 갱신 (lastmod ${lastmod})`);
}

main();
