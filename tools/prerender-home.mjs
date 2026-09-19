#!/usr/bin/env node
/**
 * 홈 섹션 프리렌더 — index.html 안에 정적 콘텐츠를 미리 심습니다.
 *
 * 왜 필요한가:
 *   홈은 대부분의 섹션을 JavaScript 로 그립니다. 그래서
 *     ① 자바스크립트를 실행하지 않는 크롤러(네이버 Yeti)는 내용을 읽지 못하고,
 *     ② 자바스크립트를 끈 사용자는 제목만 있는 빈 화면을 봅니다.
 *   단어 목록(units/)처럼 페이지를 따로 만들기에는 홈의 도구 섹션들이 서로 얽혀 있어,
 *   "읽을 수 있는 텍스트" 섹션만 홈 안에 미리 그려 넣습니다.
 *   (혼동 어휘 · 어근·접두사 · 단어 패밀리 · 빈도순 기출 어휘 · 어원 암기 팁 ·
 *    비즈니스 이메일 템플릿 · 말하기·쓰기 템플릿 · 동의어·반의어 · 리딩 지문 ·
 *    Part 7 복수 지문 · 전략 가이드 카드 · S&W 시험 구성·연습 · 30일 스프린트 · 빈출 숙어)
 *
 * 어떻게:
 *   index.html 에서 해당 섹션의 **앱 렌더 함수를 그대로 떼어내** 가짜 브라우저에서 실행하고,
 *   나온 HTML 을 같은 컨테이너에 심습니다. 그래서 화면에 보이는 모습과 미리 심은 내용이
 *   어긋날 수 없습니다(앱이 로드되면 어차피 같은 내용으로 다시 그립니다).
 *
 *   함께 넣는 것: <noscript> 목차 — 54개 섹션의 제목·설명과, 자바스크립트 없이 볼 수 있는
 *   정적 페이지(단어장·숙어·문법 교재·가이드) 링크.
 *
 *   실행 결과는 매번 같아야 합니다(두 번 그려 비교해 확인합니다). 날짜·난수를 쓰는 섹션은
 *   넣지 않습니다 — 넣으면 커밋마다 내용이 달라져 `npm run verify` 가 실패합니다.
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
import { readAppSource } from "./app-source.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX = "index.html";
const CHECK_ONLY = process.argv.includes("--check");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

// html  — index.html (마크업 파싱 · 프리렌더 주입 대상)
// code  — index.html + assets/app.js (앱 렌더 함수·배열 추출용)
// 앱 스크립트는 2026-09-18 부터 assets/app.js 파일입니다(docs/app-split-plan.md 2단계).
const { html, code } = readAppSource();

/* ------------------------------------------------------------------ */
/* 1. 미리 그릴 섹션 목록                                               */
/*    ids:    index.html 의 컨테이너 id (한 함수가 여러 개를 채우기도 합니다) */
/*    vars:   그리는 데 필요한 값 — `var NAME = [...]` 는 배열, 그 밖에는 한 줄 선언 */
/*    render: 앱의 렌더 함수 이름                                        */
/*    args:   렌더 함수에 넘길 인자(문자열 그대로 실행됨) — 홈에 일부만 심을 때 */
/*    items:  로그에 쓸 항목 수 세는 정규식 (없으면 크기만 표시)             */
/* ------------------------------------------------------------------ */

