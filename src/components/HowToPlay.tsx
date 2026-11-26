import { Modal } from "./Modal";

interface HowToPlayProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    icon: "📦",
    title: "Read the label",
    body: "Seven packages arrive, one at a time. Each has a single name on it. You get 10 seconds per package.",
  },
  {
    icon: "🗂️",
    title: "Sort it",
    body: "Category A, Category B, or Neither. Tap a button, press 1 / 2 / 3 (or ← → ↓), or swipe left, right, or down.",
  },
  {
    icon: "🛃",
    title: "Get stamped",
    body: "CLEARED or SEIZED — then the truth. Some names are decoys. Trust nothing. New shift every midnight.",
  },
];

export function HowToPlay({ open, onClose }: HowToPlayProps) {
  return (
    <Modal open={open} title="Officer briefing" onClose={onClose}>
      <ol className="space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex gap-3">
            <span aria-hidden="true" className="text-3xl leading-none">
              {s.icon}
            </span>
            <div>
              <p className="font-bold">
                {i + 1}. {s.title}
              </p>
              <p className="text-sm text-ink-soft">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        autoFocus
        onClick={onClose}
        className="btn-sort mt-6 w-full rounded-lg bg-ink px-4 py-3 font-stencil text-lg tracking-widest text-manila uppercase"
      >
        Understood
      </button>
    </Modal>
  );
}
