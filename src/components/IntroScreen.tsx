import type { Puzzle } from "../lib/types";

interface IntroScreenProps {
  puzzle: Puzzle;
  resuming: boolean;
  onStart: () => void;
}

function formatDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

export function IntroScreen({ puzzle, resuming, onStart }: IntroScreenProps) {
  return (
    <section className="animate-fade-up flex flex-1 flex-col justify-center px-4 py-6" aria-labelledby="manifest-title">
      <div className="paper-card relative mx-auto w-full max-w-md rounded-lg p-5">
        <div className="flex items-baseline justify-between border-b-2 border-ink pb-2 text-xs tracking-widest uppercase">
          <span>Form C-{String(puzzle.id).padStart(3, "0")}</span>
          <span>{formatDate(puzzle.date)}</span>
        </div>
        <h1 id="manifest-title" className="mt-3 text-center font-stencil text-3xl tracking-[0.15em] uppercase">
          Today's manifest
        </h1>
        {import.meta.env.DEV && puzzle.needsReview && (
          <p className="mt-2 rounded bg-seized/15 px-2 py-1 text-center text-xs font-bold text-seized">
            DEV: this puzzle is marked needsReview
          </p>
        )}

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div className="rounded-md border-2 border-ink p-3">
            <div className="text-4xl" aria-hidden="true">
              {puzzle.categoryA.emoji}
            </div>
            <div className="mt-1 text-xs tracking-widest text-ink-soft uppercase">Category A</div>
            <div className="font-bold leading-tight">{puzzle.categoryA.label}</div>
          </div>
          <div className="font-stencil text-xl" aria-hidden="true">
            vs
          </div>
          <div className="rounded-md border-2 border-ink p-3">
            <div className="text-4xl" aria-hidden="true">
              {puzzle.categoryB.emoji}
            </div>
            <div className="mt-1 text-xs tracking-widest text-ink-soft uppercase">Category B</div>
            <div className="font-bold leading-tight">{puzzle.categoryB.label}</div>
          </div>
        </div>

        <p className="mt-5 text-center leading-snug">
          Sort each package. Some belong in <strong>neither</strong>. Trust nothing.
        </p>
        <p className="mt-1 text-center text-sm text-ink-soft">
          {puzzle.packages.length} packages · 10 seconds each
        </p>

        <button
          type="button"
          onClick={onStart}
          className="btn-sort mt-6 w-full rounded-lg bg-seized px-4 py-4 font-stencil text-2xl tracking-[0.2em] text-white uppercase"
        >
          {resuming ? "Resume shift" : "Start shift"}
        </button>
      </div>
    </section>
  );
}
