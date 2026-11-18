import { gameModes } from "@/data/gameModes";
import type { GameMode } from "@/types/game";

type ModeSelectionScreenProps = {
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
};

export default function ModeSelectionScreen({ onSelect, onBack }: ModeSelectionScreenProps) {
  return (
    <section aria-labelledby="modes-title">
      <button type="button" onClick={onBack} className="button-back">← Back to Home</button>
      <p className="eyebrow mt-3">01 / Choose your mode</p>
      <h1 id="modes-title" tabIndex={-1} className="screen-title">How will you play?</h1>
      <p className="mt-2 text-sm text-muted">A little competition, a shared screen, or time to explore.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {gameModes.map((mode, index) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className="mode-card group"
            aria-label={mode.name}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-mono text-2xl text-purple" aria-hidden="true">0{index + 1}</span>
            </span>
            <span className="mt-3 block text-xs font-semibold tracking-wide text-purple">{mode.label}</span>
            <span className="mt-1 block text-xl font-bold">{mode.name}</span>
            <span className="mt-2 block flex-1 text-sm leading-5 text-muted">{mode.description}</span>
            <span className="mt-4 block text-sm font-semibold text-cyan">Choose mode <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
