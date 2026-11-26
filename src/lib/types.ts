export type Bin = "A" | "B" | "NEITHER";

export interface PackageItem {
  name: string;
  answer: Bin;
  reveal: string;
}

export interface Category {
  label: string;
  emoji: string;
}

export interface Puzzle {
  id: number;
  date: string;
  categoryA: Category;
  categoryB: Category;
  packages: PackageItem[];
  /** Optional compact title for the share card. Defaults to "A vs B". */
  shortTitle?: string;
  /** Set on generated content until a human has fact-checked it. */
  needsReview?: boolean;
}

/** `null` means the player ran out of time on that package. */
export type PlayerAnswer = Bin | null;

export interface GameState {
  date: string;
  puzzleId: number;
  answers: PlayerAnswer[];
  completed: boolean;
}

export interface Stats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[n] = number of games finished with score n (0..7). */
  distribution: number[];
  lastPlayedDate: string | null;
  lastWinDate: string | null;
}

export interface Settings {
  sound: boolean;
  colorBlind: boolean;
  seenHowTo: boolean;
}
