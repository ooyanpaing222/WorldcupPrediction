import test from "node:test";
import assert from "node:assert/strict";
import { formatMmtDateTime, mmtDateKey, mmtDayUtcRange } from "../src/lib/timezone";

test("groups fixtures by Myanmar Time date", () => {
  assert.equal(mmtDateKey("2026-06-20T17:29:00.000Z"), "2026-06-20");
  assert.equal(mmtDateKey("2026-06-20T17:30:00.000Z"), "2026-06-21");
});

test("builds UTC ranges for Myanmar Time days", () => {
  const range = mmtDayUtcRange("2026-06-20");
  assert.equal(range.start.toISOString(), "2026-06-19T17:30:00.000Z");
  assert.equal(range.end.toISOString(), "2026-06-20T17:30:00.000Z");
});

test("labels displayed times as MMT", () => {
  assert.match(formatMmtDateTime("2026-06-20T13:30:00.000Z"), /MMT$/);
});
