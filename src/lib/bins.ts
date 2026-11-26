import type { PlayerAnswer, Puzzle } from "./types";

export function binName(puzzle: Puzzle, bin: PlayerAnswer): string {
  if (bin === "A") return puzzle.categoryA.label;
  if (bin === "B") return puzzle.categoryB.label;
  if (bin === "NEITHER") return "Neither";
  return "Out of time";
}

export function binEmoji(puzzle: Puzzle, bin: PlayerAnswer): string {
  if (bin === "A") return puzzle.categoryA.emoji;
  if (bin === "B") return puzzle.categoryB.emoji;
  if (bin === "NEITHER") return "🚫";
  return "⏱️";
}

export function binLabel(puzzle: Puzzle, bin: PlayerAnswer): string {
  return `${binEmoji(puzzle, bin)} ${binName(puzzle, bin)}`;
}
