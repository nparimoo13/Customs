import { describe, expect, it } from "vitest";
import { firstMistakeIndex, isWin, rankTitle, scoreAnswers } from "./scoring";
import { ALL_PUZZLES } from "./puzzle";
import type { PlayerAnswer } from "./types";

const day1 = ALL_PUZZLES[0];
const perfect = day1.packages.map((p) => p.answer);

describe("scoreAnswers", () => {
  it("scores a perfect game as 7", () => {
    expect(scoreAnswers(day1, perfect)).toBe(7);
  });

  it("counts timeouts (null) as wrong", () => {
    const answers: PlayerAnswer[] = [...perfect];
    answers[2] = null;
    answers[6] = "A";
    expect(scoreAnswers(day1, answers)).toBe(5);
  });

  it("scores an empty answer list as 0", () => {
    expect(scoreAnswers(day1, [])).toBe(0);
  });
});

describe("rankTitle", () => {
  it.each([
    [7, "Chief Inspector"],
    [6, "Senior Officer"],
    [5, "Senior Officer"],
    [4, "Trainee"],
    [3, "Trainee"],
    [2, "Smuggler's Best Friend"],
    [1, "Smuggler's Best Friend"],
    [0, "Smuggler's Best Friend"],
  ])("score %i → %s", (score, title) => {
    expect(rankTitle(score)).toBe(title);
  });
});

describe("isWin / firstMistakeIndex", () => {
  it("treats 5 or more as a win", () => {
    expect(isWin(4)).toBe(false);
    expect(isWin(5)).toBe(true);
    expect(isWin(7)).toBe(true);
  });

  it("finds the first wrong or timed-out package", () => {
    expect(firstMistakeIndex(day1, perfect)).toBe(-1);
    const answers: PlayerAnswer[] = [...perfect];
    answers[4] = null;
    answers[2] = "A";
    expect(firstMistakeIndex(day1, answers)).toBe(2);
  });
});
