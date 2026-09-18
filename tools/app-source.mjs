#!/usr/bin/env node
/**
 * 앱 소스 읽기 — index.html(마크업·첫 페인트 부트스트랩) 과 assets/app.js(앱 스크립트).
 *
 * `docs/app-split-plan.md` 2단계(2026-09-18)에서 앱의 큰 인라인 <script> 를 assets/app.js
 * 파일로 옮겼습니다. 그래서 "앱 코드"를 읽는 도구들은 두 파일을 **이어 붙인** 문자열에서
 * 예전과 같은 방식(들여쓰기·마커 주석)으로 코드 블록을 떼어냅니다.
 *
 * 사용법:
 *   const { html, appJs, code } = readAppSource();
 *   · html  — index.html 만 (마크업 파싱 · 프리렌더 주입 대상)
 *   · appJs — assets/app.js 만 (앱 코드만 볼 때)
 *   · code  — html + appJs (코드 블록 추출용. 마크업이 앞이라 위치 기반 탐색도 그대로 통합니다)
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const INDEX_FILE = "index.html";
export const APP_SCRIPT_FILE = "assets/app.js";

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

export function readAppSource() {
  const html = read(INDEX_FILE);
  const appJs = read(APP_SCRIPT_FILE);
  return { html, appJs, code: html + "\n" + appJs };
}
