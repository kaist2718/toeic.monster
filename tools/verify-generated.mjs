#!/usr/bin/env node
/**
 * 생성물 검증 — HEAD 의 생성 파일과 작업 트리를 비교합니다.
 *
 * 목적: "소스만 고치고 build 를 돌리지 않은 커밋"을 잡아내는 것.
 *   대상: units/ · guides/ · grammar/ · conversation/ · assets/ · 404.html · sitemap.xml
 *         (units/… 는 tools/build-pages.mjs 산출물, assets/app.css·app.js·fonts/*.woff2 는
 *          손으로 고치거나 별도 도구로 만드는 원본 — 섞여 있어도 "HEAD 와 같은가" 만 보면 되므로
 *          함께 둡니다. 폴더는 재귀적으로 훑습니다 — assets/fonts/… 도 검증 대상입니다.)
 *
 * <lastmod> 만 비교에서 제외하는 이유:
 *   sitemap.xml 의 <lastmod> 는 "data·index.html·assets/app.js 를 마지막으로 건드린 커밋 날짜"에서 나옵니다.
 *   빌드는 커밋 전에 돌리므로, 커밋이 만들어지는 순간 그 날짜가 하루 앞당겨집니다.
 *   즉 이 값을 비교 대상으로 두면 커밋 직후(그리고 CI 에서) 항상 실패합니다.
 *   실제로 잡아야 할 것은 "생성물을 커밋하지 않은 경우"이므로 <lastmod> 는 제외합니다.
 *
 * 실행:  node tools/verify-generated.mjs
 * 종료 코드: 차이가 있으면 1, 없으면 0
 *
 * 외부 의존성 없음(Node 내장 모듈만 사용).
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = ["units", "guides", "grammar", "conversation", "assets", "404.html", "sitemap.xml"];

const git = (args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
/** 이진 파일(폰트·이미지)은 utf8 로 읽으면 내용이 깨져 늘 "달라졌다"고 나옵니다. */
const gitBuffer = (args) =>
  execFileSync("git", args, { cwd: ROOT, encoding: "buffer", stdio: ["ignore", "pipe", "pipe"] });

/** 글자로 비교할 수 없는 파일(줄바꿈 정규화·<lastmod> 제외가 의미 없는) 확장자. */
const BINARY_EXT = new Set([".woff2", ".woff", ".png", ".jpg", ".jpeg", ".ico", ".gif"]);
const isBinary = (file) => BINARY_EXT.has(path.extname(file).toLowerCase());

/** 줄바꿈과 <lastmod> 값을 정규화해 내용만 비교한다. */
function normalize(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/<lastmod>[^<]*<\/lastmod>/g, "<lastmod/>");
}

/**
 * 작업 트리에서 대상 파일 목록을 모은다.
 * 폴더는 **재귀적으로** 순회합니다 — assets/ 아래에 폴더가 생겼을 때(assets/fonts/…)
 * 그 파일들이 검증 밖으로 빠져나가면 "빌드를 안 돌린 커밋"을 못 잡습니다.
 */
function collectWorkingFiles() {
  const out = [];
  const walk = (rel) => {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) return;
    if (fs.statSync(full).isFile()) {
      out.push(rel);
      return;
    }
    for (const name of fs.readdirSync(full)) walk(`${rel}/${name}`);
  };
  for (const target of TARGETS) walk(target);
  return out;
}

let trackedFiles = [];
try {
  trackedFiles = git(["ls-tree", "-r", "--name-only", "HEAD", "--", ...TARGETS])
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
} catch {
  console.log("⚠️  HEAD 를 읽을 수 없어 검증을 건너뜁니다(git 저장소가 아닐 수 있습니다).");
  process.exit(0);
}

const working = collectWorkingFiles();
const all = [...new Set([...trackedFiles, ...working])].sort();

const missing = [];
const extra = [];
const changed = [];

for (const file of all) {
  const onDisk = fs.existsSync(path.join(ROOT, file));
  const inHead = trackedFiles.includes(file);

  if (inHead && !onDisk) {
    missing.push(file);
    continue;
  }
  if (!inHead && onDisk) {
    extra.push(file);
    continue;
  }
  if (isBinary(file)) {
    const headBytes = gitBuffer(["show", `HEAD:${file}`]);
    const diskBytes = fs.readFileSync(path.join(ROOT, file));
    if (!headBytes.equals(diskBytes)) changed.push(file);
    continue;
  }
  const headText = git(["show", `HEAD:${file}`]);
  const diskText = fs.readFileSync(path.join(ROOT, file), "utf8");
  if (normalize(headText) !== normalize(diskText)) changed.push(file);
}

const problems = [
  ...changed.map((f) => `내용이 HEAD와 다릅니다 — ${f}`),
  ...extra.map((f) => `아직 커밋되지 않았습니다 — ${f}`),
  ...missing.map((f) => `HEAD에는 있는데 파일이 없습니다 — ${f}`),
];

console.log("🧾 생성물 검증 (units · guides · grammar · conversation · assets · 404.html · sitemap.xml)");
console.log(`   · 커밋된 파일 ${trackedFiles.length}개 · 작업 트리 파일 ${working.length}개`);
console.log("   · sitemap.xml 의 <lastmod> 는 커밋 시점에 따라 달라지므로 비교에서 제외");

if (problems.length) {
  console.log(`\n❌ 차이 ${problems.length}건`);
  problems.forEach((p) => console.log("   - " + p));
  console.log("\n   → `npm run build` 를 실행하고 생성된 파일을 함께 커밋하세요.");
  process.exit(1);
}
console.log("\n✅ 생성물이 HEAD와 일치합니다");
