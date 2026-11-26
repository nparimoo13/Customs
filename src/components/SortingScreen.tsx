import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import type { Bin, PlayerAnswer, Puzzle } from "../lib/types";
import { isCorrect } from "../lib/scoring";
import { binLabel, binName } from "../lib/bins";
import { playStamp } from "../lib/sound";
import { PackageCard } from "./PackageCard";

export const TIME_LIMIT_MS = 10_000;
export const VERDICT_MS = 2_500;
const SWIPE_PX = 60;

interface SortingScreenProps {
  puzzle: Puzzle;
  initialAnswers: PlayerAnswer[];
  sound: boolean;
  paused: boolean;
  onProgress: (answers: PlayerAnswer[]) => void;
  onComplete: (answers: PlayerAnswer[]) => void;
}

interface Verdict {
  answer: PlayerAnswer;
  correct: boolean;
}

const KEY_TO_BIN: Record<string, Bin> = {
  "1": "A",
  ArrowLeft: "A",
  "2": "B",
  ArrowRight: "B",
  "3": "NEITHER",
  ArrowDown: "NEITHER",
};

export function SortingScreen({ puzzle, initialAnswers, sound, paused, onProgress, onComplete }: SortingScreenProps) {
  const total = puzzle.packages.length;
  const [index, setIndex] = useState(initialAnswers.length);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);

  const answersRef = useRef<PlayerAnswer[]>(initialAnswers);
  const verdictRef = useRef<Verdict | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  // A swipe that produces a verdict is followed by a click; only taps that start during a verdict advance.
  const tapToAdvance = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const pkg = puzzle.packages[index];

  const submit = useCallback(
    (answer: PlayerAnswer) => {
      if (verdictRef.current || index >= total) return;
      const correct = isCorrect(puzzle, index, answer);
      const v = { answer, correct };
      verdictRef.current = v;
      answersRef.current = [...answersRef.current, answer];
      setVerdict(v);
      onProgress(answersRef.current);
      if (sound) playStamp(correct);
      if (!correct) {
        try {
          navigator.vibrate?.(60);
        } catch {
          /* unsupported */
        }
      }
    },
    [index, total, puzzle, sound, onProgress],
  );

  const advance = useCallback(() => {
    if (!verdictRef.current) return;
    verdictRef.current = null;
    if (index + 1 >= total) {
      onComplete(answersRef.current);
      return;
    }
    setVerdict(null);
    setTimeLeft(TIME_LIMIT_MS);
    setIndex(index + 1);
  }, [index, total, onComplete]);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Per-package countdown. Elapsed time only accrues while the game is visible and unpaused.
  const elapsedRef = useRef(0);
  useEffect(() => {
    elapsedRef.current = 0;
  }, [index]);
  useEffect(() => {
    if (verdict || paused || hidden) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      const left = Math.max(0, TIME_LIMIT_MS - elapsedRef.current);
      setTimeLeft(left);
      if (left <= 0) submit(null);
    }, 100);
    return () => window.clearInterval(id);
  }, [index, verdict, paused, hidden, submit]);

  // Auto-advance after the verdict.
  useEffect(() => {
    if (!verdict || paused) return;
    const id = window.setTimeout(advance, VERDICT_MS);
    return () => window.clearTimeout(id);
  }, [verdict, paused, advance]);

  // Focus: the "next" control during a verdict, the new package otherwise.
  useEffect(() => {
    if (verdict) nextRef.current?.focus({ preventScroll: true });
    else stageRef.current?.focus({ preventScroll: true });
  }, [verdict, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (paused || e.metaKey || e.ctrlKey || e.altKey) return;
      if (verdictRef.current) {
        const onButton = (e.target as HTMLElement | null)?.tagName === "BUTTON";
        if ((e.key === "Enter" || e.key === " ") && onButton) return; // the button's own click handles it
        if (e.key in KEY_TO_BIN || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          advance();
        }
        return;
      }
      const bin = KEY_TO_BIN[e.key];
      if (bin) {
        e.preventDefault();
        submit(bin);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, submit, advance]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    tapToAdvance.current = !!verdictRef.current;
    if (verdictRef.current) return;
    pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    setDrag({ x: e.clientX - p.x, y: Math.max(0, e.clientY - p.y) });
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    const p = pointer.current;
    pointer.current = null;
    setDrag({ x: 0, y: 0 });
    if (!p || p.id !== e.pointerId) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) submit(dx < 0 ? "A" : "B");
    else if (dy > SWIPE_PX && dy > Math.abs(dx)) submit("NEITHER");
  };

  if (!pkg) return null;

  const seconds = Math.ceil(timeLeft / 1000);
  const urgent = timeLeft <= 3000;
  const bins: { bin: Bin; label: string; emoji: string; key: string; swipe: string }[] = [
    { bin: "A", label: puzzle.categoryA.label, emoji: puzzle.categoryA.emoji, key: "1", swipe: "←" },
    { bin: "B", label: puzzle.categoryB.label, emoji: puzzle.categoryB.emoji, key: "2", swipe: "→" },
    { bin: "NEITHER", label: "Neither", emoji: "🚫", key: "3", swipe: "↓" },
  ];

  const announcement = verdict
    ? `${verdict.correct ? "Cleared" : "Seized"}. ${pkg.name} belongs in ${binName(puzzle, pkg.answer)}. ${pkg.reveal}`
    : "";

  return (
    <section className="flex flex-1 flex-col" aria-label="Sorting desk">
      <div className="px-4 pt-2">
        <div className="flex items-baseline justify-between text-sm font-bold tracking-wider uppercase">
          <span>
            Package {index + 1} of {total}
          </span>
          <span
            aria-hidden="true"
            className={`font-stencil text-xl tabular-nums ${urgent && !verdict ? "text-seized" : ""}`}
          >
            ⏱ {verdict ? "—" : `${seconds}s`}
          </span>
        </div>
        <div
          className="mt-1 h-2 overflow-hidden rounded-full bg-ink/15"
          role="progressbar"
          aria-label="Shift progress"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + (verdict ? 1 : 0)}
        >
          <div
            className="h-full bg-ink transition-[width] duration-300"
            style={{ width: `${((index + (verdict ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
          <div
            className={`h-full ${urgent ? "bg-seized" : "bg-cleared"}`}
            style={{ width: `${verdict ? 0 : (timeLeft / TIME_LIMIT_MS) * 100}%`, transition: "width 100ms linear" }}
          />
        </div>
      </div>

      <div
        ref={stageRef}
        tabIndex={-1}
        aria-label={`Package ${index + 1}: ${pkg.name}`}
        className="relative flex flex-1 touch-none flex-col justify-center overflow-hidden py-4 outline-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={() => {
          if (tapToAdvance.current) advance();
          tapToAdvance.current = false;
        }}
      >
        <div className="relative z-10">
          <PackageCard key={index} name={pkg.name} number={index + 1} verdict={verdict?.correct} dragX={drag.x} dragY={drag.y} />
        </div>
        <div key={`belt-${index}`} className="belt belt-moving absolute inset-x-0 bottom-6 h-8 shadow-inner" aria-hidden="true" />
      </div>

      <div className="sr-only" aria-live="assertive" role="status">
        {announcement}
      </div>

      <div className="relative px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-2 gap-3" aria-hidden={verdict ? true : undefined}>
          {bins.map((b) => (
            <button
              key={b.bin}
              type="button"
              disabled={!!verdict}
              tabIndex={verdict ? -1 : 0}
              onClick={() => submit(b.bin)}
              className={`btn-sort relative flex min-h-16 items-center gap-2 rounded-lg border-2 border-ink py-3 pr-5 pl-3 text-left font-bold leading-tight ${
                b.bin === "NEITHER" ? "col-span-2 justify-center bg-ink text-manila" : "paper-card"
              } ${b.label.length > 18 ? "text-sm" : ""}`}
            >
              <span aria-hidden="true" className="shrink-0 text-2xl">
                {b.emoji}
              </span>
              <span className={`min-w-0 break-words ${b.bin === "NEITHER" ? "" : "flex-1"}`}>{b.label}</span>
              <span aria-hidden="true" className="absolute top-1 right-1.5 text-[0.7rem] font-normal opacity-70">
                <span className="hidden sm:inline">{b.key}</span>
                <span className="sm:hidden">{b.swipe}</span>
              </span>
            </button>
          ))}
        </div>

        {verdict && (
          <button
            ref={nextRef}
            type="button"
            onClick={advance}
            className={`paper-card animate-fade-up absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] flex min-h-[calc(100%-max(1rem,env(safe-area-inset-bottom)))] flex-col items-start justify-center rounded-lg border-l-8 px-4 py-3 text-left ${
              verdict.correct ? "border-cleared" : "border-seized"
            }`}
          >
            <span className={`font-stencil text-xl tracking-widest uppercase ${verdict.correct ? "text-cleared" : "text-seized"}`}>
              {verdict.correct ? "✓ Cleared" : verdict.answer === null ? "⏱ Too slow — seized" : "✗ Seized"}
            </span>
            <span className="mt-1 text-sm">
              <span className="font-bold">Correct bin:</span> {binLabel(puzzle, pkg.answer)}
            </span>
            <span className="mt-1 text-base leading-snug">{pkg.reveal}</span>
            <span className="mt-2 self-end text-xs tracking-wider text-ink-soft uppercase">
              {index + 1 >= total ? "Tap for results →" : "Tap for next package →"}
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
