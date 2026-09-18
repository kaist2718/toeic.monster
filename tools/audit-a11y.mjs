#!/usr/bin/env node
/**
 * toeic.monster 접근성 · 성능 예산 감사 도구.
 *
 * 왜 필요한가:
 *   기존 감사는 "내용(콘텐츠)"과 "구조(링크·메타)"를 봤지만, **화면을 쓰는 방식**은
 *   사람이 눈으로 보거나(`docs/ux-review.md`) 브라우저 점검(`check-browser.mjs`)이
 *   손으로 고른 항목만 봤습니다. 그래서 색 대비·이름 없는 컨트롤·예산 초과처럼
 *   "새로 만든 화면에서 조용히 어긋나는" 것들이 게이트를 통과했습니다.
 *
 *   여기서는 **모든 페이지**를 기계적으로 훑어 잡습니다.
 *
 * 보는 것:
 *   1) 문서 뼈대 — lang · title · viewport · h1 하나 · 제목 단계 건너뛰기
 *   2) 이름(라벨) — 입력·선택 상자에 접근 가능한 이름, label[for] 대상, 그림 alt
 *   3) ARIA 참조 — aria-labelledby·describedby·controls 가 실제 id 를 가리키는지
 *   4) 키보드 — 양수 tabindex 없음, 전역 초점 표시(:focus-visible) 규칙 존재, 본문 바로가기
 *   5) 새 창 링크 — target="_blank" 에 rel=noopener/noreferrer
 *   6) 색 대비 — 같은 규칙에서 글자색·배경색을 함께 지정한 곳의 WCAG 대비(라이트·다크 토큰 기준)
 *   7) 성능 예산 — 파일 크기 상한, head 의 동기 스크립트, 데이터 스크립트 defer, font-display
 *
 * 실행:  node tools/audit-a11y.mjs
 * 종료 코드: 문제가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readAppSource } from "./app-source.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const has = (p) => fs.existsSync(path.join(ROOT, p));
const size = (p) => (has(p) ? fs.statSync(path.join(ROOT, p)).size : 0);

const problems = [];
const notes = [];
const fail = (msg) => problems.push(msg);
const note = (msg) => notes.push(msg);

/* ------------------------------------------------------------------ */
/* 0. 대상 페이지                                                      */
/* ------------------------------------------------------------------ */

const pages = ["index.html", "404.html", "privacy.html", "terms.html"];
for (const dir of ["units", "guides", "grammar", "conversation"]) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) continue;
  for (const name of fs.readdirSync(full).sort()) {
    if (name.endsWith(".html")) pages.push(`${dir}/${name}`);
  }
}
const existing = pages.filter(has);

/** 화면에 실제로 나오는 컨트롤·id 는 앱 스크립트가 만드는 것도 있습니다 — 함께 봅니다. */
const { html: homeHtml, code: appCode } = readAppSource();
const appSource = `${homeHtml}\n${appCode}`;

/** script·style 본문을 지운 마크업(코드 안 문자열을 마크업으로 오해하지 않게). */
const stripCode = (src) =>
  src.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, "<script$1></script>").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");

const pagesSrc = new Map(existing.map((p) => [p, read(p)]));

/* ------------------------------------------------------------------ */
/* 1. 문서 뼈대                                                        */
/* ------------------------------------------------------------------ */

