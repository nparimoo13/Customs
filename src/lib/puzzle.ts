import rawPuzzles from "../puzzles/puzzles.json";
import type { Puzzle } from "./types";
import { dayNumber, isValidDateKey, localDateKey } from "./date";

export const ALL_PUZZLES: Puzzle[] = rawPuzzles as Puzzle[];

/**
 * Pick the puzzle for a date. Exact date match wins; otherwise cycle through
 * the existing puzzles by day number so there is never an empty screen.
 * Fallback puzzles take the requested date and a continuing puzzle number.
 */
export function selectPuzzle(dateKey: string, puzzles: Puzzle[] = ALL_PUZZLES): Puzzle {
  if (puzzles.length === 0) throw new Error("No puzzles available");

  const exact = puzzles.find((p) => p.date === dateKey);
  if (exact) return exact;

  const sorted = [...puzzles].sort((a, b) => dayNumber(a.date) - dayNumber(b.date));
  const first = sorted[0];
  const offset = dayNumber(dateKey) - dayNumber(first.date);
  const index = ((offset % sorted.length) + sorted.length) % sorted.length;
  const source = sorted[index];

  return {
    ...source,
    id: Math.max(1, first.id + offset),
    date: dateKey,
  };
}

/**
 * Today's date key, honouring `?date=YYYY-MM-DD` in development builds only.
 */
export function resolveDateKey(search: string, isDev: boolean, now: Date = new Date()): string {
  if (isDev) {
    const override = new URLSearchParams(search).get("date");
    if (override && isValidDateKey(override)) return override;
  }
  return localDateKey(now);
}

export function shareTitle(p: Puzzle): string {
  return p.shortTitle ?? `${p.categoryA.label} vs ${p.categoryB.label}`;
}
