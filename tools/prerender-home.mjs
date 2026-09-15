#!/usr/bin/env node
/**
 * 홈 섹션 프리렌더 — index.html 안에 정적 콘텐츠를 미리 심습니다.
 *
 * 왜 필요한가:
 *   홈은 대부분의 섹션을 JavaScript 로 그립니다. 그래서
 *     ① 자바스크립트를 실행하지 않는 크롤러(네이버 Yeti)는 내용을 읽지 못하고,
 *     ② 자바스크립트를 끈 사용자는 제목만 있는 빈 화면을 봅니다.
 *   단어 목록(units/)처럼 페이지를 따로 만들기에는 홈의 도구 섹션들이 서로 얽혀 있어,
 *   "읽을 수 있는 텍스트 목록" 섹션만 홈 안에 미리 그려 넣습니다.
 *
 * 어떻게:
 *   index.html 에서 해당 섹션의 **앱 렌더 함수를 그대로 떼어내** 가짜 브라우저에서 실행하고,
 *   나온 HTML 을 같은 컨테이너에 심습니다. 그래서 화면에 보이는 모습과 미리 심은 내용이
 *   어긋날 수 없습니다(앱이 로드되면 어차피 같은 내용으로 다시 그립니다).
 *
 *   함께 넣는 것: <noscript> 목차 — 52개 섹션의 제목·설명과, 자바스크립트 없이 볼 수 있는
 *   정적 페이지(단어장·숙어·문법 교재·가이드) 링크.
 *
 * 실행:  node tools/prerender-home.mjs        (index.html 을 갱신합니다)
 *        node tools/prerender-home.mjs --check (고치지 않고 어긋난 것만 보고, CI 용)
 * 종료 코드: --check 에서 차이가 있으면 1
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = "index.html";
const CHECK_ONLY = process.argv.includes("--check");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const html = read(INDEX);

/* ------------------------------------------------------------------ */
/* 1. 미리 그릴 섹션 목록                                               */
/*    containerId: index.html 의 컨테이너 id                            */
/*    data:        그리는 데 필요한 값(변수 이름 또는 EXTRA 키)           */
/*    render:      앱의 렌더 함수 이름                                  */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  { id: "confuseGrid", label: "혼동 어휘", varname: "CONFUSABLES", render: "renderConfusables" },
  { id: "wordpartGrid", label: "어근·접두사", varname: "WORD_PARTS", render: "renderWordParts" },
  { id: "wordfamilyGrid", label: "단어 패밀리", varname: "WORD_FAMILIES", render: "renderWordFamilies" },
  { id: "freqGrid", label: "빈도순 기출 어휘", extraKey: "frequency", render: "renderFrequency", renderArg: "" },
];

/* ------------------------------------------------------------------ */
/* 2. 소스에서 코드 블록 떼어내기                                       */
/* ------------------------------------------------------------------ */

/* 앱 코드는 최상위 선언을 두 칸 들여쓰기로 맞춰 두었습니다.
   그래서 "정확히 두 칸 + 닫는 괄호/대괄호"인 줄이 선언의 끝입니다.
   (중첩 블록은 더 깊이 들여쓰기 때문에 걸리지 않습니다.) */
