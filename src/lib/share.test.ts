import { describe, expect, it } from "vitest";
import { shareText } from "./share";
import { ALL_PUZZLES } from "./puzzle";
import type { PlayerAnswer, Puzzle } from "./types";

const day1 = ALL_PUZZLES[0];
const perfect = day1.packages.map((p) => p.answer);

describe("shareText", () => {
  it("matches the spec example format", () => {
    const answers: PlayerAnswer[] = [...perfect];
    answers[2] = "A"; // Agumon wrong
    answers[4] = "A"; // Ditropan wrong
    const puzzle: Puzzle = { ...day1, id: 12 };
    expect(shareText(puzzle, answers)).toBe(
      ["CUSTOMS #12 🛃 Pokémon vs Prescription Meds", "🟩🟩🟥🟩🟥🟩🟩  5/7", "Seized: Agumon 😭", "customs.game"].join(
        "\n",
      ),
    );
  });

  it("says Perfect shift on 7/7", () => {
    const text = shareText(day1, perfect);
    expect(text).toContain("🟩🟩🟩🟩🟩🟩🟩  7/7");
    expect(text).toContain("Perfect shift 🫡");
    expect(text).not.toContain("Seized:");
  });

  it("names the first mistake, counting timeouts", () => {
    const answers: PlayerAnswer[] = [null, ...perfect.slice(1)];
    expect(shareText(day1, answers)).toContain("Seized: Xatu 😭");
  });

  it("uses the colour-blind palette when asked", () => {
    const answers: PlayerAnswer[] = [...perfect];
    answers[0] = "B";
    const text = shareText(day1, answers, true);
    expect(text).toContain("🟧🟦🟦🟦🟦🟦🟦  6/7");
    expect(text).not.toMatch(/🟩|🟥/u);
  });

  it("falls back to 'A vs B' when no short title is set", () => {
    const { shortTitle: _unused, ...rest } = day1;
    void _unused;
    expect(shareText(rest, perfect).split("\n")[0]).toBe("CUSTOMS #1 🛃 Pokémon vs Prescription medications");
  });
});