const SECTIONS = [
  // 혼동 어휘도 참고 목록입니다 — 홈에는 앞의 6쌍만 심고 전체 20쌍은 units/confusion.html 이 담당합니다.
  { label: "혼동 어휘", ids: ["confuseGrid"], vars: ["CONFUSABLES"], render: "renderConfusables", args: "6", items: /confuse-card/g },
  { label: "어근·접두사", ids: ["wordpartGrid"], vars: ["WORD_PARTS"], render: "renderWordParts", items: /wordpart-card/g },
  { label: "단어 패밀리", ids: ["wordfamilyGrid"], vars: ["WORD_FAMILIES"], render: "renderWordFamilies", items: /wordfamily-card/g },
  // 빈도순 어휘는 200개짜리 참고 목록이라 별도 정적 페이지(units/frequency.html)로 뺐습니다.
  // 홈에는 앞의 20개만 심어 "무엇이 있는지" 보여 주고, 전체는 그 페이지가 담당합니다
  // (그래서 여기 items 는 20, 앱이 뜬 뒤 화면에 그려지는 개수는 200입니다).
  { label: "빈도순 기출 어휘", ids: ["freqGrid"], render: "renderFrequency", args: '"", 20', items: /freq-item/g },
  { label: "어원 암기 팁", ids: ["mnemonicGrid"], vars: ["MNEMONICS"], render: "renderMnemonics", items: /mnemonic-card/g },
  { label: "동의어·반의어", ids: ["relationGrid"], vars: ["RELATIONS"], render: "renderRelations", items: /relation-card/g },
  { label: "리딩 미니 지문", ids: ["readingGrid"], vars: ["READING_MINI"], render: "renderReadings", items: /reading-card/g },
  { label: "Part 7 복수 지문", ids: ["doubleReadingGrid"], vars: ["DOUBLE_READING", "drIdx"], render: "renderDoubleReading", items: /dr-card/g },
  { label: "이메일·회의 템플릿", ids: ["templateGrid"], vars: ["BIZ_TEMPLATES"], render: "renderTemplates", items: /reading-card/g },
  { label: "말하기·쓰기 템플릿", ids: ["speakTplGrid", "writeTplGrid"], render: "renderTplExtra", items: /reading-card/g },
  { label: "S&W 시험 구성·연습", ids: ["swFormatBox", "speakDrillBox", "writeDrillBox"], render: "renderSwExtra", items: /(?:sw-row|speaking-card|writing-card)/g },
  { label: "빈출 구동사·숙어", ids: ["idiomGrid"], vars: ["IDIOMS", "IDIOM_PAGE", "idiomShown"], render: "renderIdioms", items: /idiom-card/g },
  { label: "전략·공략 가이드", ids: ["guideCardGrid"], render: "renderGuides", items: /guide-card/g },
  { label: "30일 스프린트", ids: ["sprintBox"], vars: ["all"], render: "renderSprint", items: /sprint-item/g },
];

/* ------------------------------------------------------------------ */
/* 2. 소스에서 코드 블록 떼어내기                                       */
/* ------------------------------------------------------------------ */

/* 앱 코드는 최상위 선언을 두 칸 들여쓰기로 맞춰 두었습니다.
   그래서 "정확히 두 칸 + 닫는 괄호/대괄호"인 줄이 선언의 끝입니다.
   (중첩 블록은 더 깊이 들여쓰기 때문에 걸리지 않습니다.) */
