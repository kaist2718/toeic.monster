#!/usr/bin/env node
/**
 * 앱 소스 읽기 — index.html(마크업·첫 페인트 부트스트랩) 과 assets/app.js(앱 스크립트).
 *
 * `docs/app-split-plan.md` 2단계(2026-09-18)에서 앱의 큰 인라인 <script> 를 assets/app.js
 * 파일로 옮기고, 그 안의 데이터 배열도 data/app-data.js 로 나눴습니다.
 * 그래서 "앱 코드"를 읽는 도구들은 세 파일을 **이어 붙인** 문자열에서 예전과 같은
 * 방식(들여쓰기·마커 주석)으로 코드 블록을 떼어냅니다.
 *
 * 사용법:
 *   const { html, appData, appJs, code } = readAppSource();
 *   · html    — index.html 만 (마크업 파싱 · 프리렌더 주입 대상)
 *   · appData — data/app-data.js 만 (학습 데이터 배열)
 *   · appJs   — assets/app.js 만 (앱 코드만 볼 때)
 *   · code    — html + appData + appJs (코드 블록 추출용. 데이터가 코드보다 먼저라
 *               `var NAME = [...]` 는 데이터 파일에서, 함수는 앱 코드에서 먼저 찾습니다)
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const INDEX_FILE = "index.html";
export const APP_SCRIPT_FILE = "assets/app.js";
export const APP_DATA_FILE = "data/app-data.js";

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

export function readAppSource() {
  const html = read(INDEX_FILE);
  const appData = read(APP_DATA_FILE);
  const appJs = read(APP_SCRIPT_FILE);
  // 데이터가 코드보다 앞입니다 — `var NAME = [...]` 를 데이터 파일에서 먼저 찾습니다.
  return { html, appData, appJs, code: html + "\n" + appData + "\n" + appJs };
}
