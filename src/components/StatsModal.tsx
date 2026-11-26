import type { Stats } from "../lib/types";
import { Modal } from "./Modal";
import { StatsPanel } from "./StatsPanel";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  today: string;
}

export function StatsModal({ open, onClose, stats, today }: StatsModalProps) {
  return (
    <Modal open={open} title="Service record" onClose={onClose}>
      <StatsPanel stats={stats} today={today} />
    </Modal>
  );
}