const atLineStart = (needle) => {
  const re = new RegExp(`^${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m");
  const m = re.exec(code);
  if (!m) throw new Error(`앱 소스에서 ${needle.trim()} 를 찾지 못했습니다.`);
  return m.index;
};

/** startAt 이후에 나오는, 들여쓰기 level 칸짜리 닫는 줄의 끝 위치를 찾습니다. */
function endOfBlock(startAt, closer, level) {
  const line = " ".repeat(level) + closer;
  const lines = code.slice(startAt).split("\n");
  let offset = startAt;
  for (const text of lines) {
    if (offset > startAt && text === line) return offset + text.length;
    offset += text.length + 1;
  }
  throw new Error(`닫는 줄(${line})을 찾지 못했습니다.`);
}

/**
 * `var NAME = ...` 선언을 통째로 떼어냅니다.
 * 배열(여러 줄)이면 닫는 `];` 까지, 그 밖의 한 줄 선언이면 그 줄만 가져옵니다.
 * 들여쓰기는 줄에 따라 다릅니다 — 데이터 배열은 data/app-data.js 에 0칸,
 * 앱 상태 변수는 assets/app.js 에 2칸으로 있습니다. 그래서 선언 줄의 들여쓰기를 읽어
 * 같은 깊이의 닫는 줄까지 가져옵니다.
 */
function extractVar(name) {
  const arrayRe = new RegExp(`^([ \\t]*)var ${name} = \\[`, "m");
  const arr = arrayRe.exec(code);
  if (arr) {
    const lineEnd = code.indexOf("\n", arr.index);
    const firstLine = code.slice(arr.index, lineEnd === -1 ? code.length : lineEnd);
    // 한 줄에서 닫히는 배열(`var all = [];`)은 그 줄만 씁니다.
    // 그냥 아래로 훑으면 멀리 있는 다른 `];` 까지 삼켜 엉뚱한 코드를 실행하게 됩니다
    // (예전에는 우연히 동작했지만, 데이터를 파일로 나누면서 드러났습니다).
    if (!/\]\s*;\s*$/.test(firstLine)) {
      return code.slice(arr.index, endOfBlock(arr.index, "];", arr[1].length));
    }
  }
  const re = new RegExp(`^[ \\t]*var ${name} = .*;$`, "m");
  const m = re.exec(code);
  if (!m) throw new Error(`앱 소스에서 var ${name} 선언을 찾지 못했습니다.`);
  return m[0];
}

/** `  function NAME(...) {...}` 정의를 통째로 떼어냅니다. */
function extractFunction(name) {
  const at = atLineStart(`  function ${name}(`);
  return code.slice(at, endOfBlock(at, "}", 2));
}

/* ------------------------------------------------------------------ */
/* 3. 가짜 브라우저에서 앱 렌더 함수를 실행해 HTML 얻기                  */
/* ------------------------------------------------------------------ */

const dataCtx = { window: {} };
vm.createContext(dataCtx);
vm.runInContext(read("data/extra.js"), dataCtx, { filename: "data/extra.js", timeout: 5000 });
const EXTRA = dataCtx.window.TOEIC_EXTRA || {};

/**
 * 컨테이너 하나를 흉내 냅니다.
 *
 * 앱의 렌더 함수는 `grid.innerHTML = ...` 만 하는 것도 있고(대부분),
 * `createElement` + `appendChild` 로 카드를 붙이거나(숙어), `querySelectorAll` 로
 * 안쪽 버튼에 이벤트를 다는 것도 있습니다. 그래서 그 정도만 흉내 냅니다.
 */
function makeElement(id) {
  let stored = "";
  const element = {
    id,
    className: "",
    textContent: "",
    hidden: false,
    style: {},
    set innerHTML(value) {
      stored = String(value);
    },
    get innerHTML() {
      return stored;
    },
    appendChild(child) {
      // 앱은 createElement("div") 로 카드를 만든 뒤 className 을 붙여 appendChild 합니다.
      // 그래서 카드 껍데기(div + class)까지 그대로 재현해야 스타일이 어긋나지 않습니다.
      const cls = child.className ? ` class="${child.className}"` : "";
      stored += `<div${cls}>${child.innerHTML}</div>`;
    },
    querySelector: () => makeElement(`${id}-child`),
    querySelectorAll: () => [],
    addEventListener() {},
    setAttribute() {},
    getAttribute: () => null,
    classList: { add() {}, remove() {}, toggle: () => false, contains: () => false },
  };
  return element;
}

const elements = new Map();
const elementOf = (id) => {
  if (!elements.has(id)) elements.set(id, makeElement(id));
  return elements.get(id);
};

const sandbox = {
  EXTRA,
  console,
  document: {
    getElementById: elementOf,
    createElement: (tag) => makeElement(`created-${tag}`),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
  },
  window: { TOEIC_EXTRA: EXTRA, addEventListener() {}, requestIdleCallback: null },
};
vm.createContext(sandbox);

// 숙어 섹션은 data/idioms.js 가 채우는 window.VOCAB_IDIOMS 를 씁니다(앱과 같은 데이터).
vm.runInContext(read("data/idioms.js"), sandbox, { filename: "data/idioms.js", timeout: 5000 });

// 앱의 도우미(esc·escapeAttr·ttsBtn)도 그대로 씁니다 — 그래야 마크업이 앱과 같습니다.
vm.runInContext(
  [
    extractFunction("esc"),
    extractFunction("escapeAttr"),
    extractFunction("ttsBtn"),
    // 30일 스프린트는 단원 진행률을 함께 보여줍니다(여기서는 목록이 비어 0% 로 계산됩니다 —
    // 앱이 뜨면 실제 진행률로 다시 그립니다).
    extractFunction("unitProgressOf"),
  ].join("\n"),
  sandbox,
  { filename: "assets/app.js:helpers", timeout: 5000 },
);

/** 한 섹션을 그려서 컨테이너별 HTML 을 돌려줍니다. */
function renderSection(section) {
  for (const id of section.ids) elementOf(id).innerHTML = "";
  for (const name of section.vars || []) {
    vm.runInContext(extractVar(name), sandbox, { filename: `assets/app.js:var ${name}`, timeout: 5000 });
  }
  vm.runInContext(extractFunction(section.render), sandbox, { filename: `assets/app.js:${section.render}`, timeout: 5000 });
  vm.runInContext(`${section.render}(${section.args || ""});`, sandbox, {
    filename: `assets/app.js:${section.render}()`,
    timeout: 5000,
  });
  return section.ids.map((id) => ({ id, html: elementOf(id).innerHTML }));
}

const rendered = [];
for (const section of SECTIONS) {
  const first = renderSection(section);
  const empty = first.filter((c) => !c.html || c.html.length < 40);
  if (empty.length) {
    throw new Error(`${section.label}(${section.render}) 결과가 비어 있습니다 — ${empty.map((c) => c.id).join(", ")}`);
  }
  for (const cell of first) {
    if (/undefined|\[object Object\]|NaN/.test(cell.html)) {
      throw new Error(`${section.label}(${cell.id}) 결과에 값이 비어 있는 자리가 있습니다.`);
    }
  }

  // 두 번 그려 같은지 확인합니다 — 날짜·난수를 쓰면 커밋마다 내용이 달라집니다.
  const again = renderSection(section);
  if (JSON.stringify(again) !== JSON.stringify(first)) {
    throw new Error(`${section.label}(${section.render}) 결과가 실행할 때마다 달라집니다(난수·날짜 사용?).`);
  }

  const items = first.reduce((n, c) => n + (c.html.match(section.items) || []).length, 0);
  rendered.push({ ...section, cells: first, items });
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
  ["units/frequency.html", "빈도순 기출 어휘 200선"],
  ["units/confusion.html", "헷갈리는 단어 20쌍"],
  ["units/idioms.html", "빈출 구동사·숙어 126개"],
  ["grammar/", "문법 교재 3단계 (36과 · 연습 288문항)"],
  ["grammar/cheatsheet.html", "문법 한 장 요약"],
  ["conversation/", "영어회화 교재 3단계 (36과 · 연습 288문항)"],
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
  ...sections.map((s, i) => `      <li><b>${i + 1}. ${s.title}</b>${s.sub ? " — " + s.sub : ""}</li>`),
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
function injectIntoContainer(src, id, cellHtml) {
  const { start, end } = markers(id);
  const block = `${start}\n${cellHtml}\n${end}`;
  const si = src.indexOf(start);
  if (si >= 0) {
    const ei = src.indexOf(end, si);
    if (ei < 0) throw new Error(`${id}: prerender:end 주석이 없습니다.`);
    return src.slice(0, si) + block + src.slice(ei + end.length);
  }
  // 첫 실행: 빈 컨테이너를 찾아 안쪽에 넣습니다.
  const re = new RegExp(`<[a-z]+[^>]*\\bid="${id}"[^>]*>`);
  const m = re.exec(src);
  if (!m) throw new Error(`${id}: 컨테이너를 찾지 못했습니다.`);
  const inner = src.slice(m.index + m[0].length, src.indexOf("</div>", m.index));
  if (inner.trim()) {
    throw new Error(`${id}: 컨테이너가 비어 있지 않습니다. 먼저 기존 내용을 정리하세요.`);
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
for (const section of rendered) {
  for (const cell of section.cells) next = injectIntoContainer(next, cell.id, cell.html);
}
next = injectNoscript(next);

/* ------------------------------------------------------------------ */

const changed = next !== html;
const kb = (n) => (n / 1024).toFixed(1) + "KB";

console.log("🧩 홈 섹션 프리렌더");
for (const s of rendered) {
  const size = s.cells.reduce((n, c) => n + c.html.length, 0);
  console.log(
    `   · ${s.label.padEnd(16)} ${s.cells.map((c) => c.id).join(", ").padEnd(28)} 항목 ${String(s.items).padStart(3)}개  ${kb(size)}`,
  );
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
