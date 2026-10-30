import assert from "node:assert/strict";
import { collectItems, fingerprint, summarize } from "./content-review.mjs";

const items = collectItems();
assert(items.length > 2000);
assert.equal(new Set(items.map((i) => i.id)).size, items.length);
const item = items[0];
const review = { id: item.id, hash: item.hash, status: "approved", reviewer: "검수자", note: "확인", reviewed_at: "2026-01-01T00:00:00Z" };
assert.equal(summarize(items, []).counts.pending, items.length);
assert.equal(summarize(items, [review]).items[0].review_status, "approved");
assert.equal(summarize(items, [{ ...review, hash: fingerprint("old") }]).items[0].review_status, "stale");
assert.equal(summarize(items, [review, { ...review, status: "needs_changes" }]).items[0].review_status, "needs_changes");
assert.deepEqual(summarize(items, [{ ...review, id: "removed" }]).orphaned, ["removed"]);
console.log(`✅ 콘텐츠 검수 추적 테스트 통과 (${items.length}개 대상)`);
