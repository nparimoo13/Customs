import type { PlayerAnswer, Puzzle } from "./types";
import { firstMistakeIndex, isCorrect, scoreAnswers } from "./scoring";
import { shareTitle } from "./puzzle";

export const SHARE_URL = "customs.game";

export function shareText(puzzle: Puzzle, answers: PlayerAnswer[], colorBlind = false): string {
  const [hit, miss] = colorBlind ? ["🟦", "🟧"] : ["🟩", "🟥"];
  const grid = puzzle.packages.map((_, i) => (isCorrect(puzzle, i, answers[i] ?? null) ? hit : miss)).join("");
  const score = scoreAnswers(puzzle, answers);
  const mistake = firstMistakeIndex(puzzle, answers);
  const hook = mistake === -1 ? "Perfect shift 🫡" : `Seized: ${puzzle.packages[mistake].name} 😭`;

  return [
    `CUSTOMS #${puzzle.id} 🛃 ${shareTitle(puzzle)}`,
    `${grid}  ${score}/${puzzle.packages.length}`,
    hook,
    SHARE_URL,
  ].join("\n");
}

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/** Native share sheet on touch devices, clipboard everywhere else. */
export async function shareResult(text: string): Promise<ShareOutcome> {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const coarse = typeof matchMedia !== "undefined" && matchMedia("(pointer: coarse)").matches;

  if (nav?.share && coarse) {
    try {
      await nav.share({ text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    }
  }

  try {
    await nav?.clipboard?.writeText(text);
    if (nav?.clipboard) return "copied";
  } catch {
    /* fall through to legacy copy */
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok ? "copied" : "failed";
  } catch {
    return "failed";
  }
}