const atLineStart = (needle) => {
  const re = new RegExp(`^${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m");
  const m = re.exec(html);
  if (!m) throw new Error(`index.html 에서 ${needle.trim()} 를 찾지 못했습니다.`);
  return m.index;
};

/** startAt 이후에 나오는, 들여쓰기 level 칸짜리 닫는 줄의 끝 위치를 찾습니다. */
function endOfBlock(startAt, closer, level) {
  const line = " ".repeat(level) + closer;
  const lines = html.slice(startAt).split("\n");
  let offset = startAt;
  for (const text of lines) {
    if (offset > startAt && text === line) return offset + text.length;
    offset += text.length + 1;
  }
  throw new Error(`닫는 줄(${line})을 찾지 못했습니다.`);
}

/** `  var NAME = [...]` 선언을 통째로 떼어냅니다. */
function extractAssignment(name) {
  const at = atLineStart(`  var ${name} = [`);
  return html.slice(at, endOfBlock(at, "];", 2));
}

/** `  function NAME(...) {...}` 정의를 통째로 떼어냅니다. */
function extractFunction(name) {
  const at = atLineStart(`  function ${name}(`);
  return html.slice(at, endOfBlock(at, "}", 2));
}

/* ------------------------------------------------------------------ */
/* 3. 가짜 브라우저에서 앱 렌더 함수를 실행해 HTML 얻기                  */
/* ------------------------------------------------------------------ */

const dataCtx = { window: {} };
vm.createContext(dataCtx);
vm.runInContext(read("data/extra.js"), dataCtx, { filename: "data/extra.js", timeout: 5000 });
const EXTRA = dataCtx.window.TOEIC_EXTRA || {};

const elements = {};
function elementOf(id) {
  if (!elements[id]) elements[id] = { id, innerHTML: "" };
  return elements[id];
}

const sandbox = {
  EXTRA,
  console,
  document: { getElementById: elementOf, querySelector: () => null, querySelectorAll: () => [] },
  window: { TOEIC_EXTRA: EXTRA },
};
vm.createContext(sandbox);

// 앱의 도우미(esc·escapeAttr·ttsBtn)도 그대로 씁니다 — 그래야 마크업이 앱과 같습니다.
vm.runInContext(
  [
    extractFunction("esc"),
    extractFunction("escapeAttr"),
    extractFunction("ttsBtn"),
  ].join("\n"),
  sandbox,
  { filename: "index.html:helpers", timeout: 5000 },
);

const rendered = [];
for (const section of SECTIONS) {
  const code = [
    section.varname ? extractAssignment(section.varname) : "",
    extractFunction(section.render),
  ].join("\n");
  vm.runInContext(code, sandbox, { filename: `index.html:${section.render}`, timeout: 5000 });
  // 앱이 화면을 열 때 하는 것과 같은 호출입니다(인자는 없어도 기본값을 씁니다).
  vm.runInContext(`${section.render}();`, sandbox, { filename: `index.html:${section.render}()`, timeout: 5000 });
  const out = elementOf(section.id).innerHTML;
  if (!out || out.length < 40) {
    throw new Error(`${section.label}(${section.render}) 결과가 비어 있습니다.`);
  }
  if (/undefined|\[object Object\]|NaN/.test(out)) {
    throw new Error(`${section.label} 결과에 값이 비어 있는 자리가 있습니다.`);
  }
  rendered.push({ ...section, html: out });
}

/* ------------------------------------------------------------------ */
/* 4. <noscript> 목차 만들기                                            */
/* ------------------------------------------------------------------ */

const homeStart = html.indexOf('<div id="homeView">');
const homeEnd = html.indexOf('<div id="units"></div>', homeStart);
const home = html.slice(homeStart, homeEnd);

const sections = home.split(/(?=<section class="home-section")/).slice(1).map((chunk) => {
  const label = (chunk.match(/aria-label="([^"]*)"/) || [])[1] || "";
  const titleHtml = ((chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || "").trim();
  const sub = ((chunk.match(/<p class="home-section-sub">([\s\S]*?)<\/p>/) || [])[1] || "").trim();
  const plain = (s) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return { label, title: plain(titleHtml), sub: plain(sub) };
});

const STATIC_LINKS = [
  ["units/", "주제별 단어장 30개 유닛 · 단어 1,000개"],
  ["units/idioms.html", "빈출 구동사·숙어 126개"],
  ["grammar/", "문법 교재 3단계 (36과 · 연습 108문항)"],
  ["grammar/cheatsheet.html", "문법 한 장 요약"],
  ["guides/", "전략·유형 가이드 9편"],
];

const noscript = [
  "<noscript>",
  '  <section class="noscript-note" aria-label="자바스크립트 없이 보는 안내">',
  '    <h2 class="noscript-title">📄 자바스크립트 없이 보는 안내</h2>',
  "    <p>이 사이트의 암기 카드·퀴즈·시험 모드는 자바스크립트를 사용합니다. 아래 학습 자료는 자바스크립트 없이도 그대로 읽을 수 있습니다.</p>",
  '    <ul class="noscript-links">',
  ...STATIC_LINKS.map(([href, label]) => `      <li><a href="${href}">${label}</a></li>`),
  "    </ul>",
  `    <h2 class="noscript-title">🗂 학습 주제 ${sections.length}가지</h2>`,
  "    <ul>",
  ...sections.map(
    (s, i) => `      <li><b>${i + 1}. ${s.title}</b>${s.sub ? " — " + s.sub : ""}</li>`,
  ),
  "    </ul>",
  "  </section>",
  "</noscript>",
].join("\n");

/* ------------------------------------------------------------------ */
/* 5. index.html 에 심기                                                */
/* ------------------------------------------------------------------ */

function markers(id) {
  return { start: `<!-- prerender:start ${id} -->`, end: `<!-- prerender:end ${id} -->` };
}

/** 컨테이너 안쪽을 미리 그린 HTML 로 바꿉니다(여러 번 실행해도 같은 결과). */
function injectIntoContainer(src, section) {
  const { start, end } = markers(section.id);
  const block = `${start}\n${section.html}\n${end}`;
  const si = src.indexOf(start);
  if (si >= 0) {
    const ei = src.indexOf(end, si);
    if (ei < 0) throw new Error(`${section.id}: prerender:end 주석이 없습니다.`);
    return src.slice(0, si) + block + src.slice(ei + end.length);
  }
  // 첫 실행: 빈 컨테이너를 찾아 안쪽에 넣습니다.
  const re = new RegExp(`<[a-z]+[^>]*\\bid="${section.id}"[^>]*>`);
  const m = re.exec(src);
  if (!m) throw new Error(`${section.id}: 컨테이너를 찾지 못했습니다.`);
  const inner = src.slice(m.index + m[0].length, src.indexOf("</div>", m.index));
  if (inner.trim()) {
    throw new Error(`${section.id}: 컨테이너가 비어 있지 않습니다. 먼저 기존 내용을 정리하세요.`);
  }
  return src.slice(0, m.index + m[0].length) + block + src.slice(m.index + m[0].length);
}

const NS_START = "<!-- prerender:start noscript -->";
const NS_END = "<!-- prerender:end noscript -->";

function injectNoscript(src) {
  const block = `${NS_START}\n${noscript}\n${NS_END}`;
  const si = src.indexOf(NS_START);
  if (si >= 0) {
    const ei = src.indexOf(NS_END, si);
    if (ei < 0) throw new Error("noscript: prerender:end 주석이 없습니다.");
    return src.slice(0, si) + block + src.slice(ei + NS_END.length);
  }
  const anchor = '<div id="homeView">';
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error("homeView 를 찾지 못했습니다.");
  return src.slice(0, at) + block + "\n\n    " + src.slice(at);
}

let next = html;
for (const section of rendered) next = injectIntoContainer(next, section);
next = injectNoscript(next);

/* ------------------------------------------------------------------ */

const changed = next !== html;
const kb = (n) => (n / 1024).toFixed(1) + "KB";

console.log("🧩 홈 섹션 프리렌더");
for (const s of rendered) {
  const items = (s.html.match(/<(?:article|div) class="[^"]*(?:confuse-card|wordpart-card|wordfamily-card|freq-item)/g) || []).length;
  console.log(`   · ${s.label.padEnd(14)} ${s.id}  항목 ${items}개  ${kb(s.html.length)}`);
}
console.log(`   · noscript 목차      섹션 ${sections.length}개 · 정적 링크 ${STATIC_LINKS.length}개  ${kb(noscript.length)}`);

if (CHECK_ONLY) {
  if (changed) {
    console.log("\n❌ index.html 이 데이터와 어긋납니다 — `node tools/prerender-home.mjs` 를 실행하세요.");
    process.exit(1);
  }
  console.log("\n✅ 미리 심은 내용이 데이터와 일치합니다");
  process.exit(0);
}

if (!changed) {
  console.log("\n✅ 이미 최신입니다(바뀐 내용 없음)");
  process.exit(0);
}

fs.writeFileSync(path.join(ROOT, INDEX), next);
console.log(`\n✅ index.html 갱신 — ${kb(html.length)} → ${kb(next.length)}`);
