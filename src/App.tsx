import { useCallback, useMemo, useState } from "react";
import type { PlayerAnswer, Settings, Stats } from "./lib/types";
import { resolveDateKey, selectPuzzle } from "./lib/puzzle";
import { loadGame, loadSettings, loadStats, saveGame, saveSettings, submitResult } from "./lib/storage";
import { IntroScreen } from "./components/IntroScreen";
import { SortingScreen } from "./components/SortingScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { HowToPlay } from "./components/HowToPlay";
import { StatsModal } from "./components/StatsModal";
import { SettingsModal } from "./components/SettingsModal";

type Phase = "intro" | "sorting" | "results";
type ModalName = "help" | "stats" | "settings" | null;

function initialState() {
  const today = resolveDateKey(window.location.search, import.meta.env.DEV);
  const puzzle = selectPuzzle(today);
  const saved = loadGame(today, puzzle.id);
  let answers: PlayerAnswer[] = saved?.answers ?? [];
  let stats = loadStats();
  let phase: Phase = "intro";

  if (saved?.completed) {
    phase = "results";
  } else if (answers.length >= puzzle.packages.length) {
    // Reloaded during the final verdict: finish the game rather than replaying.
    answers = answers.slice(0, puzzle.packages.length);
    stats = submitResult(puzzle, today, answers);
    phase = "results";
  }
  return { today, puzzle, answers, stats, phase };
}

export default function App() {
  const init = useMemo(initialState, []);
  const { today, puzzle } = init;

  const [phase, setPhase] = useState<Phase>(init.phase);
  const [answers, setAnswers] = useState<PlayerAnswer[]>(init.answers);
  const [stats, setStats] = useState<Stats>(init.stats);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [modal, setModal] = useState<ModalName>(() =>
    !loadSettings().seenHowTo && init.phase === "intro" ? "help" : null,
  );

  const updateSettings = useCallback((s: Settings) => {
    setSettings(s);
    saveSettings(s);
  }, []);

  const closeModal = useCallback(() => {
    if (modal === "help" && !settings.seenHowTo) updateSettings({ ...settings, seenHowTo: true });
    setModal(null);
  }, [modal, settings, updateSettings]);

  const onProgress = useCallback(
    (next: PlayerAnswer[]) => {
      setAnswers(next);
      saveGame({ date: today, puzzleId: puzzle.id, answers: next, completed: false });
    },
    [today, puzzle.id],
  );

  const onComplete = useCallback(
    (final: PlayerAnswer[]) => {
      setAnswers(final);
      setStats(submitResult(puzzle, today, final));
      setPhase("results");
      window.scrollTo({ top: 0 });
    },
    [puzzle, today],
  );

  const onNewDay = useCallback(() => window.location.reload(), []);

  const iconBtn =
    "grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-ink/10 active:bg-ink/15";

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      <header className="flex items-center justify-between border-b-2 border-ink/80 px-3 py-1.5 pt-[max(0.375rem,env(safe-area-inset-top))]">
        <div className="flex items-center">
          <button type="button" className={iconBtn} onClick={() => setModal("help")} aria-label="How to play">
            <span aria-hidden="true">❔</span>
          </button>
          <button
            type="button"
            className={iconBtn}
            onClick={() => updateSettings({ ...settings, sound: !settings.sound })}
            aria-label={settings.sound ? "Mute stamp sound" : "Unmute stamp sound"}
            aria-pressed={settings.sound}
          >
            <span aria-hidden="true">{settings.sound ? "🔊" : "🔇"}</span>
          </button>
        </div>
        <p className="font-stencil text-xl tracking-[0.25em] whitespace-nowrap uppercase sm:text-2xl">
          <span aria-hidden="true">🛃 </span>Customs
        </p>
        <div className="flex items-center">
          <button type="button" className={iconBtn} onClick={() => setModal("stats")} aria-label="Statistics">
            <span aria-hidden="true">📊</span>
          </button>
          <button type="button" className={iconBtn} onClick={() => setModal("settings")} aria-label="Settings">
            <span aria-hidden="true">⚙️</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {phase === "intro" && (
          <IntroScreen puzzle={puzzle} resuming={answers.length > 0} onStart={() => setPhase("sorting")} />
        )}
        {phase === "sorting" && (
          <SortingScreen
            puzzle={puzzle}
            initialAnswers={answers}
            sound={settings.sound}
            paused={modal !== null}
            onProgress={onProgress}
            onComplete={onComplete}
          />
        )}
        {phase === "results" && (
          <ResultsScreen
            puzzle={puzzle}
            answers={answers}
            stats={stats}
            today={today}
            colorBlind={settings.colorBlind}
            onNewDay={onNewDay}
          />
        )}
      </main>

      <HowToPlay open={modal === "help"} onClose={closeModal} />
      <StatsModal open={modal === "stats"} onClose={closeModal} stats={stats} today={today} />
      <SettingsModal open={modal === "settings"} onClose={closeModal} settings={settings} onChange={updateSettings} />
    </div>
  );
}
