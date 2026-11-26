import { beforeEach, describe, expect, it } from "vitest";
import { applyResult, currentStreakOn, emptyStats, loadGame, loadStats, submitResult, winPercent } from "./storage";
import { ALL_PUZZLES } from "./puzzle";

describe("applyResult streaks", () => {
  it("starts a streak on the first win", () => {
    const s = applyResult(emptyStats(), "2026-11-24", 6);
    expect(s).toMatchObject({ gamesPlayed: 1, wins: 1, currentStreak: 1, maxStreak: 1, lastWinDate: "2026-11-24" });
    expect(s.distribution[6]).toBe(1);
  });

  it("extends the streak on consecutive winning days", () => {
    let s = emptyStats();
    s = applyResult(s, "2026-11-24", 5);
    s = applyResult(s, "2026-11-25", 7);
    s = applyResult(s, "2026-11-26", 6);
    expect(s.currentStreak).toBe(3);
    expect(s.maxStreak).toBe(3);
  });

  it("continues across a month boundary", () => {
    let s = applyResult(emptyStats(), "2026-11-30", 7);
    s = applyResult(s, "2026-12-01", 7);
    expect(s.currentStreak).toBe(2);
  });

  it("resets the streak to 1 after a missed day", () => {
    let s = emptyStats();
    s = applyResult(s, "2026-11-24", 7);
    s = applyResult(s, "2026-11-25", 7);
    s = applyResult(s, "2026-11-27", 7); // skipped the 26th
    expect(s.currentStreak).toBe(1);
    expect(s.maxStreak).toBe(2);
  });

  it("resets the streak to 0 on a loss", () => {
    let s = emptyStats();
    s = applyResult(s, "2026-11-24", 7);
    s = applyResult(s, "2026-11-25", 4);
    expect(s.currentStreak).toBe(0);
    expect(s.maxStreak).toBe(1);
    expect(s.wins).toBe(1);
    expect(s.gamesPlayed).toBe(2);
    s = applyResult(s, "2026-11-26", 5);
    expect(s.currentStreak).toBe(1);
  });

  it("ignores a second result for the same day", () => {
    const once = applyResult(emptyStats(), "2026-11-24", 7);
    expect(applyResult(once, "2026-11-24", 0)).toBe(once);
  });

  it("computes win percentage", () => {
    let s = emptyStats();
    s = applyResult(s, "2026-11-24", 7);
    s = applyResult(s, "2026-11-25", 1);
    s = applyResult(s, "2026-11-26", 5);
    expect(winPercent(s)).toBe(67);
    expect(winPercent(emptyStats())).toBe(0);
  });
});

describe("currentStreakOn", () => {
  const s = applyResult(applyResult(emptyStats(), "2026-11-24", 7), "2026-11-25", 7);

  it("shows the streak on the day of the win and the day after", () => {
    expect(currentStreakOn(s, "2026-11-25")).toBe(2);
    expect(currentStreakOn(s, "2026-11-26")).toBe(2);
  });

  it("shows 0 once a full day has been missed", () => {
    expect(currentStreakOn(s, "2026-11-27")).toBe(0);
  });
});

describe("localStorage integration", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
    };
  });

  it("submitResult locks the day and records stats", () => {
    const p = ALL_PUZZLES[0];
    const answers = p.packages.map((k) => k.answer);
    const stats = submitResult(p, p.date, answers);
    expect(stats.gamesPlayed).toBe(1);
    expect(loadGame(p.date, p.id)).toMatchObject({ completed: true, answers });
    expect(loadStats().currentStreak).toBe(1);
  });

  it("survives storage that throws", () => {
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    const p = ALL_PUZZLES[0];
    expect(() => submitResult(p, p.date, [])).not.toThrow();
    expect(loadStats()).toEqual(emptyStats());
  });

  it("survives corrupt JSON", () => {
    store["customs:v1:stats"] = "{not json";
    expect(loadStats()).toEqual(emptyStats());
  });
});
