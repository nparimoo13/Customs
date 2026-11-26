import type { Stats } from "../lib/types";
import { currentStreakOn, winPercent } from "../lib/storage";

interface StatsPanelProps {
  stats: Stats;
  today: string;
  /** Highlight this score in the distribution (today's result). */
  highlight?: number;
}

export function StatsPanel({ stats, today, highlight }: StatsPanelProps) {
  const max = Math.max(1, ...stats.distribution);
  const tiles = [
    { label: "Played", value: stats.gamesPlayed },
    { label: "Win %", value: winPercent(stats) },
    { label: "Streak", value: currentStreakOn(stats, today) },
    { label: "Max streak", value: stats.maxStreak },
  ];

  return (
    <div>
      <dl className="grid grid-cols-4 gap-2 text-center">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col-reverse">
            <dt className="text-[0.7rem] leading-tight tracking-wide text-ink-soft uppercase">{t.label}</dt>
            <dd className="font-stencil text-3xl">{t.value}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-5 mb-2 text-sm font-bold tracking-wider uppercase">Score distribution</h3>
      <ol className="space-y-1" aria-label="Score distribution">
        {stats.distribution
          .map((count, score) => ({ count, score }))
          .reverse()
          .map(({ count, score }) => (
            <li key={score} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right font-bold">{score}</span>
              <span className="flex-1">
                <span
                  className={`block rounded-sm px-2 py-0.5 text-right text-xs font-bold text-manila ${
                    score === highlight ? "bg-cleared" : "bg-ink-soft"
                  }`}
                  style={{ width: `${Math.max(8, (count / max) * 100)}%` }}
                >
                  <span className="sr-only">{`Scored ${score}: `}</span>
                  {count}
                </span>
              </span>
            </li>
          ))}
      </ol>
      <p className="mt-3 text-xs text-ink-soft">A win is 5 or more correct. Streaks count consecutive days won.</p>
    </div>
  );
}
