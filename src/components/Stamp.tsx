interface StampProps {
  correct: boolean;
}

export function Stamp({ correct }: StampProps) {
  return (
    <div
      aria-hidden="true"
      className={`stamp-ink animate-stamp pointer-events-none absolute top-1/2 left-1/2 z-10 bg-white/10 px-4 py-1 font-stencil text-4xl tracking-[0.2em] whitespace-nowrap uppercase sm:text-5xl ${
        correct ? "text-cleared" : "text-seized"
      }`}
    >
      {correct ? "Cleared" : "Seized"}
    </div>
  );
}