let langOk = 0;
const headingSkips = [];
for (const [page, src] of pagesSrc) {
  if (!/<html[^>]*\blang="ko"/i.test(src)) fail(`${page}: <html lang="ko"> 가 없습니다(화면 읽기 도구가 발음을 정하지 못합니다).`);
  else langOk++;
  if (!/<title>[^<]{5,}<\/title>/i.test(src)) fail(`${page}: <title> 이 없거나 너무 짧습니다.`);
  if (!/<meta[^>]*name="viewport"/i.test(src)) fail(`${page}: viewport 메타 태그가 없습니다(모바일에서 확대된 채 열립니다).`);

  const mark = stripCode(src);
  const h1 = [...mark.matchAll(/<h1\b/gi)].length;
  if (h1 !== 1) fail(`${page}: <h1> 이 ${h1}개입니다(문서당 하나여야 화면 구조가 분명해집니다).`);

  // 제목 단계 건너뛰기 (h2 → h4). 화면 읽기 도구의 목차 탐색이 어긋납니다.
  const levels = [...mark.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  let prev = levels[0] || 1;
  for (const lv of levels.slice(1)) {
    if (lv - prev > 1) { headingSkips.push(`${page} h${prev}→h${lv}`); break; }
    prev = lv;
  }
}
if (headingSkips.length) fail(`제목 단계를 건너뛴 곳이 있습니다 — ${headingSkips.slice(0, 4).join(", ")}`);
note(`문서 뼈대: 페이지 ${existing.length}개 · lang="ko" ${langOk}개 · 제목 단계 정상`);

/* ------------------------------------------------------------------ */
/* 2. 이름(라벨)                                                       */
/* ------------------------------------------------------------------ */

const labeledControls = { total: 0, named: 0 };
const badLabels = [];
for (const [page, src] of pagesSrc) {
  const mark = stripCode(src);
  const ids = new Set([...mark.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const labelFor = new Set([...mark.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));

  // 2-1. 입력 상자는 접근 가능한 이름이 있어야 합니다(aria-label · label[for] · aria-labelledby · title).
  for (const m of mark.matchAll(/<(input|select|textarea)\b[^>]*>/gi)) {
    const tag = m[0];
    if (/\btype="(?:hidden|submit|button)"/i.test(tag)) continue;
    labeledControls.total++;
    const id = (tag.match(/\bid="([^"]+)"/) || [])[1];
    const named =
      /\baria-label(?:ledby)?="/i.test(tag) || /\btitle="/i.test(tag) || (id && labelFor.has(id));
    if (named) labeledControls.named++;
    else badLabels.push(`${page} ${tag.slice(0, 60)}`);
  }

  // 2-2. label[for] 는 실제 컨트롤을 가리켜야 합니다.
  for (const f of labelFor) {
    if (!ids.has(f)) fail(`${page}: <label for="${f}"> 가 가리키는 컨트롤이 없습니다.`);
  }

  // 2-3. 그림이 있으면 alt 가 있어야 합니다(지금은 그림이 없지만, 생기면 걸리게).
  for (const m of mark.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=/i.test(m[0])) fail(`${page}: <img> 에 alt 가 없습니다 — ${m[0].slice(0, 60)}`);
  }

  // 2-4. 글자 없는 버튼(아이콘 버튼)은 aria-label 이 있어야 합니다.
  for (const m of mark.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
    const tag = m[0];
    const inner = m[1].replace(/<[^>]+>/g, "").replace(/[\s\u200b]/g, "");
    if (!inner && !/\baria-label="/i.test(tag) && !/\btitle="/i.test(tag)) {
      fail(`${page}: 글자도 aria-label 도 없는 버튼이 있습니다 — ${tag.slice(0, 70)}`);
    }
  }
}
if (badLabels.length) {
  fail(
    `접근 가능한 이름이 없는 입력 요소 ${badLabels.length}개 — ${badLabels.slice(0, 3).join(" / ")}\n` +
      "     → aria-label 이나 <label for> 를 붙이세요.",
  );
}
note(`입력 요소 ${labeledControls.total}개 중 ${labeledControls.named}개에 이름이 있습니다`);

/* ------------------------------------------------------------------ */
/* 3. ARIA 참조 무결성                                                 */
/* ------------------------------------------------------------------ */

// 앱이 만드는 요소까지 포함해야 오탐이 없습니다(index.html 만 보면 앱 상자를 놓칩니다).
const appIds = new Set([...appSource.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
const brokenRefs = [];
for (const [page, src] of pagesSrc) {
  const ids = page === "index.html" ? appIds : new Set([...stripCode(src).matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const attr of ["labelledby", "describedby", "controls", "owns"]) {
    for (const m of src.matchAll(new RegExp(`\\baria-${attr}="([^"]+)"`, "gi"))) {
      for (const target of m[1].split(/\s+/).filter(Boolean)) {
        if (!ids.has(target)) brokenRefs.push(`${page} aria-${attr}="${target}"`);
      }
    }
  }
}
if (brokenRefs.length) {
  fail(`ARIA 가 없는 id 를 가리킵니다 — ${brokenRefs.slice(0, 4).join(", ")} (총 ${brokenRefs.length}건)`);
}

/* ------------------------------------------------------------------ */
/* 4. 키보드                                                           */
/* ------------------------------------------------------------------ */

const positiveTabindex = [];
for (const [page, src] of pagesSrc) {
  for (const m of stripCode(src).matchAll(/\btabindex="(\d+)"/gi)) {
    if (Number(m[1]) > 0) positiveTabindex.push(`${page} tabindex="${m[1]}"`);
  }
}
if (positiveTabindex.length) {
  fail(`양수 tabindex 는 탭 순서를 뒤섞습니다 — ${positiveTabindex.slice(0, 4).join(", ")}`);
}

// 전역 초점 표시 — 키보드 사용자가 "지금 어디에 있는지"를 볼 수 있어야 합니다.
// 브라우저 기본 표시를 그대로 두는 파일은 통과입니다(지우면서 대안이 없을 때만 실패).
const cssFiles = ["assets/app.css", "assets/site.css"].filter(has);
for (const file of cssFiles) {
  const css = read(file);
  const stripsOutline = /outline\s*:\s*(?:none|0)\b/.test(css);
  if (stripsOutline && !/:focus-visible/.test(css)) {
    fail(`${file}: 초점 테둘레를 지우면서 :focus-visible 대안이 없습니다(키보드 사용자가 현재 위치를 못 봅니다).`);
  } else if (!/:focus-visible/.test(css)) {
    note(`${file}: :focus-visible 규칙 없이 브라우저 기본 초점 표시를 그대로 씁니다`);
  }
}

// 본문 바로가기 — 본문 앞에 이동 수단(링크 뭉치)이 있는 페이지에는 있어야 합니다.
// (링크가 제목뿐인 약관 페이지 같은 곳은 Tab 한두 번으로 본문에 닿습니다 — 요구하지 않습니다.)
const noSkip = [];
for (const [page, src] of pagesSrc) {
  const mainAt = src.search(/<main\b/i);
  const before = mainAt > 0 ? src.slice(0, mainAt) : "";
  const navLinks = [...before.matchAll(/<a\b[^>]*href=/gi)].length;
  if (navLinks >= 3 && !/class="skip-link"/.test(src)) noSkip.push(`${page}(본문 앞 링크 ${navLinks}개)`);
}
if (noSkip.length) fail(`본문 바로가기 링크(a.skip-link)가 없는 페이지 — ${noSkip.slice(0, 4).join(", ")}`);

/* ------------------------------------------------------------------ */
/* 5. 새 창 링크                                                       */
/* ------------------------------------------------------------------ */

const unsafeBlank = [];
for (const [page, src] of pagesSrc) {
  for (const m of stripCode(src).matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*(?:noopener|noreferrer)/i.test(m[0])) unsafeBlank.push(`${page} ${m[0].slice(0, 60)}`);
  }
}
if (unsafeBlank.length) {
  fail(`target="_blank" 인데 rel=noopener/noreferrer 가 없습니다 — ${unsafeBlank.slice(0, 3).join(" / ")}`);
}

/* ------------------------------------------------------------------ */
/* 6. 색 대비 (같은 규칙에서 글자색·배경색을 함께 지정한 곳)             */
/* ------------------------------------------------------------------ */

/** CSS 토큰(:root 라이트 / html.dark-pending 다크)에서 --이름 → 색. */
function collectTokens(css) {
  const light = {};
  const dark = {};
  // 다크 토큰 블록은 `body.dark,\n html.dark-pending { … }` 처럼 여러 줄·선택자 목록일 수 있습니다.
  const rootBlock = css.match(/:root\s*\{([^}]*)\}/);
  const darkBlock = css.match(/body\.dark[^{}]*\{([^}]*)\}/) || css.match(/html\.dark-pending[^{}]*\{([^}]*)\}/);
  for (const [target, block] of [
    [light, rootBlock],
    [dark, darkBlock],
  ]) {
    if (!block) continue;
    for (const m of block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) target[m[1]] = m[2].trim();
  }
  return { light, dark };
}

const parseColor = (value, tokens, depth = 0) => {
  if (!value || depth > 3) return null;
  const v = String(value).trim();
  const varMatch = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
  if (varMatch) {
    const resolved = tokens[varMatch[1]];
    return parseColor(resolved !== undefined ? resolved : varMatch[2], tokens, depth + 1);
  }
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = v.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.%]+))?\s*\)$/i);
  if (rgb) {
    const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]);
    if (alpha < 1) return null; // 반투명 배경은 아래 깔린 색을 알 수 없어 건너뜁니다
    return [Math.round(Number(rgb[1])), Math.round(Number(rgb[2])), Math.round(Number(rgb[3]))];
  }
  return null;
};
const luminance = ([r, g, b]) => {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/**
 * 선택자별 "효과적인 글자색·배경색"을 모읍니다.
 *  - `body.dark .x { color: … }` 처럼 다크 전용 규칙은 **기본 규칙 위에 덮어써**야
 *    맞습니다(안 그러면 라이트 색을 다크 토큰으로 풀어 1.85:1 같은 거짓 문제가 생깁니다).
 */
/** `@media print { … }` 블록을 통째로 들어냅니다(화면이 아닌 인쇄용 색을 보고 판단하지 않게). */
function stripPrintBlocks(css) {
  let out = css;
  for (;;) {
    const at = out.indexOf("@media print");
    if (at < 0) return out;
    let i = out.indexOf("{", at);
    if (i < 0) return out;
    let depth = 0;
    let end = i;
    for (; end < out.length; end++) {
      if (out[end] === "{") depth++;
      else if (out[end] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    out = out.slice(0, at) + out.slice(end + 1);
  }
}

function effectivePairs(css, theme) {
  const rules = [];
  // 주석을 지우고 파싱합니다 — "/* 설명 */ .x" 처럼 선택자 앞 주석이 끼면 다른 규칙으로 보입니다.
  const clean = stripPrintBlocks(css).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const rule of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = rule[2];
    const color = (body.match(/(?:^|;)\s*color\s*:\s*([^;]+)/) || [])[1];
    const bg = (body.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/) || [])[1];
    if (!color && !bg) continue;
    if (bg && /gradient|url\(/i.test(bg)) continue; // 그라데이션·이미지 배경은 계산할 수 없습니다
    for (const raw of rule[1].split(",")) {
      const sel = raw.trim().replace(/\s+/g, " ");
      const dark = /^(?:body\.dark|html\.dark-pending|html\.dark)\s+/.test(sel);
      rules.push({ key: sel.replace(/^(?:body\.dark|html\.dark-pending|html\.dark)\s+/, ""), dark, color, bg });
    }
  }
  const out = new Map();
  for (const r of rules) {
    if (r.dark && theme === "light") continue;
    const cur = out.get(r.key) || {};
    if (r.color) cur.color = r.color;
    if (r.bg) cur.bg = r.bg;
    out.set(r.key, cur);
  }
  return out;
}

const contrastFails = [];
const contrastWarns = [];
for (const file of cssFiles) {
  const css = read(file);
  const { light, dark } = collectTokens(css);
  if (!Object.keys(dark).length) {
    fail(`${file}: 다크 테마 색 토큰(body.dark)을 찾지 못했습니다 — 색 대비를 다크 모드까지 확인할 수 없습니다.`);
  }
  for (const [mode, label, tokens] of [["light", "라이트", light], ["dark", "다크", dark]]) {
    for (const [key, pair] of effectivePairs(css, mode)) {
      const fg = parseColor(pair.color, tokens);
      const bg = parseColor(pair.bg, tokens);
      if (!fg || !bg) continue;
      const ratio = Number(contrast(fg, bg).toFixed(2));
      const where = `${file} ${key.slice(0, 40)} (${label}) ${ratio}:1`;
      if (ratio < 3) contrastFails.push(where);
      else if (ratio < 4.5) contrastWarns.push(where);
    }
  }
}
if (contrastFails.length) {
  const shown = contrastFails.slice(0, 8).join(", ");
  fail(
    `색 대비가 3:1 미만인 곳이 있습니다(WCAG 최소) — ${shown}` +
      (contrastFails.length > 8 ? ` 외 ${contrastFails.length - 8}곳` : ""),
  );
}
if (contrastWarns.length) {
  note(`색 대비 3~4.5:1 (본문 기준 미달, 큰 글자는 통과) ${contrastWarns.length}곳 — ${contrastWarns.slice(0, 3).join(", ")}`);
}

/* ------------------------------------------------------------------ */
/* 7. 성능 예산                                                        */
/* ------------------------------------------------------------------ */

// "이 선을 넘으면 왜 늘었는지 확인한다"는 상한입니다. 지금 값에서 20% 남짓 여유를 둡니다.
const BUDGETS = [
  ["index.html", 300 * 1024, "프리렌더·마크업 — 늘면 docs/prerender-split-plan.md 의 기준을 다시 봅니다"],
  ["assets/app.js", 330 * 1024, "앱 스크립트 — 늘면 docs/app-split-plan.md 3단계(코드 분리)를 다시 봅니다"],
  ["assets/app.css", 100 * 1024, "앱 스타일"],
  ["assets/site.css", 20 * 1024, "정적 페이지 공용 스타일"],
  ["assets/fonts/pretendard-variable.woff2", 250 * 1024, "본문 서체 서브셋 — 글자가 늘었으면 tools/make-font-subset.py 재실행"],
  ["data/app-data.js", 110 * 1024, "앱 학습 데이터"],
  ["data/extra.js", 240 * 1024, "확장 콘텐츠(지연 로드)"],
];
const overBudget = [];
for (const [file, cap, why] of BUDGETS) {
  const bytes = size(file);
  if (!bytes) { fail(`예산 대상 파일이 없습니다 — ${file}`); continue; }
  if (bytes > cap) overBudget.push(`${file} ${(bytes / 1024).toFixed(1)}KB > ${(cap / 1024).toFixed(0)}KB (${why})`);
}
if (overBudget.length) fail(`성능 예산을 넘었습니다 — ${overBudget.join(" / ")}`);

// head 에서 동기로 실행되는 스크립트(외부 src) — 파싱이 그만큼 멈춥니다.
const blockingScripts = [];
for (const [page, src] of pagesSrc) {
  const head = src.slice(0, src.indexOf("</head>"));
  for (const m of head.matchAll(/<script\b([^>]*)\bsrc="([^"]+)"/gi)) {
    if (!/\b(?:defer|async)\b/i.test(m[1])) blockingScripts.push(`${page} ${m[2]}`);
  }
}
if (blockingScripts.length) {
  fail(`head 에서 파싱을 막는 스크립트가 있습니다(defer/async 없음) — ${blockingScripts.slice(0, 3).join(", ")}`);
}

// 첫 화면 데이터 스크립트는 모두 defer — 하나라도 빠지면 그만큼 첫 페인트가 늦어집니다.
const homeScripts = [...stripCode(pagesSrc.get("index.html") || "").matchAll(/<script\b[^>]*src="((?:\.\/)?data\/[^"]+)"/g)];
const notDeferred = homeScripts.filter((m) => !/\bdefer\b/.test(m[0])).map((m) => m[1]);
if (notDeferred.length) fail(`index.html 의 데이터 스크립트가 defer 가 아닙니다 — ${notDeferred.join(", ")}`);

// 서체는 도착 전에 시스템 글꼴로 먼저 그려야 합니다(안 그러면 첫 페인트가 폰트를 기다립니다).
const fontCss = cssFiles.map(read).join("\n");
if (!/font-display\s*:\s*swap/.test(fontCss)) {
  fail("본문 서체에 font-display: swap 이 없습니다 — 첫 페인트가 폰트를 기다립니다.");
}

note(
  `성능 예산: ` +
    BUDGETS.map(([f, cap]) => `${f.split("/").pop()} ${(size(f) / 1024).toFixed(1)}/${(cap / 1024).toFixed(0)}KB`).slice(0, 4).join(" · "),
);

/* ------------------------------------------------------------------ */

console.log("♿ 접근성 · 성능 예산 감사");
console.log(`   · 페이지 ${existing.length}개 · 스타일 ${cssFiles.length}개 · 입력 요소 ${labeledControls.total}개`);
console.log(`   · 색 대비 검사 ${contrastFails.length + contrastWarns.length}곳 보고(3:1 미만 ${contrastFails.length} · 3~4.5:1 ${contrastWarns.length})`);

if (notes.length) {
  console.log("\nℹ️  참고 (실패 아님)");
  notes.forEach((n) => console.log("   - " + n));
}
if (problems.length) {
  console.log(`\n❌ 문제 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  process.exit(1);
}
console.log("\n✅ 접근성·예산 점검 모두 통과");
