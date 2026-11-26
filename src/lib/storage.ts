import type { GameState, PlayerAnswer, Puzzle, Settings, Stats } from "./types";
import { addDays } from "./date";
import { isWin, scoreAnswers } from "./scoring";

const PREFIX = "customs:v1:";
const KEYS = {
  game: (date: string) => `${PREFIX}game:${date}`,
  stats: `${PREFIX}stats`,
  settings: `${PREFIX}settings`,
};

export const DEFAULT_SETTINGS: Settings = { sound: false, colorBlind: false, seenHowTo: false };

export function emptyStats(): Stats {
  return {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: Array(8).fill(0),
    lastPlayedDate: null,
    lastWinDate: null,
  };
}

// ---------- safe localStorage ----------

function read<T>(key: string): T | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full, disabled, or private mode — the game keeps working in memory */
  }
}

// ---------- game state ----------

export function loadGame(date: string, puzzleId: number): GameState | null {
  const g = read<GameState>(KEYS.game(date));
  if (!g || g.puzzleId !== puzzleId || !Array.isArray(g.answers)) return null;
  return g;
}

export function saveGame(game: GameState): void {
  write(KEYS.game(game.date), game);
}

// ---------- stats & streaks ----------

export function loadStats(): Stats {
  const s = read<Partial<Stats>>(KEYS.stats);
  const base = emptyStats();
  if (!s) return base;
  const distribution =
    Array.isArray(s.distribution) && s.distribution.length === 8 ? s.distribution : base.distribution;
  return { ...base, ...s, distribution };
}

export function saveStats(stats: Stats): void {
  write(KEYS.stats, stats);
}

/**
 * Pure stats update for one finished day. A streak counts consecutive days won
 * (score >= 5). A loss resets it to 0; a missed day breaks it (the next win
 * starts again at 1). Recording the same date twice is a no-op.
 */
export function applyResult(stats: Stats, date: string, score: number): Stats {
  if (stats.lastPlayedDate === date) return stats;

  const distribution = [...stats.distribution];
  distribution[score] = (distribution[score] ?? 0) + 1;
  const won = isWin(score);
  const continues = stats.lastWinDate !== null && stats.lastWinDate === addDays(date, -1);
  const currentStreak = won ? (continues ? stats.currentStreak + 1 : 1) : 0;

  return {
    gamesPlayed: stats.gamesPlayed + 1,
    wins: stats.wins + (won ? 1 : 0),
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    distribution,
    lastPlayedDate: date,
    lastWinDate: won ? date : stats.lastWinDate,
  };
}

/** The streak to display today: it's already broken if the last win was before yesterday. */
export function currentStreakOn(stats: Stats, today: string): number {
  if (!stats.lastWinDate) return 0;
  const alive = stats.lastWinDate === today || stats.lastWinDate === addDays(today, -1);
  return alive ? stats.currentStreak : 0;
}

export function winPercent(stats: Stats): number {
  return stats.gamesPlayed === 0 ? 0 : Math.round((stats.wins / stats.gamesPlayed) * 100);
}

/**
 * The single place a finished game is recorded. A global-stats backend
 * ("only 23% of officers caught Agumon") can be called from here later.
 */
export function submitResult(puzzle: Puzzle, date: string, answers: PlayerAnswer[]): Stats {
  saveGame({ date, puzzleId: puzzle.id, answers, completed: true });
  const next = applyResult(loadStats(), date, scoreAnswers(puzzle, answers));
  saveStats(next);
  return next;
}

// ---------- settings ----------

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...(read<Partial<Settings>>(KEYS.settings) ?? {}) };
}

export function saveSettings(settings: Settings): void {
  write(KEYS.settings, settings);
}
