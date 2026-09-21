// 빈도순 어휘 보강 2단계 — 재사용 커버리지 리포트 (docs/frequency-shorts-plan.md §4-1)
//
// 아직 8필드로 보강되지 않은 빈도 항목이 기존 문장 코퍼스에 이미 등장하는지 조사합니다.
// 코퍼스: 유닛 예문 · 동의어 치환 · 받아쓰기 · Part 1 사진 · Part 6/7 지문 · Part 2 함정 · 숫자 듣기.
// 이미 있는 문장을 후보로 쓰면 신규 작성량을 줄일 수 있습니다.
//
//   node tools/frequency-coverage.mjs            # 요약 + 미커버 목록
//   node tools/frequency-coverage.mjs --markdown # 표 형태(문서 붙여넣기용)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");

global.window = {};
await import(new URL("../data/extra.js", import.meta.url).href);
const extra = global.window.TOEIC_EXTRA || {};

// 유닛 단어장 + 예문
const vocab = {};
for (const f of fs.readdirSync(DATA).filter((n) => /^unit\d+\.js$/.test(n)).sort()) {
  await import(new URL(`../data/${f}`, import.meta.url).href);
}
const units = global.window.VOCAB_UNITS || {};
for (const id of Object.keys(units)) {
  for (const w of units[id] || []) {
    if (Array.isArray(w) && w.length >= 6) {
      (vocab[w[0].toLowerCase()] ||= []).push(w[4]);
    }
  }
}

// 코퍼스 문장 모으기 — { text, source }
const corpus = [];
const add = (text, source) => { if (text && typeof text === "string") corpus.push({ text, source }); };
for (const id of Object.keys(units)) for (const w of units[id] || []) add(w[4], "unit");
for (const p of extra.paraphrase || []) add(p.prompt, "paraphrase");
for (const d of extra.dictation || []) add(d, "dictation");
for (const p of extra.part1 || []) { add(p.scene, "part1"); for (const o of p.opts || []) add(o, "part1"); }
for (const t of extra.traps || []) add(t.audio, "traps");
for (const n of extra.numbers || []) add(n.audio, "numbers");
for (const s of extra.situations || []) for (const line of s.lines || []) add(line[1], "situations");
for (const p of extra.part6 || []) for (const ps of p.passages || []) add(ps.text, "part6");
for (const p of extra.part7 || []) for (const ps of p.passages || []) add(ps.text, "part7");

// 미보강 빈도 항목
const freq = extra.frequency || [];
const todo = freq.filter((r) => Array.isArray(r) && r.length < 8);
const enriched = freq.length - todo.length;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function hits(word) {
  const phrase = word.trim();
  const re = new RegExp(`\\b${esc(phrase)}\\b`, "i");
  return corpus.filter((c) => re.test(c.text));
}

const rows = todo.map((r) => {
  const word = r[0];
  const found = hits(word);
  const sources = [...new Set(found.map((f) => f.source))];
  return { word, meaning: r[1], count: found.length, sources, sample: found[0]?.text || "" };
});

const covered = rows.filter((r) => r.count > 0);
const uncovered = rows.filter((r) => r.count === 0);
const markdown = process.argv.includes("--markdown");

console.log(`빈도 항목        : ${freq.length}개 (보강 완료 ${enriched} · 미보강 ${todo.length})`);
console.log(`코퍼스 문장      : ${corpus.length}개`);
console.log(`재사용 후보 있음 : ${covered.length}개 (${Math.round(covered.length / todo.length * 100)}%)`);
console.log(`신규 작성 필요   : ${uncovered.length}개`);

if (markdown) {
  console.log("\n| 표제어 | 뜻 | 등장 수 | 출처 | 예문 후보 |");
  console.log("| --- | --- | --- | --- | --- |");
  for (const r of rows) {
    console.log(`| ${r.word} | ${r.meaning} | ${r.count} | ${r.sources.join(", ") || "-"} | ${(r.sample || "-").slice(0, 70)} |`);
  }
} else {
  console.log("\n--- 재사용 후보 (출처별 상위 25개) ---");
  for (const r of covered.slice(0, 25)) {
    console.log(`  ${r.word} [${r.sources.join(",")}] — ${r.sample.slice(0, 66)}`);
  }
  console.log("\n--- 신규 작성 필요 목록 ---");
  console.log("  " + uncovered.map((r) => r.word).join(", "));
}
