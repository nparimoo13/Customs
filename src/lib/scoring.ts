import type { PlayerAnswer, Puzzle } from "./types";

export const WIN_THRESHOLD = 5;

export function isCorrect(puzzle: Puzzle, index: number, answer: PlayerAnswer): boolean {
  return answer !== null && puzzle.packages[index]?.answer === answer;
}

export function scoreAnswers(puzzle: Puzzle, answers: PlayerAnswer[]): number {
  return answers.reduce<number>((n, a, i) => n + (isCorrect(puzzle, i, a) ? 1 : 0), 0);
}

export function isWin(score: number): boolean {
  return score >= WIN_THRESHOLD;
}

export function rankTitle(score: number): string {
  if (score >= 7) return "Chief Inspector";
  if (score >= 5) return "Senior Officer";
  if (score >= 3) return "Trainee";
  return "Smuggler's Best Friend";
}

/** Index of the first package the player got wrong (including timeouts), or -1. */
export function firstMistakeIndex(puzzle: Puzzle, answers: PlayerAnswer[]): number {
  return puzzle.packages.findIndex((_, i) => !isCorrect(puzzle, i, answers[i] ?? null));
}
