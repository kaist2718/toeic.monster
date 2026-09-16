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
 *   정적 페이지는 124개인데 모두 같은 스타일을 씁니다. 페이지마다 인라인으로 넣으면
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

/** 단계별 회화 교재 데이터 파일 — 문법 교재와 나란한 구조를 씁니다(conversation/ 페이지). */
const CONVERSATION_FILES = [
  "data/conversation-basic.js",
  "data/conversation-intermediate.js",
  "data/conversation-advanced.js",
];

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
  for (const file of ["data/idioms.js", "data/extra.js", GRAMMAR_FILES, CONVERSATION_FILES].flat()) {
    vm.runInContext(read(file), sandbox, { filename: file, timeout: 5000 });
  }
  const vocab = sandbox.window.VOCAB_UNITS || {};
  const idioms = sandbox.window.VOCAB_IDIOMS || [];
  const extra = sandbox.window.TOEIC_EXTRA || {};
  const grammar = sandbox.window.GRAMMAR_BOOKS || [];
  const conversation = sandbox.window.CONVERSATION_BOOKS || [];
  if (!Object.keys(vocab).length) throw new Error("어휘 데이터를 읽지 못했습니다.");
  if (!idioms.length) throw new Error("숙어 데이터를 읽지 못했습니다.");
  if (!grammar.length) throw new Error("문법 교재 데이터를 읽지 못했습니다.");
  if (!conversation.length) throw new Error("회화 교재 데이터를 읽지 못했습니다.");
  return { vocab, idioms, extra, grammar, conversation };
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
.toc a[aria-current="page"]{border-color:var(--primary-solid);background:var(--soft)}
.toc b{display:block;font-size:11.5px;color:var(--primary);letter-spacing:.3px;margin-bottom:3px}
.toc span{font-size:14px;font-weight:700}
/* 바로 가기(점프 목록)와 「맨 위로」 — 긴 목록 페이지에서 위로 되돌아가는 수고를 줄입니다.
   홈(앱)의 「섹션 메뉴」와 달리 자바스크립트 없이 열리는 <details> 라, 크롤러도 링크를 따라갈 수 있습니다. */
