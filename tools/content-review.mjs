#!/usr/bin/env node
/** 사람 검수 대상 목록과 내용별 검수 이력. 실제 전문 검수를 대신하지 않습니다. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEDGER = path.join(ROOT, "docs/content-review-history.json");

function load(file) {
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, file), "utf8"), box, { filename: file, timeout: 5000 });
  return box.window;
}

export function fingerprint(content) {
  return crypto.createHash("sha256").update(JSON.stringify(content)).digest("hex");
}

export function collectItems() {
  const items = [];
  const add = (id, source, type, content) => items.push({ id, source, type, content, hash: fingerprint(content) });
  for (let i = 1; i <= 30; i++) {
    const file = `data/unit${String(i).padStart(2, "0")}.js`;
    (load(file).VOCAB_UNITS[i] || []).forEach((row, n) => add(`unit${i}:${n + 1}`, file, "어휘·번역", row));
  }
  (load("data/idioms.js").VOCAB_IDIOMS || []).forEach((row, n) => add(`idiom:${n + 1}`, "data/idioms.js", "숙어·번역", row));
  for (const kind of ["grammar", "conversation"]) {
    for (const level of ["basic", "intermediate", "advanced"]) {
      const file = `data/${kind}-${level}.js`;
      const data = load(file);
      for (const book of data[kind === "grammar" ? "GRAMMAR_BOOKS" : "CONVERSATION_BOOKS"] || []) {
        (book.chapters || []).forEach((chapter, ci) => {
          (chapter.points || []).forEach((point, pi) => (point.examples || []).forEach((example, ei) =>
            add(`${kind}:${level}:${ci + 1}:example:${pi + 1}:${ei + 1}`, file, "교재 예문·번역", example)));
          (chapter.practice || []).forEach((question, qi) =>
            add(`${kind}:${level}:${ci + 1}:question:${qi + 1}`, file, "교재 연습 문항", question));
        });
      }
    }
  }
  const extra = load("data/extra.js").TOEIC_EXTRA || {};
  for (const key of ["part1", "traps", "transitions", "prepositions", "part6", "part7", "part34", "paraphrase"]) {
    (extra[key] || []).forEach((entry, i) => add(`extra:${key}:${i + 1}`, "data/extra.js", "확장 문항·지문", entry));
  }
  return items;
}

export function summarize(items, history) {
  const latest = new Map();
  for (const entry of history) latest.set(entry.id, entry);
  const counts = { pending: 0, approved: 0, needs_changes: 0, stale: 0 };
  const result = items.map((item) => {
    const review = latest.get(item.id);
    const status = !review ? "pending" : review.hash !== item.hash ? "stale" : review.status;
    if (!(status in counts)) throw new Error(`알 수 없는 검수 상태: ${status}`);
    counts[status]++;
    return { ...item, review_status: status, review: review || null };
  });
  return { counts, items: result, orphaned: [...latest.keys()].filter((id) => !items.some((item) => item.id === id)) };
}

function readHistory() {
  const data = JSON.parse(fs.readFileSync(LEDGER, "utf8"));
  if (!Array.isArray(data)) throw new Error("검수 이력은 JSON 배열이어야 합니다.");
  return data;
}

function main(args) {
  const [command = "status", ...rest] = args;
  const items = collectItems();
  const history = readHistory();
  if (command === "record") {
    const [id, hash, reviewer, status, ...notes] = rest;
    const note = notes.join(" ").trim();
    const item = items.find((entry) => entry.id === id);
    if (!item || item.hash !== hash) throw new Error("항목 ID 또는 해시가 현재 원본과 다릅니다. 목록을 다시 내보내세요.");
    if (!reviewer?.trim() || !["approved", "needs_changes"].includes(status) || !note) {
      throw new Error("사용법: record <id> <hash> <검수자> <approved|needs_changes> <검수 메모>");
    }
    history.push({ id, hash, reviewer: reviewer.trim(), status, note, reviewed_at: new Date().toISOString() });
    fs.writeFileSync(LEDGER, JSON.stringify(history, null, 2) + "\n", "utf8");
    console.log(`검수 이력 기록: ${id} (${status})`);
    return;
  }
  const report = summarize(items, history);
  if (command === "export") {
    const output = rest[0];
    if (!output) throw new Error("사용법: export <프로젝트 안의 출력 JSON 경로>");
    const file = path.resolve(ROOT, output);
    const rel = path.relative(ROOT, file);
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel) || file === LEDGER) throw new Error("출력은 프로젝트 내부의 검수 이력과 다른 파일이어야 합니다.");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(report, null, 2) + "\n", "utf8");
    console.log(`검수 목록 저장: ${rel}`);
  } else if (command !== "status") {
    throw new Error("사용법: content-review.mjs status | export <경로> | record <id> <hash> <검수자> <approved|needs_changes> <검수 메모>");
  }
  console.log(`검수 대상 ${items.length}개 · 미검수 ${report.counts.pending} · 승인 ${report.counts.approved} · 수정 필요 ${report.counts.needs_changes} · 원본 변경 ${report.counts.stale} · 대상 삭제 ${report.orphaned.length}`);
  console.log("자동 감사 통과는 사람 또는 전문가 검수 완료를 뜻하지 않습니다.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(`검수 도구 오류: ${error.message}`); process.exitCode = 1; }
}
