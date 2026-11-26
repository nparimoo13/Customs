import { useEffect, useState } from "react";
import type { PlayerAnswer, Puzzle, Stats } from "../lib/types";
import { isCorrect, rankTitle, scoreAnswers } from "../lib/scoring";
import { shareText } from "../lib/share";
import { binLabel } from "../lib/bins";
import { formatCountdown, msUntilLocalMidnight } from "../lib/date";
import { ShareButton } from "./ShareButton";
import { StatsPanel } from "./StatsPanel";

interface ResultsScreenProps {
  puzzle: Puzzle;
  answers: PlayerAnswer[];
  stats: Stats;
  today: string;
  colorBlind: boolean;
  onNewDay: () => void;
}

function useCountdown(onZero: () => void): string {
  const [ms, setMs] = useState(() => msUntilLocalMidnight());
  useEffect(() => {
    const id = window.setInterval(() => {
      const left = msUntilLocalMidnight();
      setMs(left);
      if (left <= 1000) onZero();
    }, 1000);
    return () => window.clearInterval(id);
  }, [onZero]);
  return formatCountdown(ms);
}

export function ResultsScreen({ puzzle, answers, stats, today, colorBlind, onNewDay }: ResultsScreenProps) {
  const score = scoreAnswers(puzzle, answers);
  const total = puzzle.packages.length;
  const text = shareText(puzzle, answers, colorBlind);
  const countdown = useCountdown(onNewDay);
  const [hit, miss] = colorBlind ? ["🟦", "🟧"] : ["🟩", "🟥"];

  return (
    <section className="animate-fade-up mx-auto w-full max-w-md space-y-5 px-4 py-5" aria-labelledby="results-title">
      <div className="paper-card relative overflow-hidden rounded-lg p-5 text-center">
        <p className="text-xs tracking-widest text-ink-soft uppercase">Customs #{puzzle.id} · Shift report</p>
        <h1 id="results-title" className="mt-1 font-stencil text-6xl">
          {score}/{total}
        </h1>
        <p
          className={`stamp-ink mx-auto mt-3 inline-block -rotate-3 px-3 py-1 font-stencil text-2xl tracking-wider uppercase ${
            score >= 5 ? "text-cleared" : "text-seized"
          }`}
        >
          {rankTitle(score)}
        </p>
        <p className="mt-3 text-2xl tracking-wider" aria-label={`${score} cleared, ${total - score} seized`}>
          {puzzle.packages.map((_, i) => (isCorrect(puzzle, i, answers[i] ?? null) ? hit : miss)).join("")}
        </p>

        <div className="mt-5">
          <ShareButton text={text} />
        </div>
        <pre className="mt-1 rounded bg-ink/5 p-3 text-left font-type text-xs whitespace-pre-wrap select-all">{text}</pre>

        <p className="mt-4 text-sm">
          Next shift in{" "}
          <span className="font-stencil text-lg tabular-nums" role="timer">
            {countdown}
          </span>
        </p>
      </div>

      <div className="paper-card rounded-lg p-5">
        <h2 className="mb-3 font-stencil text-xl tracking-wider uppercase">Inspection log</h2>
        <ol className="divide-y divide-dashed divide-ink/30">
          {puzzle.packages.map((p, i) => {
            const mine = answers[i] ?? null;
            const ok = isCorrect(puzzle, i, mine);
            return (
              <li key={p.name} className="py-2.5">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 font-bold ${ok ? "text-cleared" : "text-seized"}`}
                    aria-label={ok ? "Correct" : "Wrong"}
                  >
                    {ok ? "✓" : "✗"}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold tracking-wide uppercase">{p.name}</p>
                    <p className="text-sm">
                      <span className="text-ink-soft">Correct:</span> {binLabel(puzzle, p.answer)}
                    </p>
                    {!ok && (
                      <p className="text-sm text-seized">
                        <span>You:</span> {binLabel(puzzle, mine)}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm text-ink-soft italic">{p.reveal}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="paper-card rounded-lg p-5">
        <h2 className="mb-3 font-stencil text-xl tracking-wider uppercase">Service record</h2>
        <StatsPanel stats={stats} today={today} highlight={score} />
      </div>
    </section>
  );
}