.jump{margin-top:24px}
.jump>summary{display:inline-flex;align-items:center;min-height:44px;font-weight:700;font-size:13.5px;color:var(--primary);background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 14px;cursor:pointer;list-style:none}
.jump>summary::-webkit-details-marker{display:none}
.jump>summary::after{content:"▾";margin-left:8px;font-size:11px}
.jump[open]>summary::after{content:"▴"}
.jump-body{padding:14px 0 0}
.totop{display:inline-flex;align-items:center;min-height:44px;padding:9px 12px;font-weight:700;font-size:13px;text-decoration:none}
.gram{margin:30px 0 0;padding-top:6px}
.gram-head{display:flex;align-items:baseline;gap:10px;border-bottom:2px solid var(--border);padding-bottom:8px;margin-bottom:10px}
.gram-no{flex:0 0 auto;background:var(--primary-solid);color:#fff;font-size:12px;font-weight:800;border-radius:6px;padding:3px 8px}
.gram-head h2{font-size:19px;color:var(--primary-dark);letter-spacing:-.3px}
.gram-sum{font-size:14px;color:var(--muted);margin:6px 0 16px}
/* 교재 과 이동 — 과 끝의 이동 링크와, 스크롤해도 남는 현재 과 바 */
.chnav{display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between;align-items:center;margin-top:16px;padding-top:10px;border-top:1px dashed var(--border);font-size:13px;font-weight:700}
.chnav a{text-decoration:none}
.chnav a:hover{text-decoration:underline}
.chnav .up{color:var(--muted)}
.chnav .prev{color:var(--primary)}
.chnav .next{color:var(--primary)}
.chbar{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:40;display:flex;gap:4px;align-items:center;max-width:min(560px,calc(100vw - 20px));background:var(--card);border:1px solid var(--border);border-radius:999px;box-shadow:0 8px 22px rgba(0,0,0,.18);padding:5px 8px;font-size:12.5px}
.chbar[hidden]{display:none}
.chbar a{display:block;text-decoration:none;padding:7px 9px;border-radius:999px;font-weight:700;color:var(--text);white-space:nowrap}
.chbar a:hover{background:var(--soft);color:var(--primary)}
.chbar-cur{flex:1 1 auto;min-width:0;text-align:center;font-weight:800;color:var(--primary-dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
@media print{header.bar,footer.ft,.pager,.jump,.totop,.chbar,.chnav,.cta,.cheat-card a{display:none}body{background:#fff}.wrap{max-width:none;padding:0}.cheat-grid{grid-template-columns:1fr 1fr}.cheat-card{border-color:#bbb;page-break-inside:avoid}}
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

/**
 * 교재 페이지(문법·회화)에 붙는 「현재 과」 바.
 *
 * 12과가 한 페이지에 이어지는 탓에 페이지가 77KB까지 커져서, 7과를 읽는 중에
 * 6과로 돌아가려면 10화면을 거슬러 올라가야 했습니다(맨 위 목차까지 스크롤).
 * 스크롤 위치를 따라 현재 과와 목차·다음 과 링크를 띄웁니다.
 * 자바스크립트가 없으면 바는 hidden 그대로 남고, 각 과 끝의 .chnav 링크로 이동할 수 있습니다.
 */
const CHAPTER_BAR = `<nav class="chbar" id="chBar" aria-label="현재 과 이동" hidden>
  <a href="#toc">🗂 목차</a>
  <span class="chbar-cur" id="chBarCur"></span>
  <a id="chBarNext" href="#toc" hidden>다음 과 →</a>
</nav>
<script>
  (function () {
    var bar = document.getElementById("chBar");
    if (!bar || !("IntersectionObserver" in window)) return;
    var cur = document.getElementById("chBarCur");
    var next = document.getElementById("chBarNext");
    var secs = [].slice.call(document.querySelectorAll("section.gram[id]"));
    if (!secs.length) return;
    var pager = document.querySelector(".pager");
    var inChapter = false;
    var atEnd = false;
    function sync() { bar.hidden = !(inChapter && !atEnd); }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        var no = en.target.querySelector(".gram-no");
        var h = en.target.querySelector("h2");
        cur.textContent = (no ? no.textContent : "") + (h ? " " + h.textContent : "");
        var nx = secs[i + 1];
        next.hidden = !nx;
        if (nx) {
          next.href = "#" + nx.id;
          next.textContent = "다음 과 →";
        }
        inChapter = true;
        sync();
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (s) { io.observe(s); });
    // 페이지 끝 pager 가 보이면 같은 링크가 이미 화면에 있으니 바를 내립니다.
    if (pager) {
      new IntersectionObserver(function (entries) {
        atEnd = entries.some(function (en) { return en.isIntersecting; });
        sync();
      }, { rootMargin: "0px 0px -15% 0px" }).observe(pager);
    }
  })();
</script>`;

function page({ title, description, canonical, ld, body, footerNav, speak, chapterBar }) {
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
<!-- 공용 스타일·스크립트 — 124개 정적 페이지가 한 파일을 함께 받아 씁니다(서비스워커가 캐시). -->
<link rel="stylesheet" href="${ASSET_REL}site.css">${speak ? `\n<script defer src="${ASSET_REL}speak.js"><\/script>` : ""}
<link rel="icon" href="../icon.svg" type="image/svg+xml">
<link rel="icon" href="../icon-192.png" type="image/png" sizes="192x192">
<!-- iOS 홈 화면은 SVG 아이콘을 쓰지 않으므로 PNG 를 따로 지정합니다(tools/make-icons.py 로 생성). -->
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<!-- 방문자 분석 (Umami Cloud — 쿠키 미사용, 개인정보 미수집). index.html 과 같은 웹사이트 ID 를 씁니다. -->
<link rel="preconnect" href="https://cloud.umami.is" crossorigin>
<script async defer src="https://cloud.umami.is/script.js" data-website-id="04c3b8cf-c418-4a70-8549-9f21e09b8cbf"><\/script>
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
<body id="top">
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
    ${footerNav || `<a href="../">홈</a><a href="./">주제별 단어장</a><a href="idioms.html">빈출 구동사·숙어</a><a href="../grammar/">문법 교재</a><a href="../conversation/">회화 교재</a><a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>`}
  </nav>
  <p>👾 toeic.monster · TOEIC 어휘 무료 학습 사이트 · 학습 기록은 브라우저에만 저장됩니다</p>
</footer>
<div class="wrap"><a class="totop" href="#top">↑ 맨 위로</a></div>
${chapterBar ? CHAPTER_BAR + "\n" : ""}</body>
</html>
`;
}

/**
 * 예문 듣기 버튼 스크립트는 이제 공용 파일(assets/speak.js)로 분리했습니다.
 * 124개 페이지가 같은 2.3KB 를 각각 받지 않도록, 페이지는 defer 로 그 파일을 불러옵니다.
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

/**
 * 「다른 유닛으로 바로 가기」 — 단어장 페이지는 30개 유닛이 이어지는데
 * 허브로 돌아가야만 먼 유닛으로 갈 수 있었습니다. 접어 둔 목록으로 둡니다.
 * (과 페이지의 「다른 과」 목록과 같은 .toc 카드 모양을 씁니다.)
 */
function unitJumpList(units, currentId, summaryText) {
  const items = units
    .map((u) => {
      const now = u.id === currentId;
      return `    <li><a href="${unitPath(u.id)}"${now ? ' aria-current="page"' : ""}>
      <b>UNIT ${u.id} ${LEVEL_ICON[u.level] || "🟡"}${now ? " · 지금" : ""}</b>
      <span>${esc(u.title)}</span>
    </a></li>`;
    })
    .join("\n");
  return `
  <details class="jump">
    <summary>${summaryText || `🔢 다른 유닛으로 바로 가기 (${units.length}개)`}</summary>
    <div class="jump-body">
      <ul class="toc">
${items}
      </ul>
    </div>
  </details>`;
}

/**
 * 「다른 가이드로 바로 가기」 — 가이드 9편은 순서대로 읽는 코스라
 * 이전/다음 편만으로는 중간 편으로 건너뛰기 어렵습니다.
 */
function guideJumpList(guides, currentSlug) {
  const items = guides
    .map((g, i) => {
      const now = g.slug === currentSlug;
      return `    <li><a href="${g.slug}.html"${now ? ' aria-current="page"' : ""}>
      <b>${i + 1}편${now ? " · 지금" : ""}</b>
      <span>${esc(g.title.replace(/^TOEIC /, ""))}</span>
    </a></li>`;
    })
    .join("\n");
  return `
  <details class="jump">
    <summary>📕 다른 가이드로 바로 가기 (${guides.length}편)</summary>
    <div class="jump-body">
      <ul class="toc">
${items}
      </ul>
    </div>
  </details>`;
}

function buildUnitPage(u, words, prev, next, allUnits) {
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
  </nav>
${allUnits && allUnits.length ? unitJumpList(allUnits, u.id) : ""}`;

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

function buildIdiomsPage(idioms, units) {
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
  </nav>
${units && units.length ? unitJumpList(units, -1, `📚 단어장 유닛 바로 가기 (${units.length}개)`) : ""}`;

  return { file: "units/idioms.html", html: page({ title, description, canonical, ld, body }) };
}

/* ------------------------------------------------------------------ */
/* 6-2. 전략·공략 가이드 (data/extra.js)                                */
/* ------------------------------------------------------------------ */

const GUIDE_FOOTER =
  '<a href="../">홈</a><a href="../units/">주제별 단어장</a><a href="index.html">전략·공략 가이드</a>' +
  '<a href="../grammar/">문법 교재</a><a href="../conversation/">회화 교재</a>' +
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

function buildGuidePage(g, prev, next, guides) {
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

  // 가이드 9편은 순서대로 읽는 코스라, 유닛처럼 이전/다음 편으로 이어 볼 수 있게 합니다.
  // 제목이 모두 "TOEIC " 로 시작해서, pager 에서는 그 접두어를 떼어 짧게 보여 줍니다.
  const shortTitle = (t) => t.replace(/^TOEIC /, "");
  const guidePager = [
    prev ? `<a href="${prev.slug}.html">← ${esc(shortTitle(prev.title))}</a>` : `<span></span>`,
    `<a class="mid" href="./">📕 가이드 전체 보기</a>`,
    next ? `<a href="${next.slug}.html">${esc(shortTitle(next.title))} →</a>` : `<span></span>`,
  ].join("\n    ");

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
    ${guidePager}
  </nav>
${guides && guides.length ? guideJumpList(guides, g.slug) : ""}`;

  return { file: `guides/${g.slug}.html`, html: page({ title, description, canonical, ld, body, footerNav: GUIDE_FOOTER }) };
}

/* ------------------------------------------------------------------ */
/* 6-3. 단계별 문법 교재 (data/grammar-*.js)                            */
/* ------------------------------------------------------------------ */

const GRAMMAR_FOOTER =
  '<a href="../">홈</a><a href="../units/">주제별 단어장</a><a href="index.html">문법 교재</a>' +
  '<a href="../conversation/">회화 교재</a><a href="../guides/">전략·공략 가이드</a>' +
  '<a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>';

/** 과 번호에 붙는 앵커 id — 목차 링크와 감사(앵커 검증)가 함께 씁니다. */
const chapterAnchor = (no) => `ch-${String(no).padStart(2, "0")}`;

/** 두 자리 과 번호 — 화면 표기·앵커·파일 이름이 모두 이 규칙을 씁니다. */
const chapterNo = (no) => String(no).padStart(2, "0");

/** 과 목록에 쓰는 라벨. */
const chapterLabel = (ch) => `${chapterNo(ch.no)}과 ${ch.title}`;

/**
 * 낱개 과 페이지의 파일 이름 — `grammar/basic-01.html`.
 * 하위 폴더(`basic/01.html`) 대신 같은 폴더의 평범한 파일로 두는 이유:
 * 링크가 단순해지고, 생성물 검증(`tools/verify-generated.mjs`)이 디렉터리 한 단계만 훑어도 걸립니다.
 */
const chapterFile = (bookId, no) => `${bookId}-${chapterNo(no)}.html`;

/**
 * 과 끝에 붙는 이동 링크.
 *
 * 교재 한 권이 12과짜리 긴 페이지라, 과를 읽다가 위쪽 목차까지 되돌아가는 수고를 없앱니다.
 * (자바스크립트가 없어도 동작하는 기본 이동 수단이고, 스크롤 바는 이 링크를 대신합니다.)
 *
 * plan: { back: { href, label }, prev?, next? } — 책 페이지는 `↑ 목차` + 앵커,
 * 낱개 과 페이지는 `← 책 이름` + 이전/다음 과 페이지를 넣습니다.
 */
function chapterFooterNav(no, plan) {
  const links = [`      <a class="up" href="${plan.back.href}">${plan.back.label}</a>`];
  if (plan.prev) links.push(`      <a class="prev" href="${plan.prev.href}">← ${esc(plan.prev.label)}</a>`);
  if (plan.next) links.push(`      <a class="next" href="${plan.next.href}">${esc(plan.next.label)} →</a>`);
  return `
    <nav class="chnav" aria-label="${chapterNo(no)}과 이동">
${links.join("\n")}
    </nav>`;
}

/** 책 페이지(12과가 이어지는 긴 페이지)의 과 이동 — 위로 목차, 다음은 같은 페이지의 앵커. */
/**
 * 낱개 과 페이지 목록 — 책 페이지에서는 「과 하나씩 따로 보기」, 과 페이지에서는 「다른 과」.
 * currentNo 를 주면 그 과를 `aria-current` 로 표시합니다(지금 보는 과).
 */
function chapterLinkList(book, currentNo) {
  return book.chapters
    .map((c) => {
      const now = currentNo === c.no;
      const mark = now ? ' aria-current="page"' : "";
      return `    <li><a href="${chapterFile(book.id, c.no)}"${mark}>
      <b>${chapterNo(c.no)}과${now ? " · 지금" : ""}</b>
      <span>${esc(c.title)}</span>
    </a></li>`;
    })
    .join("\n");
}

function bookChapterNav(chapters) {
  return (c, i) =>
    chapterFooterNav(c.no, {
      back: { href: "#toc", label: "↑ 목차" },
      next: chapters[i + 1]
        ? { href: `#${chapterAnchor(chapters[i + 1].no)}`, label: chapterLabel(chapters[i + 1]) }
        : null,
    });
}

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
          // 제목에 단계명이 이미 들어 있어서("중급 영문법") level 을 앞에 또 붙이지 않습니다.
          name: `${b.title}`,
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

function grammarChapter(c, nav) {
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
${points}${mistakes}${practice}${nav}
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
    // 단계명은 이미 교재 제목에 들어 있어서("중급 영문법") 앞에 level 을 또 붙이면
    // "중급 중급 영문법" 처럼 같은 말이 겹쳤습니다. 제목만 씁니다.
    prev ? `<a href="${prev.id}.html">← ${esc(prev.title)}</a>` : `<span></span>`,
    `<a class="mid" href="./">📘 문법 교재 전체 보기</a>`,
    next ? `<a href="${next.id}.html">${esc(next.title)} →</a>` : `<span></span>`,
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

  <h2 class="sec" id="toc">목차</h2>
  <ul class="toc">
${toc}
  </ul>

${book.chapters.map((c, i, arr) => grammarChapter(c, bookChapterNav(arr)(c, i))).join("\n\n")}

  <h2 class="sec">🔗 과 하나씩 따로 보기</h2>
  <p class="lead">각 과에는 따로 열 수 있는 주소가 있습니다. 검색·공유로 특정 과를 바로 열 때 씁니다.</p>
  <ul class="toc">
${chapterLinkList(book)}
  </ul>

  <nav class="pager" aria-label="교재 이동">
    ${pager}
  </nav>`;

  return {
    file: `grammar/${book.id}.html`,
    // 교재 페이지에는 예문 듣기 버튼이 있어 공용 스크립트(assets/speak.js)가 필요합니다.
    html: page({ title, description, canonical, ld, body, footerNav: GRAMMAR_FOOTER, speak: true, chapterBar: true }),
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
/* 6-4. 단계별 회화 교재 (data/conversation-*.js)                        */
/*                                                                     */
/* 문법 교재와 나란한 구조를 그대로 씁니다. 한 과의 구성이 같아서      */
/* (표현 → 표 → 예문 → 주의 → 연습) 공용 스타일(book-cover·toc·gram·   */
/* gtable·gex·gmistake·gquiz)을 그대로 쓰고, 제목만 회화에 맞게 씁니다. */
/* 스타일을 한 번 더 구워 넣으면 같은 4KB 를 4개 페이지가 더 받습니다.  */
/* ------------------------------------------------------------------ */

const CONVERSATION_FOOTER =
  '<a href="../">홈</a><a href="../units/">주제별 단어장</a><a href="index.html">회화 교재</a>' +
  '<a href="../grammar/">문법 교재</a><a href="../guides/">전략·공략 가이드</a>' +
  '<a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>';

function buildConversationHub(books) {
  const canonical = `${SITE}/conversation/`;
  const totalCh = books.reduce((n, b) => n + b.chapters.length, 0);
  const totalQ = books.reduce(
    (n, b) => n + b.chapters.reduce((m, c) => m + (c.practice || []).length, 0),
    0,
  );
  const title = "영어회화 교재 3단계 — 초급·중급·고급 | toeic.monster";
  const description = `인사와 주문부터 협상·설득·갈등 완화까지, 초급·중급·고급 3단계 회화 교재 ${totalCh}과와 연습 문제 ${totalQ}문항을 상황별 표현·발음 안내와 함께 무료로 정리했습니다.`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "영어회화 교재 3단계 — 초급·중급·고급",
        description,
        url: canonical,
        inLanguage: "ko",
        isPartOf: { "@type": "WebSite", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "ItemList",
        name: "단계별 영어회화 교재",
        numberOfItems: books.length,
        itemListElement: books.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          // 제목에 단계명이 이미 들어 있어서("중급 영문법") level 을 앞에 또 붙이지 않습니다.
          name: `${b.title}`,
          url: `${SITE}/conversation/${b.id}.html`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "회화 교재", item: canonical },
        ],
      },
    ],
  });

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <span>회화 교재</span>
  </nav>

  <h1>영어회화 교재 3단계 — 초급·중급·고급</h1>
  <p class="lead">${esc(description)}</p>
  <a class="cta" href="../">🃏 단어·퀴즈로 바로 학습하기</a>
  <a class="cta" href="../grammar/">📘 문법 교재 보기</a>

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
    <li><span class="w-mean">초급에서 인사·주문·길 묻기처럼 상황을 버티는 표현을 먼저 익힙니다.</span></li>
    <li><span class="w-mean">중급에서 의견·조율·협상처럼 내 생각을 전달하는 표현으로 넓힙니다.</span></li>
    <li><span class="w-mean">고급에서 완곡 표현·책임 범위·갈등 완화처럼 말의 온도를 조절합니다.</span></li>
  </ol>

  <h2 class="sec">이 교재를 만든 기준</h2>
  <p class="lead">회화 교재는 <b>어떤 상황을 배우는지</b>를 먼저 정하고, <b>어디까지 말할 수 있는지</b>를 CEFR 로 표시했습니다. 난이도만 있으면 어디서 시작할지 몰라 헤매고, 상황만 있으면 내 수준에 맞는지 가늠할 수 없기 때문입니다.</p>
  <ol class="words">
    <li><span class="w-mean">축은 문법 항목이 아니라 <b>상황(기능)</b> 입니다. "현재완료를 배운다"보다 "카페에서 주문한다"를 먼저 찾기 때문에, 과 제목을 인사·주문·길 묻기·협상처럼 실제로 겪는 장면으로 잡았습니다.</span></li>
    <li><span class="w-mean">단계는 <b>초급 A1~A2 · 중급 B1~B2 · 고급 C1</b> 세 가지로 고정하고 CEFR 을 함께 적었습니다. 문법 교재와 같은 이름·같은 표기를 써서 두 교재를 나란히 오갈 수 있습니다.</span></li>
    <li><span class="w-mean">한 과는 <b>상황 요약 → 표현 표 → 예문 → 흔한 실수 → 연습 문제</b> 순서입니다. 예문마다 🔊 를 붙여 눈으로만 읽지 않고 소리로 확인하게 했습니다.</span></li>
    <li><span class="w-mean">이 구성은 <b>British Council LearnEnglish</b>(CEFR 6단계), <b>VOA Let's Learn English</b>(2단계), <b>ELLLO</b>(레벨별 레슨과 퀴즈), <b>BBC Learning English</b>(단원 단위)의 단계 구성을 조사해 세 단계로 정리한 것입니다.</span></li>
  </ol>`;

  return { file: "conversation/index.html", html: page({ title, description, canonical, ld, body, footerNav: CONVERSATION_FOOTER }) };
}

function conversationPoint(p) {
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

function conversationChapter(c, nav) {
  const points = (c.points || []).map(conversationPoint).join("\n");
  const mistakes = (c.mistakes || []).length
    ? `\n    <div class="gmistake">
      <h3>⚠️ 한국어 화자가 자주 하는 실수</h3>
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
${points}${mistakes}${practice}${nav}
  </section>`;
}

function buildConversationBook(book, books) {
  const canonical = `${SITE}/conversation/${book.id}.html`;
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
        learningResourceType: "영어회화 교재",
        educationalUse: "self-study",
        educationalLevel: book.cefr,
        teaches: book.chapters.map((c) => c.title),
        isPartOf: { "@type": "CollectionPage", name: "영어회화 교재 3단계", url: `${SITE}/conversation/` },
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "회화 교재", item: `${SITE}/conversation/` },
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
    // 단계명은 이미 교재 제목에 들어 있어서("중급 영문법") 앞에 level 을 또 붙이면
    // "중급 중급 영문법" 처럼 같은 말이 겹쳤습니다. 제목만 씁니다.
    prev ? `<a href="${prev.id}.html">← ${esc(prev.title)}</a>` : `<span></span>`,
    `<a class="mid" href="./">🗣️ 회화 교재 전체 보기</a>`,
    next ? `<a href="${next.id}.html">${esc(next.title)} →</a>` : `<span></span>`,
  ].join("\n    ");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">회화 교재</a> › <span>${esc(book.title)}</span>
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
    <h2>이렇게 연습하세요</h2>
    <ul>${(book.howto || []).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
  </div>

  <a class="cta" href="../">🔊 발음 들으며 단어 학습하기</a>
  <p class="lead">🔊 를 누르면 예문 발음을 들을 수 있습니다(앱에서 고른 목소리·속도를 그대로 사용).</p>

  <h2 class="sec" id="toc">목차</h2>
  <ul class="toc">
${toc}
  </ul>

${book.chapters.map((c, i, arr) => conversationChapter(c, bookChapterNav(arr)(c, i))).join("\n\n")}

  <h2 class="sec">🔗 과 하나씩 따로 보기</h2>
  <p class="lead">각 과에는 따로 열 수 있는 주소가 있습니다. 검색·공유로 특정 과를 바로 열 때 씁니다.</p>
  <ul class="toc">
${chapterLinkList(book)}
  </ul>

  <nav class="pager" aria-label="교재 이동">
    ${pager}
  </nav>`;

  return {
    file: `conversation/${book.id}.html`,
    // 회화 교재도 예문 듣기 버튼이 있어 공용 스크립트(assets/speak.js)가 필요합니다.
    html: page({ title, description, canonical, ld, body, footerNav: CONVERSATION_FOOTER, speak: true, chapterBar: true }),
  };
}

/* ------------------------------------------------------------------ */
/* 6-5. 낱개 과 페이지 (검색·공유용 주소)                               */
/* ------------------------------------------------------------------ */

/**
 * 과 하나만 따로 보는 페이지 — `grammar/basic-01.html`.
 *
 * 책 페이지는 12과가 이어지는 한 문서(77KB)라서 “이 과”를 가리키는 주소가 없었습니다.
 * 검색으로 들어오거나 링크를 공유할 때 쓸 수 있게 과 단위 URL 을 함께 만듭니다.
 * 책 페이지는 그대로 두고(연속 읽기 흐름 보존), 두 페이지가 서로를 링크합니다.
 */
function buildChapterPage(kind, book, chapter, books) {
  const isGrammar = kind === "grammar";
  const dir = isGrammar ? "grammar" : "conversation";
  const sectionName = isGrammar ? "문법 교재" : "회화 교재";
  const buildSection = isGrammar ? grammarChapter : conversationChapter;
  const file = `${dir}/${chapterFile(book.id, chapter.no)}`;
  const canonical = `${SITE}/${file}`;
  const bookFile = `${book.id}.html`;
  const idx = book.chapters.findIndex((c) => c.no === chapter.no);
  const prev = book.chapters[idx - 1];
  const next = book.chapters[idx + 1];
  // 책을 끝까지 읽었을 때 다음 단계로, 두 번째 책부터는 앞 단계 마지막 과로 이어 줍니다.
  const bookIdx = books.findIndex((b) => b.id === book.id);
  const nextBook = books[bookIdx + 1] || null;
  const prevBook = books[bookIdx - 1] || null;
  const crossBook = [];
  if (!prev && prevBook) {
    const last = prevBook.chapters[prevBook.chapters.length - 1];
    crossBook.push(
      `  <a class="cta" href="${chapterFile(prevBook.id, last.no)}">← ${esc(prevBook.title)} 마지막 과 보기</a>`,
    );
  }
  if (!next && nextBook) {
    crossBook.push(`  <a class="cta" href="${chapterFile(nextBook.id, 1)}">${esc(nextBook.title)} 첫 과 보기 →</a>`);
  }
  const label = chapterLabel(chapter);
  const title = `${label} — ${book.title} | toeic.monster`;
  // meta description 은 40~170자를 권장합니다(audit:site 가 검사).
  // 요약이 짧은 과는 책·과 정보를 덧붙여 너무 짧은 설명이 되지 않게 합니다.
  const quizN = (chapter.practice || []).length;
  const description =
    chapter.summary.length >= 60
      ? chapter.summary
      : `${chapter.summary} ${book.title} ${chapterNo(chapter.no)}과${quizN ? ` · 연습 ${quizN}문항` : ""}`;

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `${label} — ${book.title}`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: isGrammar ? "문법 교재" : "영어회화 교재",
        educationalUse: "self-study",
        educationalLevel: book.cefr,
        position: chapter.no,
        isPartOf: { "@type": "Book", name: book.title, url: `${SITE}/${dir}/${bookFile}` },
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: sectionName, item: `${SITE}/${dir}/` },
          { "@type": "ListItem", position: 3, name: book.title, item: `${SITE}/${dir}/${bookFile}` },
          { "@type": "ListItem", position: 4, name: label, item: canonical },
        ],
      },
    ],
  });

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">${sectionName}</a> › <a href="${bookFile}">${esc(book.title)}</a> › <span>${esc(label)}</span>
  </nav>

  <h1>${esc(label)}<span class="lvl ${LEVEL_CLASS[book.level] || "lvl-mid"}">${LEVEL_ICON[book.level] || "🟡"} ${esc(book.level)}</span></h1>
  <p class="lead">${esc(book.title)} · CEFR ${esc(book.cefr || "")} · 총 ${book.chapters.length}과 중 ${chapter.no}번째</p>
  <p class="lead">책 전체를 순서대로 보려면 <a href="${bookFile}">${esc(book.title)}</a>, 같은 자리로 바로 가려면 <a href="${bookFile}#${chapterAnchor(chapter.no)}">책 페이지의 이 과</a>를 쓰세요.</p>

${buildSection(
    chapter,
    chapterFooterNav(chapter.no, {
      back: { href: bookFile, label: `← ${esc(book.title)} 전체` },
      prev: prev ? { href: chapterFile(book.id, prev.no), label: chapterLabel(prev) } : null,
      next: next ? { href: chapterFile(book.id, next.no), label: chapterLabel(next) } : null,
    }),
  )}

${isGrammar ? `  <a class="cta" href="../index.html?level=${book.id}&ch=${chapter.no}#grammar-quiz">✏️ 앱에서 이 과 문제 풀기</a>\n` : ""}${crossBook.join("\n")}${crossBook.length ? "\n" : ""}
  <h2 class="sec">🗂 ${esc(book.title)}의 다른 과</h2>
  <p class="lead">과를 옮기면 책 페이지의 해당 위치로도 바로 갈 수 있습니다.</p>
  <ul class="toc">
${chapterLinkList(book, chapter.no)}
  </ul>`;

  return {
    file,
    html: page({
      title,
      description,
      canonical,
      ld,
      body,
      footerNav: isGrammar ? GRAMMAR_FOOTER : CONVERSATION_FOOTER,
      speak: true,
    }),
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
  ["/conversation/", "영어회화 교재", "초급·중급·고급 3단계 + 연습 108문항"],
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
<!-- 방문자 분석 (Umami Cloud — 쿠키 미사용, 개인정보 미수집). index.html 과 같은 웹사이트 ID 를 씁니다. -->
<link rel="preconnect" href="https://cloud.umami.is" crossorigin>
<script async defer src="https://cloud.umami.is/script.js" data-website-id="04c3b8cf-c418-4a70-8549-9f21e09b8cbf"><\/script>
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

function buildSitemap(units, lastmod, guides, grammar, conversation) {
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
    grammar.forEach((b) => {
      add(`${SITE}/grammar/${b.id}.html`, "monthly", "0.8");
      // 낱개 과 페이지 — 책 안의 한 과를 직접 가리키는 주소(검색 유입·공유용).
      (b.chapters || []).forEach((c) => add(`${SITE}/grammar/${chapterFile(b.id, c.no)}`, "monthly", "0.6"));
    });
    add(`${SITE}/grammar/cheatsheet.html`, "monthly", "0.7");
  }
  if (conversation && conversation.length) {
    add(`${SITE}/conversation/`, "monthly", "0.8");
    conversation.forEach((b) => {
      add(`${SITE}/conversation/${b.id}.html`, "monthly", "0.8");
      (b.chapters || []).forEach((c) => add(`${SITE}/conversation/${chapterFile(b.id, c.no)}`, "monthly", "0.6"));
    });
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
  const { vocab, idioms, extra, grammar, conversation } = loadVocab();
  const guides = Array.isArray(extra.guides) ? extra.guides : [];
  const lastmod = lastModified();

  const units = meta
    .filter((u) => Array.isArray(vocab[u.id]) && vocab[u.id].length)
    .sort((a, b) => a.id - b.id)
    .map((u) => ({ ...u, words: vocab[u.id] }));

  const missing = meta.length - units.length;
  if (missing > 0) console.warn(`⚠️  단어 데이터가 없는 유닛 ${missing}개는 건너뜁니다.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 공용 스타일 — 정적 페이지 124개가 이 한 파일을 함께 받아 씁니다.
  // (페이지마다 인라인으로 넣으면 같은 내용을 43번 다시 받게 됩니다.)
  const siteCss = minifyCss(CSS);
  write("assets/site.css", siteCss);

  let written = 0;
  let chapterPages = 0;
  units.forEach((u, i) => {
    const { file, html } = buildUnitPage(u, u.words, units[i - 1], units[i + 1], units);
    write(file, html);
    written++;
  });

  const hub = buildHubPage(units);
  const idiomsPage = buildIdiomsPage(idioms, units);
  write(hub.file, hub.html);
  write(idiomsPage.file, idiomsPage.html);

  guides.forEach((g, i) => {
    const gp = buildGuidePage(g, guides[i - 1], guides[i + 1], guides);
    write(gp.file, gp.html);
  });
  if (guides.length) {
    const gh = buildGuidesHub(guides);
    write(gh.file, gh.html);
  }

  grammar.forEach((b) => {
    const gp = buildGrammarBook(b, grammar);
    write(gp.file, gp.html);
    b.chapters.forEach((c) => {
      const cp = buildChapterPage("grammar", b, c, grammar);
      write(cp.file, cp.html);
      chapterPages++;
    });
  });
  if (grammar.length) {
    const gh = buildGrammarHub(grammar);
    write(gh.file, gh.html);
    const cs = buildGrammarCheatsheet(grammar);
    write(cs.file, cs.html);
  }

  conversation.forEach((b) => {
    const cp = buildConversationBook(b, conversation);
    write(cp.file, cp.html);
    b.chapters.forEach((c) => {
      const chap = buildChapterPage("conversation", b, c, conversation);
      write(chap.file, chap.html);
      chapterPages++;
    });
  });
  if (conversation.length) {
    const ch = buildConversationHub(conversation);
    write(ch.file, ch.html);
  }

  // 404 는 색인 대상이 아니므로 사이트맵에 넣지 않습니다(noindex).
  write("404.html", build404Page());
  write("sitemap.xml", buildSitemap(units, lastmod, guides, grammar, conversation));

  const words = units.reduce((n, u) => n + u.words.length, 0);
  const chapters = grammar.reduce((n, b) => n + b.chapters.length, 0);
  const quizzes = grammar.reduce((n, b) => n + b.chapters.reduce((m, c) => m + (c.practice || []).length, 0), 0);
  console.log(`✅ 정적 페이지 생성 완료`);
  console.log(`   · 유닛 페이지 ${written}개 (단어 ${words.toLocaleString("en-US")}개)`);
  console.log(`   · 허브 1개 · 숙어 페이지 1개 (숙어 ${idioms.length}개)`);
  console.log(`   · 가이드 페이지 ${guides.length}개 + 허브 1개`);
  console.log(`   · 문법 교재 ${grammar.length}권 + 허브 1개 + 한 장 요약 (${chapters}과 · 연습 문제 ${quizzes}문항)`);
  const convChapters = conversation.reduce((n, b) => n + b.chapters.length, 0);
  const convQuizzes = conversation.reduce((n, b) => n + b.chapters.reduce((m, c) => m + (c.practice || []).length, 0), 0);
  console.log(`   · 회화 교재 ${conversation.length}권 + 허브 1개 (${convChapters}과 · 연습 문제 ${convQuizzes}문항)`);
  console.log(`   · 낱개 과 페이지 ${chapterPages}개 (검색·공유용 주소 · 사이트맵 포함)`);
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
