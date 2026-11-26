import { describe, expect, it } from "vitest";
import { ALL_PUZZLES, resolveDateKey, selectPuzzle } from "./puzzle";
import { addDays, localDateKey } from "./date";
import type { Puzzle } from "./types";

const make = (id: number, date: string): Puzzle => ({
  id,
  date,
  categoryA: { label: "A", emoji: "🅰️" },
  categoryB: { label: "B", emoji: "🅱️" },
  packages: [],
});

const SET = [make(1, "2026-01-01"), make(2, "2026-01-02"), make(3, "2026-01-03")];

describe("selectPuzzle", () => {
  it("returns the exact puzzle for its date", () => {
    expect(selectPuzzle("2026-01-02", SET).id).toBe(2);
  });

  it("falls back by cycling through puzzles after the last date", () => {
    const p4 = selectPuzzle("2026-01-04", SET);
    expect(p4.categoryA).toEqual(SET[0].categoryA);
    expect(p4.id).toBe(4);
    expect(p4.date).toBe("2026-01-04");
    expect(selectPuzzle("2026-01-05", SET).id).toBe(5);
    // Day 8 → offset 7 → index 1
    expect(selectPuzzle("2026-01-08", SET)).toMatchObject({ id: 8, date: "2026-01-08" });
  });

  it("cycles with the right source puzzle", () => {
    const sources = ["2026-01-04", "2026-01-05", "2026-01-06", "2026-01-07"].map(
      (d) => SET.findIndex((p) => p.categoryA === selectPuzzle(d, SET).categoryA),
    );
    expect(sources).toEqual([0, 1, 2, 0]);
  });

  it("handles dates before the first puzzle without crashing", () => {
    const p = selectPuzzle("2025-12-31", SET);
    expect(p.date).toBe("2025-12-31");
    expect(p.id).toBeGreaterThanOrEqual(1);
  });

  it("works with unsorted input", () => {
    const shuffled = [SET[2], SET[0], SET[1]];
    expect(selectPuzzle("2026-01-04", shuffled).id).toBe(4);
  });

  it("crosses a DST boundary without skipping a day", () => {
    const set = [make(1, "2026-03-07")];
    expect(selectPuzzle("2026-03-09", set).id).toBe(3);
    expect(selectPuzzle("2026-11-02", set).id).toBe(241);
  });

  it("never returns an empty puzzle for any day in the next two years", () => {
    const start = ALL_PUZZLES[0].date;
    for (let i = 0; i < 730; i++) {
      expect(selectPuzzle(addDays(start, i)).packages).toHaveLength(7);
    }
  });
});

describe("resolveDateKey", () => {
  const now = new Date(2026, 10, 24, 23, 30);

  it("uses the local date", () => {
    expect(resolveDateKey("", false, now)).toBe("2026-11-24");
    expect(localDateKey(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });

  it("honours ?date= only in dev", () => {
    expect(resolveDateKey("?date=2026-12-01", true, now)).toBe("2026-12-01");
    expect(resolveDateKey("?date=2026-12-01", false, now)).toBe("2026-11-24");
  });

  it("ignores invalid ?date= values", () => {
    expect(resolveDateKey("?date=2026-02-30", true, now)).toBe("2026-11-24");
    expect(resolveDateKey("?date=tomorrow", true, now)).toBe("2026-11-24");
  });
});

describe("puzzles.json content", () => {
  it("has unique ids and dates, and exactly 7 packages each", () => {
    expect(new Set(ALL_PUZZLES.map((p) => p.id)).size).toBe(ALL_PUZZLES.length);
    expect(new Set(ALL_PUZZLES.map((p) => p.date)).size).toBe(ALL_PUZZLES.length);
    for (const p of ALL_PUZZLES) {
      expect(p.packages, `puzzle ${p.id}`).toHaveLength(7);
      for (const pkg of p.packages) {
        expect(["A", "B", "NEITHER"]).toContain(pkg.answer);
        expect(pkg.reveal.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every generated puzzle at least 2 Neither items and a review flag", () => {
    for (const p of ALL_PUZZLES.filter((p) => p.id !== 1)) {
      expect(p.packages.filter((k) => k.answer === "NEITHER").length, `puzzle ${p.id}`).toBeGreaterThanOrEqual(2);
      expect(p.needsReview, `puzzle ${p.id}`).toBe(true);
    }
  });
});
