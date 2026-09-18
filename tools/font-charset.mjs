#!/usr/bin/env node
/**
 * 사이트가 실제로 화면에 내보내는 글자 집합 — 폰트 서브셋의 입력.
 *
 * 왜 필요한가:
 *   본문 서체를 CDN 의 dynamic subset 으로 받으면, 페이지가 쓰는 글자가 걸친 "조각"마다
 *   파일을 하나씩 내려받습니다(홈 첫 방문 39개 · 574KB). 실제로 쓰는 글자는 그 안의 일부라
 *   낭비가 큽니다. 그래서 **사이트에 나오는 글자만 담은 서브셋**을 직접 만들어 씁니다.
 *   이 파일이 그 입력(문자 집합)을 만드는 유일한 정의입니다 — Python 도구
 *   (`tools/make-font-subset.py`)와 감사(`tools/audit-site.mjs`)가 같은 정의를 씁니다.
 *
 * 하는 일:
 *   1) 화면에 글자가 나오는 파일(원본 + 데이터 + 생성된 정적 페이지)을 모두 읽어
 *      코드포인트 합집합을 만듭니다.
 *   2) 그 결과를 파일로 쓸 수 있습니다(`--out`) — Python 서브셋 도구가 이 파일을 먹습니다.
 *
 * 실행:
 *   node tools/font-charset.mjs                       # 통계만
 *   node tools/font-charset.mjs --out .cache/charset.txt
 * 종료 코드: 항상 0 (검사는 audit:site 가 합니다).
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * 글자가 나오는 파일들. 새 콘텐츠 파일을 추가하면 여기에도 넣어야 합니다
 * (빠뜨리면 그 글자가 서브셋에 없어 다른 글꼴로 보입니다 — `audit:site` 가 잡습니다).
 */
const ROOT_FILES = [
  "index.html",
  "404.html",
  "privacy.html",
  "terms.html",
  "manifest.webmanifest",
  "assets/app.css",
  "assets/site.css",
  "assets/app.js",
  "assets/speak.js",
];
const DIRS = [
  ["data", /\.js$/],
  ["units", /\.html$/],
  ["guides", /\.html$/],
  ["grammar", /\.html$/],
  ["conversation", /\.html$/],
];

/** 사이트 화면에 나오는 글자를 모두 모읍니다. */
export function collectCharset(root = ROOT) {
  const files = [];
  for (const f of ROOT_FILES) {
    if (fs.existsSync(path.join(root, f))) files.push(f);
  }
  for (const [dir, match] of DIRS) {
    const full = path.join(root, dir);
    if (!fs.existsSync(full)) continue;
    for (const name of fs.readdirSync(full)) {
      if (match.test(name) && fs.statSync(path.join(full, name)).isFile()) {
        files.push(`${dir}/${name}`);
      }
    }
  }

  const set = new Set();
  for (const rel of files) {
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    for (const ch of text) set.add(ch.codePointAt(0));
  }
  return { codepoints: [...set].sort((a, b) => a - b), files };
}

/** 코드포인트 목록을 fontTools 가 읽는 형식(`--unicodes-file`)으로. */
export function toUnicodeFile(codepoints) {
  return codepoints.map((c) => c.toString(16)).join(",") + "\n";
}

/** 0xAC00~0xD7A3 한글 음절 수. */
export const countHangul = (codepoints) => codepoints.filter((c) => c >= 0xac00 && c <= 0xd7a3).length;

/* 실행될 때만 통계를 찍습니다(다른 도구가 import 할 때는 조용히). */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { codepoints, files } = collectCharset();
  const outAt = process.argv.indexOf("--out");
  if (outAt >= 0 && process.argv[outAt + 1]) {
    const out = path.resolve(ROOT, process.argv[outAt + 1]);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, toUnicodeFile(codepoints));
    console.log(`→ ${path.relative(ROOT, out)} (${codepoints.length}자)`);
  }
  console.log(
    `사이트 글자 ${codepoints.length}자 (한글 음절 ${countHangul(codepoints)}자) · ` +
      `파일 ${files.length}개에서 수집`,
  );
}
