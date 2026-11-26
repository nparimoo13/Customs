import type { Settings } from "../lib/types";
import { Modal } from "./Modal";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span>
        <span className="block font-bold">{label}</span>
        <span className="block text-sm text-ink-soft">{hint}</span>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-6 shrink-0 accent-cleared"
      />
    </label>
  );
}

export function SettingsModal({ open, onClose, settings, onChange }: SettingsModalProps) {
  return (
    <Modal open={open} title="Desk settings" onClose={onClose}>
      <div className="divide-y divide-dashed divide-ink/30">
        <Toggle
          label="Stamp sound"
          hint="A satisfying thunk on every verdict."
          checked={settings.sound}
          onChange={(sound) => onChange({ ...settings, sound })}
        />
        <Toggle
          label="Colour-blind share grid"
          hint="Use 🟦 / 🟧 instead of 🟩 / 🟥."
          checked={settings.colorBlind}
          onChange={(colorBlind) => onChange({ ...settings, colorBlind })}
        />
      </div>
    </Modal>
  );
}
