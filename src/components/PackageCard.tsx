import { Stamp } from "./Stamp";

interface PackageCardProps {
  name: string;
  number: number;
  /** undefined while sorting; true/false once the verdict is in. */
  verdict?: boolean;
  dragX?: number;
  dragY?: number;
}

function nameSize(name: string): string {
  if (name.length <= 8) return "text-4xl sm:text-5xl";
  if (name.length <= 12) return "text-3xl sm:text-4xl";
  return "text-2xl sm:text-3xl";
}

export function PackageCard({ name, number, verdict, dragX = 0, dragY = 0 }: PackageCardProps) {
  const dragging = dragX !== 0 || dragY !== 0;
  return (
    <div className={verdict === false ? "animate-shake" : undefined}>
      <div className="animate-slide-in">
        <div
          className="cardboard relative mx-auto w-[min(86vw,22rem)] rounded-md border-2 border-cardboard-dark px-5 pt-9 pb-6 select-none"
          style={{
            transform: dragging ? `translate(${dragX}px, ${dragY}px) rotate(${dragX / 25}deg)` : undefined,
            transition: dragging ? "none" : "transform 180ms ease-out",
          }}
        >
          <div className="tape absolute inset-x-0 top-3 h-5" aria-hidden="true" />
          <div className="absolute top-1.5 left-2 text-2xl" aria-hidden="true">
            📦
          </div>
          <div
            className="absolute top-2 right-3 rotate-6 font-stencil text-xs tracking-widest text-seized/80 uppercase"
            aria-hidden="true"
          >
            Fragile
          </div>

          <div className="paper-card relative mt-3 rounded-sm px-4 pt-3 pb-4">
            <div className="flex justify-between border-b border-dashed border-ink/40 pb-1 text-[0.7rem] tracking-widest text-ink-soft uppercase">
              <span>Contents</span>
              <span>Pkg #{String(number).padStart(3, "0")}</span>
            </div>
            <p
              className={`mt-3 min-h-[2.5em] text-center font-type leading-tight font-bold tracking-wide break-words uppercase ${nameSize(name)}`}
            >
              {name}
            </p>
            <div className="mt-3 h-6 bg-[repeating-linear-gradient(90deg,var(--color-ink)_0_2px,transparent_2px_4px,var(--color-ink)_4px_5px,transparent_5px_8px)] opacity-70" aria-hidden="true" />
          </div>

          {verdict !== undefined && <Stamp correct={verdict} />}
        </div>
      </div>
    </div>
  );
}
