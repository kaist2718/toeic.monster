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
 *   정적 페이지는 모두 같은 스타일을 씁니다. 페이지마다 인라인으로 넣으면
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
import { readAppSource } from "./app-source.mjs";

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

/** 앱 소스(index.html + assets/app.js) 안의 `var UNITS = [ ... ];` 배열을 그대로 평가해서 가져온다. */
function loadUnitMeta() {
  const { code } = readAppSource();
  const start = code.indexOf("var UNITS = [");
  if (start === -1) throw new Error("앱 소스에서 UNITS 배열을 찾지 못했습니다.");
  const end = code.indexOf("];", start);
  if (end === -1) throw new Error("UNITS 배열의 끝을 찾지 못했습니다.");
  const src = code.slice(start, end + 2);
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
  // 홈 앱의 데이터(혼동 어휘·어근 등)도 함께 읽습니다 — 정적 페이지가 같은 값을 써야 화면과 어긋나지 않습니다.
  for (const file of ["data/idioms.js", "data/extra.js", "data/app-data.js", GRAMMAR_FILES, CONVERSATION_FILES].flat()) {
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
  // CONFUSABLES 는 app-data.js 의 최상위 var 라 샌드박스 전역으로 올라옵니다.
  const confusables = sandbox.CONFUSABLES || [];
  return { vocab, idioms, extra, grammar, conversation, confusables };
}

/** 데이터가 마지막으로 바뀐 날짜(git 기준). 재실행 시 결과가 같도록 고정값을 쓴다. */
function lastModified() {
  if (process.env.BUILD_DATE) return process.env.BUILD_DATE;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", "data", "index.html", "assets/app.js"], {
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
/* 본문 서체 — Pretendard Variable 서브셋(자체 호스팅). index.html 의 assets/app.css 와 같은 파일을 씁니다.
   주소는 이 CSS 파일 기준 상대 경로라, 어느 깊이의 페이지에서 불러도 /assets/fonts/… 로 풀립니다.
   만드는 도구·근거는 tools/make-font-subset.py 참고(주석은 minify 단계에서 지워집니다 — 원본에만 남습니다). */
@font-face{font-family:"Pretendard Variable";src:url("fonts/pretendard-variable.woff2") format("woff2-variations"),url("fonts/pretendard-variable.woff2") format("woff2");font-weight:45 920;font-style:normal;font-display:swap}
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
/* 빈도순 어휘 페이지 — 구간 이동 칩과 구간 제목, 문답 블록(.qa). */
.freq-jump{margin:8px 0 6px;font-size:13px;color:var(--muted)}
.freq-jump a{display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border:1px solid var(--border);border-radius:999px;text-decoration:none;color:var(--primary);background:var(--card);font-weight:700}
.freq-jump a:hover{border-color:var(--primary)}
.freq-range{font-size:14px;color:var(--muted);margin:22px 0 8px;letter-spacing:.2px}
/* 가이드 도입 문단 — 목록(.lead)보다 읽기 편한 본문 폭으로 둡니다. */
.g-intro{font-size:14.5px;line-height:1.8;margin:10px 0 14px;color:var(--text)}
/* 혼동 어휘 카드 — 앱(assets/app.css)과 같은 모양을 공용 변수로 다시 씁니다(토큰 이름이 일부 다릅니다). */
.confuse-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:12px;margin-top:6px}
.confuse-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px}
.confuse-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.confuse-pair{font-size:15.5px;font-weight:800;color:var(--primary-dark);word-break:keep-all}
.confuse-tag{font-size:11px;font-weight:800;color:var(--cyan);background:var(--soft);border-radius:99px;padding:2px 8px}
.confuse-row{margin-top:9px;font-size:13px;line-height:1.5}
.confuse-en{font-style:italic;color:var(--ex-text)}
.confuse-ko{color:var(--muted);font-size:12.5px}
.confuse-tip{margin-top:10px;font-size:12px;background:var(--soft);border-radius:8px;padding:8px 10px;color:var(--muted)}
.qa h3{font-size:15px;margin:16px 0 4px;color:var(--text)}
.qa p{font-size:14px;color:var(--text);margin-bottom:4px}
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
/* 본문 바로가기 — 정적 페이지는 상단바(사이트명·설명)가 앞에 있어, 키보드 사용자가
   페이지마다 Tab 을 여러 번 눌러야 본문에 닿습니다. 첫 Tab 에서 나타나게 합니다.
   평소에는 화면 밖(left:-9999px)에 두어 레이아웃을 건드리지 않습니다. */
