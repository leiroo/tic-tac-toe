import { gameModes } from "@/data/gameModes";
import type { GameMode } from "@/types/game";

type ModeSelectionScreenProps = {
  selectedMode: GameMode;
  onSelect: (mode: GameMode) => void;
  onBack: () => void;
};

export default function ModeSelectionScreen({ selectedMode, onSelect, onBack }: ModeSelectionScreenProps) {
  return (
    <section aria-labelledby="modes-title">
      <button type="button" onClick={onBack} className="button-back">← Back to Home</button>
      <p className="eyebrow mt-8">01 / Choose your mode</p>
      <h1 id="modes-title" tabIndex={-1} className="screen-title">How will you play?</h1>
      <p className="mt-3 text-muted">A little competition, a shared screen, or time to explore.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {gameModes.map((mode, index) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
            className="mode-card group"
            aria-label={`${mode.name}${mode.id === selectedMode ? ", currently selected" : ""}`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-mono text-2xl text-purple" aria-hidden="true">0{index + 1}</span>
              {mode.id === selectedMode && <span className="rounded-full border border-cyan/40 px-3 py-1 text-xs text-cyan">Selected</span>}
            </span>
            <span className="mt-8 block text-xs font-semibold tracking-wide text-purple">{mode.label}</span>
            <span className="mt-2 block text-xl font-bold">{mode.name}</span>
            <span className="mt-3 block flex-1 text-sm leading-6 text-muted">{mode.description}</span>
            <span className="mt-6 block text-sm font-semibold text-cyan">Choose mode <span aria-hidden="true">→</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