.skip-link{position:absolute;left:-9999px;top:0;z-index:100;background:var(--primary-solid);color:#fff;padding:10px 16px;border-radius:0 0 8px 0;font-size:14px;font-weight:700;text-decoration:none}
.skip-link:focus{left:0}
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
<!-- 본문 서체 — Pretendard Variable 서브셋(자체 호스팅 · @font-face 는 site.css).
     CDN dynamic subset 을 쓸 땐 페이지마다 조각을 20~39개 받았습니다. 지금은 사이트 글자만 담은
     파일 하나(약 195KB)를 우리 도메인에서 받고, 그 파일은 서비스워커가 캐시합니다.
     crossorigin 은 같은 출처여도 필요한 속성입니다 — 없으면 브라우저가 두 번 받습니다. -->
<link rel="preload" as="font" type="font/woff2" href="${ASSET_REL}fonts/pretendard-variable.woff2" crossorigin>
<!-- 공용 스타일·스크립트 — 모든 정적 페이지가 한 파일을 함께 받아 씁니다(서비스워커가 캐시). -->
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
<a class="skip-link" href="#main">본문으로 바로가기</a>
<header class="bar">
  <div class="wrap">
    <a href="../">toeic.monster</a>
    <small>발음·예문으로 외우는 TOEIC 필수 어휘 1,000</small>
  </div>
</header>
<main class="wrap" id="main">
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
 * 페이지가 같은 2.3KB 를 각각 받지 않도록, 페이지는 defer 로 그 파일을 불러옵니다.
 */
/** 📘 버튼을 예문 옆에 붙입니다(듣기 대상 문장은 data-say 에 담습니다). */
function speakBtn(text) {
  // 같은 문장이 여러 번 나오므로, 낭독기에서 어떤 문장인지 구분되도록 문장을 라벨에 넣습니다.
  return ` <button type="button" class="gex-speak" data-say="${esc(text)}" aria-label="예문 듣기: ${esc(text)}" title="예문 듣기">🔊</button>`;
}

/**
 * 문답 블록 — 허브·가이드가 함께 씁니다.
 * 화면에 보이는 문장과 구조화 데이터(FAQPage)가 반드시 같아야 해서(어긋나면 검색엔진이 무시합니다),
 * 문답은 한 곳에만 적고 두 곳에서 같은 값을 씁니다.
 */
const faqSection = (faq) =>
  faq && faq.length
    ? `  <h2 class="sec">자주 묻는 질문</h2>\n  <div class="qa">\n${faq
        .map((f) => `  <h3>${esc(f.q)}</h3>\n  <p>${esc(f.a)}</p>`)
        .join("\n")}\n  </div>\n\n`
    : "";

const faqNodes = (faq) =>
  faq && faq.length
    ? [
        {
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ]
    : [];

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

/** 주제별 단어장 허브의 문답 — 화면과 구조화 데이터가 함께 씁니다. */
const FAQ_UNITS = [
  {
    q: "유닛은 어떤 순서로 보면 좋나요?",
    a: "처음이라면 UNIT 1부터 순서대로 보세요. 쉬운 주제에서 어려운 주제로 이어지도록 배열했고, 앞 유닛의 단어가 뒤 유닛 예문에 다시 나오도록 만들었습니다.",
  },
  {
    q: "단어 1,000개를 다 외워야 하나요?",
    a: "전부 외우기보다 시험에 자주 나오는 단어를 먼저 굳히는 편이 효율적입니다. 빈출 어휘 200선으로 우선순위를 잡고, 유닛은 주제를 넓히는 용도로 쓰세요.",
  },
  {
    q: "발음기호를 몰라도 공부할 수 있나요?",
    a: "한글 발음을 함께 적어 두었으니 괜찮습니다. 다만 듣기 점수까지 올리려면 발음기호를 나란히 보며 소리 내어 읽는 편이 좋습니다.",
  },
  {
    q: "학습 기록은 어디에 저장되나요?",
    a: "외운 표시와 진행률은 브라우저 저장소에만 남습니다. 서버로 보내지 않아 로그인이 필요 없고, 브라우저 기록을 지우면 함께 초기화됩니다.",
  },
];

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
      ...faqNodes(FAQ_UNITS),
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

  <p class="g-intro">유닛은 시험에 자주 나오는 <b>상황과 주제</b>를 축으로 나눴습니다. 한 유닛에 단어 30여 개와 예문·해석을 담았고, 앞 유닛에서 배운 단어가 뒤 유닛 예문에 다시 나오도록 엮어 두었습니다. 하루 한 유닛씩 30일이면 1,000단어를 한 번 도는 셈입니다.</p>

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

${faqSection(FAQ_UNITS)}  <h2 class="sec">함께 보면 좋은 자료</h2>
  <ul class="unitlist">
    <li><a href="frequency.html">
      <b>빈출 어휘</b>
      <span>📈 빈도순 기출 어휘 200선</span>
      <em>무엇부터 외울지 순서 잡기</em>
    </a></li>
    <li><a href="confusion.html">
      <b>혼동 어휘</b>
      <span>⚠️ 헷갈리는 단어 20쌍</span>
      <em>철자·뜻 비교와 예문</em>
    </a></li>
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
/* 6-1b. 빈도순 기출 어휘 (data/extra.js frequency)                     */
/* ------------------------------------------------------------------ */

/**
 * 빈도순 기출 어휘 200선 — 홈에 프리렌더로 심던 200개 목록을 별도 페이지로 옮겼습니다
 * (docs/prerender-split-plan.md 1단계 · 2026-09-18).
 *
 * 왜 페이지로 옮겼나:
 *   홈 index.html 의 프리렌더 마크업 중 혼자 48.6KB(가장 큼)를 차지했는데, 성격은
 *   "참고 목록"이라 홈의 도구 섹션들과 달리 **검색 없이도 끝까지 읽히는** 자료입니다.
 *   그래서 이 페이지가 전체 200개를 담고, 홈에는 상위 20개와 이 페이지로 가는 링크만 둡니다.
 */
function buildFrequencyPage(freq, units) {
  const canonical = `${SITE}/units/frequency.html`;
  const n = freq.length;
  const title = `TOEIC 빈출 어휘 ${n}선 — 빈도순 필수 단어 목록 | toeic.monster`;
  const description =
    `토익에 반복 출제되는 어휘 ${n}개를 빈도순으로 정리했습니다. ` +
    "단어·품사·뜻을 한 줄씩 확인하며 앞에서부터 외우고, 발음 버튼으로 소리까지 들어 보세요.";

  // 화면과 구조화 데이터가 같은 문답을 쓰도록 한 곳에서 만듭니다(둘이 어긋나면 검색엔진이 신뢰하지 않습니다).
  const FAQ = [
    {
      q: "빈도순은 어떤 기준으로 정렬한 건가요?",
      a:
        "시험에 반복 출제되는 순서를 감각적으로 묶은 " +
        `학습 우선순위입니다. 통계 코퍼스의 정확한 순위표가 아니라 "먼저 외우면 이득인 순서"이고, 상위 구간일수록 Part 5·6·7에서 만날 확률이 높습니다.`,
    },
    {
      q: `이 ${n}개만 외우면 되나요?`,
      a:
        `아닙니다. 이 목록은 "무엇부터"를 정하는 우선순위이고, 수량은 주제별 단어장(1,000개)이 담당합니다. ` +
        "여기서 200개를 끝낸 뒤 주제별 단어장으로 넓히면 같은 단어를 여러 맥락에서 다시 만나게 됩니다.",
    },
    {
      q: "며칠에 걸쳐 외우는 게 좋은가요?",
      a:
        "하루 20개씩 열흘을 권합니다. 소리 내어 세 번 읽고 품사·뜻을 확인한 뒤, " +
        "이튿날에는 앞 구간을 먼저 훑고 새 구간으로 넘어가세요(3일·7일 간격 복습이면 더 좋습니다).",
    },
    {
      q: "홈에서 보던 목록과 같은 건가요?",
      a: "같은 목록입니다. 홈에는 상위 20개만 보여 주고, 전체 200개는 이 페이지가 담당합니다.",
    },
    {
      q: "발음은 어떻게 듣나요?",
      a:
        "각 단어 옆의 🔊 버튼을 누르면 브라우저가 읽어 줍니다(별도 음원 파일을 내려받지 않아 데이터를 쓰지 않습니다). " +
        "Part 2·3 듣기 점수는 결국 발음이 귀에 익었는지의 문제라, 눈으로만 읽지 말고 소리 내어 따라 읽어 보세요.",
    },
  ];

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `TOEIC 빈출 어휘 ${n}선`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "어휘 목록",
        educationalUse: "self-study",
        numberOfItems: n,
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        // 목록 전체를 구조화 데이터로 알립니다 — 개수는 ${n}개, 항목은 상위 50개만 적습니다
        // (200개를 모두 적으면 블록만 15KB 를 넘어 첫 화면을 해칩니다).
        "@type": "ItemList",
        name: `TOEIC 빈출 어휘 ${n}선 (빈도순)`,
        numberOfItems: n,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: freq.slice(0, 50).map((w, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: w[0],
          description: `${w[2]} · ${w[1]}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "주제별 단어장", item: `${SITE}/units/` },
          { "@type": "ListItem", position: 3, name: `빈출 어휘 ${n}선`, item: canonical },
        ],
      },
    ],
  });

  const bullet = (text) => `    <li><span class="w-mean">${text}</span></li>`;
  const bullets = (list) => `  <ol class="words">\n${list.map(bullet).join("\n")}\n  </ol>`;

  // 50개씩 끊어 네 구간으로 나눕니다 — 한 덩어리로 두면 200번째 단어 찾기가 어렵습니다.
  const groups = [];
  for (let start = 0; start < n; start += 50) {
    const end = Math.min(start + 50, n);
    const items = freq
      .slice(start, end)
      .map(
        (w, i) => `    <li>
      <div class="w-row"><span class="w-kr">${start + i + 1}위</span><span class="w-word" lang="en">${esc(w[0])}</span><span class="w-ipa">${esc(w[2])}</span></div>
      <p class="w-mean">${esc(w[1])}${speakBtn(w[0])}</p>
    </li>`,
      )
      .join("\n");
    groups.push(
      `  <h3 class="freq-range" id="rank-${start + 1}">${start + 1}~${end}위</h3>\n` +
        `  <ol class="words" start="${start + 1}">\n${items}\n  </ol>`,
    );
  }

  const faqHtml = FAQ.map((f) => `  <h3>${f.q}</h3>\n  <p>${f.a}</p>`).join("\n");

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">주제별 단어장</a> › <span>빈출 어휘 ${n}선</span>
  </nav>

  <h1>TOEIC 빈출 어휘 ${n}선 — 빈도순 필수 단어 목록</h1>
  <p class="lead">토익에 반복 출제되는 어휘 ${n}개를 빈도 감각 순서로 정리했습니다. 단어·품사·뜻을 한 줄씩 확인하며 앞에서부터 외우고, 🔊 버튼으로 소리까지 들어 보세요.</p>
  <a class="cta" href="../">🃏 암기 카드·퀴즈로 바로 학습하기</a>

  <h2 class="sec">왜 빈도순으로 외워야 하나요?</h2>
${bullets([
  "시험에 나오는 단어는 정해져 있습니다 — 반복 출제되는 어휘를 먼저 외우면 같은 시간에 더 많은 문제를 만납니다.",
  "Part 7 지문에서 막히는 지점은 대부분 이 목록의 단어입니다. 뜻이 즉시 떠오르면 읽는 속도가 달라집니다.",
  "순서가 있으면 계획이 생깁니다 — 오늘 20개, 열흘이면 200개처럼 진도를 숫자로 확인할 수 있습니다.",
  "품사까지 함께 보면 Part 5 어휘 문제가 그대로 풀립니다(빈칸 앞뒤의 문법 신호가 답을 정합니다).",
])}

  <h2 class="sec">이 목록, 이렇게 쓰세요</h2>
${bullets([
  "① 하루 20개씩 위에서부터 소리 내어 세 번 읽습니다(🔊 로 발음을 확인합니다).",
  "② 뜻을 눈으로만 보지 말고, 그 단어로 짧은 문장 하나를 만들어 말해 봅니다.",
  "③ 뜻이 바로 떠오르지 않은 단어만 표시해 두고, 다음 날 그 단어부터 봅니다.",
  "④ 3일·7일 간격으로 앞 구간을 다시 훑습니다 — 이 목록은 위에서 아래로 다시 읽는 것만으로 복습이 됩니다.",
  "⑤ 끝까지 한 번 돌았으면 <a href='../'>홈</a>의 퀴즈·암기 카드와 <a href='./'>주제별 단어장</a>으로 넓혀 갑니다.",
])}

  <h2 class="sec">빈도순 기출 어휘 ${n}선</h2>
  <p class="lead">아래로 갈수록 "알아두면 좋은" 단어에 가까워집니다. 상위 50개는 반드시, 나머지는 눈에 익히는 정도로 시작하세요.</p>
  <nav class="freq-jump" aria-label="구간 이동">구간: ${groups
    .map((_, i) => `<a href="#rank-${i * 50 + 1}">${i * 50 + 1}~${Math.min(i * 50 + 50, n)}위</a>`)
    .join(" ")}</nav>
${groups.join("\n")}

  <h2 class="sec">시험에서는 이렇게 나옵니다</h2>
${bullets([
  "Part 5 어휘 문제 — 빈칸의 품사와 어울리는 단어를 고르는 문제라, 이 목록의 품사 칩이 그대로 단서가 됩니다.",
  "Part 6 지문 완성 — 접속부사와 동의어 반복이 단서입니다. 문장 사이의 연결어를 함께 눈여겨보세요.",
  "Part 7 안내문·이메일 — 일정·비용·승인 어휘가 반복됩니다(confirm, invoice, deadline, reimburse 계열).",
  "듣기 Part 2·3 — 철자가 아니라 소리로 구별됩니다. 소리 내어 읽는 습관이 점수를 바꿉니다.",
])}

  <h2 class="sec">자주 묻는 질문</h2>
  <div class="qa">
${faqHtml}
  </div>

  <h2 class="sec">함께 보면 좋은 자료</h2>
  <ul class="unitlist">
    <li><a href="./">
      <b>주제별 단어장</b>
      <span>📚 30개 유닛 · 단어 1,000개</span>
      <em>발음기호·한글 발음·예문·해석까지</em>
    </a></li>
    <li><a href="idioms.html">
      <b>구동사·숙어</b>
      <span>💡 빈출 구동사·숙어 모음</span>
      <em>뜻과 예문, 해석까지</em>
    </a></li>
    <li><a href="../guides/vocabulary-30day.html">
      <b>30일 어휘 플랜</b>
      <span>🗓 매일 무엇을 얼마나</span>
      <em>어휘 공부 순서와 분량 잡기</em>
    </a></li>
    <li><a href="../grammar/cheatsheet.html">
      <b>문법 한 장 요약</b>
      <span>📄 Part 5 필수 문법</span>
      <em>품사·시제·태 한눈에</em>
    </a></li>
  </ul>

  <nav class="pager" aria-label="이동">
    <span></span>
    <a class="mid" href="./">📚 주제별 단어장 전체 보기</a>
    <span></span>
  </nav>
${units && units.length ? unitJumpList(units, -1, `📚 단어장 유닛 바로 가기 (${units.length}개)`) : ""}`;

  return { file: "units/frequency.html", html: page({ title, description, canonical, ld, body, speak: true }) };
}

/* ------------------------------------------------------------------ */
/* 6-1c. 헷갈리는 단어(혼동 어휘) — data/app-data.js CONFUSABLES        */
/* ------------------------------------------------------------------ */

/**
 * 혼동 어휘 20쌍 — 홈의 학습 카드와 같은 데이터(`CONFUSABLES`)로 만드는 정적 페이지입니다
 * (docs/prerender-split-plan.md 2단계 · 2026-09-18).
 *
 * 홈에는 앞의 6쌍만 미리 심고(웹에서는 어차피 앱이 20쌍을 다시 그립니다) 이 페이지가 전체를 담습니다.
 * 카드에 팁뿐 아니라 예문 발음까지 붙여, 검색으로 바로 들어온 사람도 한 페이지에서 끝낼 수 있게 했습니다.
 */
function buildConfusionPage(confusables, units) {
  const canonical = `${SITE}/units/confusion.html`;
  const n = confusables.length;
  const title = `헷갈리는 TOEIC 영단어 ${n}쌍 — 철자·뜻 비교 | toeic.monster`;
  const description =
    `토익에서 자주 헷갈리는 단어 ${n}쌍을 예문과 함께 비교했습니다. ` +
    "affect와 effect, adapt와 adopt 처럼 철자가 비슷해 틀리기 쉬운 단어를 한 페이지에서 구분하며 익히세요.";

  const FAQ = [
    {
      q: "헷갈리는 단어는 어떻게 외우는 게 좋은가요?",
      a:
        "뜻을 따로 외우기보다 짧은 예문 한 쌕으로 묶어서 기억하세요. " +
        "예를 들면 affect 는 '정책이 직원에게 영향을 준다', effect 는 '그 변화의 효과'처럼 문장과 함께 익히면 시험장에서 문장 구조만 보고도 갈립니다.",
    },
    {
      q: "철자가 비슷한 단어가 자주 나오나요?",
      a:
        "Part 5·6 어휘 문제와 Part 7 지문에 반복해 나옵니다. " +
        "보기에 철자가 비슷한 단어가 나란히 오면 뜻이 아니라 문장에서의 자리(품사)가 단서가 되므로, 태그에 적힌 품사도 함께 눈에 익혀 두세요.",
    },
    {
      q: "품사 태그는 어떻게 활용하나요?",
      a: "affect(동사)·effect(명사) 처럼 각 단어 옆에 적어 두었습니다. 빈칸 앞뒤로 명사 자리인지 동사 자리인지만 판단되면 오답이 바로 걸러집니다.",
    },
    {
      q: "목록에 있는 단어만 외우면 되나요?",
      a:
        `이 ${n}쌍은 “자주 틀리는 것”을 모은 목록입니다. 빈출 어휘 200선으로 우선순위를 잡고, ` +
        "주제별 단어장으로 어휘를 넓힌 뒤 이 페이지로 돌아와 점검하는 순서를 추천합니다.",
    },
  ];

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        name: `헷갈리는 TOEIC 영단어 ${n}쌍`,
        description,
        url: canonical,
        inLanguage: "ko",
        learningResourceType: "어휘 비교 목록",
        educationalUse: "self-study",
        numberOfItems: n,
        provider: { "@type": "Organization", name: "toeic.monster", url: `${SITE}/` },
      },
      {
        "@type": "ItemList",
        name: `헷갈리는 TOEIC 영단어 ${n}쌍`,
        numberOfItems: n,
        itemListElement: confusables.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.pair,
          description: `${c.tag} — ${c.tip}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "toeic.monster", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "주제별 단어장", item: `${SITE}/units/` },
          { "@type": "ListItem", position: 3, name: `혼동 어휘 ${n}쌍`, item: canonical },
        ],
      },
    ],
  });

  const cards = confusables
    .map(
      (c) => `    <article class="confuse-card">
      <div class="confuse-head"><span class="confuse-pair" lang="en">${esc(c.pair)}</span><span class="confuse-tag">${esc(c.tag)}</span></div>
      <div class="confuse-row"><div class="confuse-en" lang="en">${esc(c.a.en)}${speakBtn(c.a.en)}</div><div class="confuse-ko">${esc(c.a.ko)}</div></div>
      <div class="confuse-row"><div class="confuse-en" lang="en">${esc(c.b.en)}${speakBtn(c.b.en)}</div><div class="confuse-ko">${esc(c.b.ko)}</div></div>
      <div class="confuse-tip">💡 ${esc(c.tip)}</div>
    </article>`,
    )
    .join("\n");

  const bullet = (text) => `    <li><span class="w-mean">${text}</span></li>`;
  const bullets = (list) => `  <ol class="words">\n${list.map(bullet).join("\n")}\n  </ol>`;

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">주제별 단어장</a> › <span>혼동 어휘 ${n}쌍</span>
  </nav>

  <h1>헷갈리는 TOEIC 영단어 ${n}쌍</h1>
  <p class="lead">철자가 비슷해 자주 틀리는 단어 ${n}쌍을 예문과 함께 비교했습니다. 각 카드의 🔊 를 눌러 문장 발음까지 확인해 보세요.</p>
  <p class="g-intro">토익에서 틀리는 어휘는 “모르는 단어”보다 “안다고 생각한 단어”에서 나옵니다. affect와 effect, adapt와 adopt 처럼 철자가 비슷한 단어는 뜻을 따로 외우면 시험장에서 다시 헷갈리고, 문장으로 묶어 두면 문장 구조만 보고도 골라낼 수 있습니다.</p>
  <a class="cta" href="../">🃏 암기 카드·퀴즈로 바로 학습하기</a>

  <h2 class="sec">왜 혼동 단어부터 정리해야 하나요?</h2>
${bullets([
  "오답의 상당수가 “뜻은 알지만 골라내지 못한” 단어에서 나옵니다 — 문장에서의 자리(품사)만 보면 답이 갈립니다.",
  "Part 5·6에서는 같은 어근의 명사·동사·형용사가 보기에 나란히 놓입니다. 두 번째 단어가 아니라 “자리”가 단서입니다.",
  "Part 7 지문에서 비슷한 단어가 반복되면 지문의 흐름을 놓칩니다. 한 번 구분해 두면 읽는 속도가 함께 올라갑니다.",
  "듣기에서도 소리가 비슷한 짝(accept·except)이 자주 나와, 눈으로 익힌 구분이 그대로 점수가 됩니다.",
])}

  <h2 class="sec">이렇게 구분하세요</h2>
${bullets([
  "① 카드의 예문을 소리 내어 읽고, 두 문장에서 각 단어가 하는 일을 말해 봅니다.",
  "② 품사 태그를 가리고 pair만 보고 “왼쪽은 동사, 오른쪽은 명사”처럼 되뇌어 봅니다.",
  "③ 뜻이 아니라 자리로 고르는 연습을 합니다 — 빈칸 앞뒤에 관사·조동사가 있는지 봅니다.",
  "④ 하루에 5쌍씩 나누고, 사흘 뒤 앞 구간을 다시 훑습니다.",
  "⑤ 다 돈 뒤에는 <a href='../'>홈</a>의 퀴즈와 암기 카드로 실제 문제에서 구분되는지 확인합니다.",
])}

  <h2 class="sec">헷갈리는 단어 ${n}쌍</h2>
  <div class="confuse-grid">
${cards}
  </div>

  <h2 class="sec">시험에서는 이렇게 나옵니다</h2>
${bullets([
  "Part 5 어휘 — 보기에 affect·effect 처럼 같은 어근이 오면, 문장의 자리로 정답이 하나로 좁혀집니다.",
  "Part 6 지문 완성 — 접속부사와 함께 “의미가 반대인 단어”가 함정으로 쓰입니다.",
  "Part 7 안내문·이메일 — proceed·precede, stationary·stationery 처럼 비슷한 철자가 실제 지문에 나옵니다.",
  "듣기 Part 2·3 — accept·except, borrow·lend 처럼 소리가 비슷한 짝이 응답 함정으로 쓰입니다.",
])}

  <h2 class="sec">자주 묻는 질문</h2>
  <div class="qa">
${FAQ.map((f) => `  <h3>${esc(f.q)}</h3>\n  <p>${esc(f.a)}</p>`).join("\n")}
  </div>

  <h2 class="sec">함께 보면 좋은 자료</h2>
  <ul class="unitlist">
    <li><a href="frequency.html">
      <b>빈출 어휘</b>
      <span>📈 빈도순 기출 어휘 200선</span>
      <em>무엇부터 외울지 순서 잡기</em>
    </a></li>
    <li><a href="./">
      <b>주제별 단어장</b>
      <span>📚 30개 유닛 · 단어 1,000개</span>
      <em>주제별로 어휘 넓히기</em>
    </a></li>
    <li><a href="../guides/part-5-word-forms.html">
      <b>어형 변화 공략</b>
      <span>✏️ 품사 변환 규칙</span>
      <em>빈칸 자리로 품사 고르기</em>
    </a></li>
    <li><a href="idioms.html">
      <b>구동사·숙어</b>
      <span>💡 빈출 표현 모음</span>
      <em>뜻과 예문, 해석까지</em>
    </a></li>
  </ul>

  <nav class="pager" aria-label="이동">
    <span></span>
    <a class="mid" href="./">📚 주제별 단어장 전체 보기</a>
    <span></span>
  </nav>
${units && units.length ? unitJumpList(units, -1, `📚 단어장 유닛 바로 가기 (${units.length}개)`) : ""}`;

  return { file: "units/confusion.html", html: page({ title, description, canonical, ld, body, speak: true }) };
}

/* ------------------------------------------------------------------ */
/* 6-2. 전략·공략 가이드 (data/extra.js)                                */
/* ------------------------------------------------------------------ */

const GUIDE_FOOTER =
  '<a href="../">홈</a><a href="../units/">주제별 단어장</a><a href="index.html">전략·공략 가이드</a>' +
  '<a href="../grammar/">문법 교재</a><a href="../conversation/">회화 교재</a>' +
  '<a href="../privacy.html">개인정보처리방침</a><a href="../terms.html">이용약관</a>';

/** 전략·공략 가이드 허브의 문답. */
const FAQ_GUIDES = [
  {
    q: "가이드는 어떤 순서로 읽으면 좋나요?",
    a: "약한 파트부터 보세요. RC 기초가 약하면 Part 5 문법 → 어형 변화 → 접속사·전치사 순서, LC 점수가 정체돼 있으면 Part 2 함정 → 숫자·금액·시간 순서가 효율적입니다.",
  },
  {
    q: "가이드만 읽으면 점수가 오르나요?",
    a: "가이드는 무엇을 어떤 순서로 볼지 정하는 지도입니다. 읽은 뒤 홈의 퀴즈와 암기 카드로 같은 내용을 문제로 풀어 봐야 점수로 이어집니다.",
  },
  {
    q: "Part 5 가이드와 문법 교재는 무엇이 다른가요?",
    a: "가이드는 시험장 판단 기준(빈칸 신호 → 정답 유형) 중심이고, 문법 교재는 개념을 단계별로 설명하는 교재입니다. 시간이 없으면 가이드, 기초부터 세우려면 교재를 보세요.",
  },
];

function buildGuidesHub(guides) {
  const canonical = `${SITE}/guides/`;
  const description =
    "Part 5 문법, Part 6 장문 공란, Part 7 복수 지문, Part 2 함정 유형, 어휘 30일 커리큘럼, LC 숫자 함정까지 파트별 공략법을 정리했습니다.";
  const title = "TOEIC 파트별 전략·공략 가이드 | toeic.monster";

  const ld = jsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "TOEIC 파트별 전략·공략 가이드",
        description,
        url: canonical,
        inLanguage: "ko",
        isPartOf: { "@type": "WebSite", name: "toeic.monster", url: `${SITE}/` },
      },
      ...faqNodes(FAQ_GUIDES),
    ],
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
  </ul>

  <h2 class="sec">어떤 순서로 읽으면 좋을까요</h2>
  <p class="lead">아홉 편은 따로 봐도 되지만, 약한 파트부터 이어서 보면 더 빠릅니다. 지금 점수가 막힌 지점에서 시작하세요.</p>
  <ol class="words">
    <li><span class="w-mean"><b>RC 기초가 약하다면</b> Part 5 빈출 문법 → 어형 변화 → 접속사·전치사 구분법 순서로 보세요. 세 편이 같은 빈칸 문제를 서로 다른 각도에서 다룹니다.</span></li>
    <li><span class="w-mean"><b>긴 지문에서 시간이 모자라다면</b> Part 6 장문 공란 → Part 7 복수 지문 순서로 보세요. 지문을 읽는 순서와 시간 배분을 먼저 정하는 것이 핵심입니다.</span></li>
    <li><span class="w-mean"><b>LC 점수가 정체되어 있다면</b> Part 2 함정 유형 → LC 숫자·금액·시간 순서로 보세요. 듣기에서 실수하는 지점은 대부분 이 두 가지입니다.</span></li>
    <li><span class="w-mean"><b>단어가 부족하다면</b> 30일 커리큘럼으로 계획을 세우고, 하루 분량을 줄이더라도 매일 이어 가세요.</span></li>
    <li><span class="w-mean"><b>900점 이상을 목표로 한다면</b> Speaking·Writing 유형 정리로 4기능 점수까지 함께 준비하세요.</span></li>
  </ol>

${faqSection(FAQ_GUIDES)}`;

  return { file: "guides/index.html", html: page({ title, description, canonical, ld, body, footerNav: GUIDE_FOOTER }) };
}

function buildGuidePage(g, prev, next, guides) {
  const canonical = `${SITE}/guides/${g.slug}.html`;
  const title = `${g.title} | toeic.monster`;
  const description = g.desc;
  const faq = Array.isArray(g.faq) ? g.faq : [];
  const related = Array.isArray(g.related) ? g.related : [];

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
      // 가이드마다 화면에 보이는 문답을 그대로 구조화 데이터로도 넣습니다(둘이 어긋나면 검색엔진이 무시합니다).
      ...(faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faq.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
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

  // 화면에 보이는 문답과 구조화 데이터가 같은 문장을 쓰도록 한 곳에서 만듭니다.
  const faqHtml = faq.length
    ? `  <h2 class="sec">자주 묻는 질문</h2>\n  <div class="qa">\n${faq
        .map((f) => `  <h3>${esc(f.q)}</h3>\n  <p>${esc(f.a)}</p>`)
        .join("\n")}\n  </div>\n\n`
    : "";

  const relatedHtml = related.length
    ? `  <h2 class="sec">함께 보면 좋은 자료</h2>\n  <ul class="unitlist">\n${related
        .map(
          (r) => `    <li><a href="${esc(r.href)}">
      <b>${esc(r.t)}</b>
      <span>${esc(r.d)}</span>
    </a></li>`,
        )
        .join("\n")}\n  </ul>\n\n`
    : "";

  const body = `  <nav class="crumb" aria-label="breadcrumb">
    <a href="../">toeic.monster</a> › <a href="./">전략·공략 가이드</a> › <span>${esc(g.title)}</span>
  </nav>

  <h1>${esc(g.title)}</h1>
  <p class="lead">${esc(g.desc)}</p>
${g.intro ? `  <p class="g-intro">${esc(g.intro)}</p>\n` : ""}  <a class="cta" href="../">🃏 단어·퀴즈로 바로 학습하기</a>

${sections}

${faqHtml}${relatedHtml}  <nav class="pager" aria-label="이동">
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

  // 단계별 소개·학습 목표·과 목차를 허브에서 바로 보여 줍니다.
  // 학습자는 "어느 단계부터 볼지"를 정하려고 페이지를 옮겨 다니지 않아도 되고,
  // 검색엔진에는 과별 페이지로 가는 링크가 허브 한 곳에 모입니다.
  const bookSections = books
    .map(
      (b) => `  <details class="jump">
    <summary>${LEVEL_ICON[b.level] || "🟡"} ${esc(b.level)} · CEFR ${esc(b.cefr || "")} — ${esc(b.title)} (${b.chapters.length}과)</summary>
    <div class="jump-body">
      <p class="lead">${esc(b.desc || b.subtitle)}</p>
      <p><b>이런 분께</b> ${esc(b.audience || "")}</p>
      <p><b>학습 목표</b> ${esc(b.goal || "")}</p>
      <ol class="words">
${(b.howto || []).map((t) => `        <li><span class="w-mean">${esc(t)}</span></li>`).join("\n")}
      </ol>
      <a class="cta" href="${b.id}.html">📘 ${esc(b.title)} 열기</a>
      <ul class="toc">
${chapterLinkList(b)}
      </ul>
    </div>
  </details>`,
    )
    .join("\n");

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

  <h2 class="sec">한눈에 보기</h2>
  <ol class="words">
    <li><span class="w-mean">기초·중급·고급 3단계, 모두 ${totalCh}과입니다.</span></li>
    <li><span class="w-mean">과마다 개념 설명 · 형태 표 · 예문 · 흔한 실수 · 연습 문제로 구성됩니다.</span></li>
    <li><span class="w-mean">연습 문제는 모두 ${totalQ}문항이고, 앱에서 단계와 문항 수를 골라 풀 수 있습니다.</span></li>
    <li><span class="w-mean">설치나 가입 없이 모든 페이지를 무료로 열 수 있고, 학습 기록은 브라우저에만 저장됩니다.</span></li>
  </ol>

  <h2 class="sec">단계별 안내</h2>
  <p class="lead">각 단계를 눌러 학습 목표와 과별 목차를 확인하세요. 과 제목을 누르면 그 과만 따로 볼 수 있습니다.</p>
${bookSections}

  <h2 class="sec">학습 순서</h2>
  <ol class="words">
    <li><span class="w-mean">기초 영문법으로 문장의 뼈대(주어·동사)와 기본 시제를 먼저 정리합니다.</span></li>
    <li><span class="w-mean">중급 영문법에서 완료시제·수동태·관계사·준동사를 익힙니다.</span></li>
    <li><span class="w-mean">고급 영문법으로 도치·강조·분사구문 같은 문어체 표현을 다듬습니다.</span></li>
    <li><span class="w-mean">과를 읽은 직후에 그 과의 연습 문제를 풀고, 틀린 과만 다음 날 다시 봅니다.</span></li>
    <li><span class="w-mean">한 장 요약으로 전체 형태를 확인한 뒤, 앱의 문법 문제로 실전 감각을 유지합니다.</span></li>
  </ol>

  <h2 class="sec">연습 문제 활용법</h2>
  <ol class="words">
    <li><span class="w-mean">개념을 읽은 직후에 바로 풀면 가장 오래 남습니다. 과를 넘긴 뒤에 몰아 풀면 효과가 떨어집니다.</span></li>
    <li><span class="w-mean">앱의 "문법 문제 풀이"에서 단계와 문항 수(5 · 8 · 10 · 20 · 전체)를 골라 풀 수 있습니다.</span></li>
    <li><span class="w-mean">틀린 문항은 오답노트에 쌓이고, 정답·해설과 함께 완성 문장을 소리 내어 들을 수 있습니다.</span></li>
    <li><span class="w-mean">점수가 오르지 않으면 새 단계로 넘어가지 말고 같은 과의 문제를 다시 풉니다.</span></li>
  </ol>

  <h2 class="sec">자주 묻는 질문</h2>
  <ol class="words">
    <li><span class="w-mean"><b>문법을 처음 시작한다면 어디서부터 보면 되나요?</b> 기초 영문법 1과부터 순서대로 보세요. 문법 용어가 낯설어도 형태 표와 예문만 따라가면 이해할 수 있게 썼습니다.</span></li>
    <li><span class="w-mean"><b>하루에 몇 과씩 보면 좋나요?</b> 하루 1과를 권합니다. 개념 읽기 10분, 연습 문제 7분이면 한 과가 끝납니다.</span></li>
    <li><span class="w-mean"><b>교재와 앱의 문제가 같은 문항인가요?</b> 개념은 같지만 문항은 다릅니다. 교재로 개념을 잡고 앱에서 반복해 푸는 구조입니다.</span></li>
    <li><span class="w-mean"><b>학습 기록이 서버로 전송되나요?</b> 전송되지 않습니다. 기록은 브라우저(localStorage)에만 저장되고, 초기화하면 바로 지워집니다.</span></li>
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

  // intro(선택) — summary 가 "무엇을 배우는지"라면, intro 는 "시험에서 어떻게 나오고 어떻게 공부하면 되는지"입니다.
  // 기본 12과에 넣어 두었고, 없으면 그 줄만 빠집니다.
  return `  <section class="gram" id="${chapterAnchor(c.no)}">
    <div class="gram-head"><span class="gram-no">${String(c.no).padStart(2, "0")}과</span><h2>${esc(c.title)}</h2></div>
    <p class="gram-sum">${esc(c.summary)}</p>${c.intro ? `\n    <p class="g-intro">${esc(c.intro)}</p>` : ""}
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

/** 회화 교재 허브의 문답. */
const FAQ_CONVERSATION = [
  {
    q: "어느 단계부터 시작해야 하나요?",
    a: "문장을 만들어 말하기 어렵다면 초급(A1~A2), 일상 대화는 되지만 업무 상황에서 막힌다면 중급(B1~B2), 표현은 알지만 뉘앙스 조절이 어렵다면 고급(C1)부터 시작하세요.",
  },
  {
    q: "회화 교재와 문법 교재를 함께 봐도 되나요?",
    a: "함께 보는 편이 좋습니다. 회화 교재로 상황 표현을 익히고, 막히는 문법은 같은 단계의 문법 교재에서 찾아보는 순서가 오래 남습니다.",
  },
  {
    q: "혼자서도 말하기 연습이 되나요?",
    a: "됩니다. 각 과의 예문을 🔊로 듣고 따라 말한 뒤, 표현 표를 가리고 우리말 뜻만 보고 영어로 말해 보세요. 연습 문제로 확인까지 하면 한 과가 끝납니다.",
  },
  {
    q: "토익 시험 대비에도 도움이 되나요?",
    a: "Part 2 응답 감각과 Part 3·4 대화 흐름을 익히는 데 도움이 됩니다. 회화 표현이 듣기 지문에 그대로 나오기 때문입니다.",
  },
];

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
      ...faqNodes(FAQ_CONVERSATION),
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

  <p class="g-intro">회화는 어려운 문법보다 <b>상황을 버티는 표현</b>이 먼저 필요합니다. 그래서 이 교재는 문법 항목이 아니라 상황(인사·주문·길 묻기·협상·갈등 완화)을 축으로 삼고, 각 과에 표현 표·발음 안내·흔한 실수·연습 문제를 담았습니다. 두 교재를 나란히 오갈 수 있도록 단계 이름(A1~A2·B1~B2·C1)을 문법 교재와 맞춰 두었습니다.</p>

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
  </ol>

${faqSection(FAQ_CONVERSATION)}`;

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

  // intro(선택) — summary 가 "무엇을 배우는지"라면, intro 는 "시험에서 어떻게 나오고 어떻게 공부하면 되는지"입니다.
  // 기본 12과에 넣어 두었고, 없으면 그 줄만 빠집니다.
  return `  <section class="gram" id="${chapterAnchor(c.no)}">
    <div class="gram-head"><span class="gram-no">${String(c.no).padStart(2, "0")}과</span><h2>${esc(c.title)}</h2></div>
    <p class="gram-sum">${esc(c.summary)}</p>${c.intro ? `\n    <p class="g-intro">${esc(c.intro)}</p>` : ""}
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

  // 낱개 과 페이지는 검색으로 바로 들어오는 주소라, 다음에 볼 자료로 가는 길을 페이지 안에 둡니다.
  // (꼭대기에 있는 빵부스러기·하단 이동 링크만으로는 무엇을 더 볼지가 드러나지 않습니다.)
  const related = isGrammar
    ? [
        { href: "./", t: "문법 교재 3단계", d: `기초·중급·고급 (${books.length}권)` },
        { href: "cheatsheet.html", t: "문법 한 장 요약", d: "Part 5 필수 문법을 한 페이지에" },
        { href: bookFile, t: `${esc(book.title)} 전체`, d: `${book.chapters.length}과를 순서대로` },
        { href: "../units/frequency.html", t: "빈출 어휘 200선", d: "문법과 함께 잡으면 좋은 어휘" },
      ]
    : [
        { href: "./", t: "영어회화 교재 3단계", d: `초급·중급·고급 (${books.length}권)` },
        { href: bookFile, t: `${esc(book.title)} 전체`, d: `${book.chapters.length}과를 순서대로` },
        { href: "../grammar/", t: "문법 교재", d: "막히는 문법을 같은 단계에서 찾기" },
        { href: "../units/", t: "주제별 단어장 30개", d: "상황별 어휘로 표현 넓히기" },
      ];
  const relatedHtml = `  <h2 class="sec">함께 보면 좋은 자료</h2>
  <ul class="unitlist">
${related
    .map(
      (r) => `    <li><a href="${r.href}">
      <b>${r.t}</b>
      <span>${r.d}</span>
    </a></li>`,
    )
    .join("\n")}
  </ul>

`;

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
${relatedHtml}  <h2 class="sec">🗂 ${esc(book.title)}의 다른 과</h2>
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
  ["/grammar/", "문법 교재", "기초·중급·고급 36과 + 연습 288문항"],
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
<link rel="preload" as="font" type="font/woff2" href="${ASSET_ABS}fonts/pretendard-variable.woff2" crossorigin>
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
<body id="top">
<a class="skip-link" href="#main">본문으로 바로가기</a>
<header class="bar">
  <div class="wrap">
    <a href="/">toeic.monster</a>
    <small>발음·예문으로 외우는 TOEIC 필수 어휘 1,000</small>
  </div>
</header>
<main class="wrap" id="main">
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
  // 빈도순 어휘 — 홈에 프리렌더로 심던 200개 목록을 옮긴 페이지(2026-09-18).
  add(`${SITE}/units/frequency.html`, "monthly", "0.7");
  // 혼동 어휘 — 홈 카드와 같은 데이터로 만든 비교 페이지(2026-09-18).
  add(`${SITE}/units/confusion.html`, "monthly", "0.7");
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
  const { vocab, idioms, extra, grammar, conversation, confusables } = loadVocab();
  const guides = Array.isArray(extra.guides) ? extra.guides : [];
  const lastmod = lastModified();

  const units = meta
    .filter((u) => Array.isArray(vocab[u.id]) && vocab[u.id].length)
    .sort((a, b) => a.id - b.id)
    .map((u) => ({ ...u, words: vocab[u.id] }));

  const missing = meta.length - units.length;
  if (missing > 0) console.warn(`⚠️  단어 데이터가 없는 유닛 ${missing}개는 건너뜁니다.`);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 공용 스타일 — 모든 정적 페이지가 이 한 파일을 함께 받아 씁니다.
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
  const freqPage = buildFrequencyPage(Array.isArray(extra.frequency) ? extra.frequency : [], units);
  const confusionPage = buildConfusionPage(Array.isArray(confusables) ? confusables : [], units);
  write(hub.file, hub.html);
  write(idiomsPage.file, idiomsPage.html);
  write(freqPage.file, freqPage.html);
  write(confusionPage.file, confusionPage.html);

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
  console.log(`   · 빈도순 어휘 페이지 1개 (어휘 ${(extra.frequency || []).length}개)`);
  console.log(`   · 혼동 어휘 페이지 1개 (${(confusables || []).length}쌍)`);
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
