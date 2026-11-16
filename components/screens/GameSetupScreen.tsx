import SymbolPicker from "@/components/ui/SymbolPicker";
import DifficultyPicker from "@/components/ui/DifficultyPicker";
import type { Difficulty, GameMode, SymbolPreset, SymbolPresetId } from "@/types/game";

type GameSetupScreenProps = {
  modeName: string;
  mode: GameMode;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  preset: SymbolPreset;
  onPresetChange: (id: SymbolPresetId) => void;
  onBack: () => void;
  onStart: () => void;
};

export default function GameSetupScreen({ modeName, mode, difficulty, onDifficultyChange, preset, onPresetChange, onBack, onStart }: GameSetupScreenProps) {
  return (
    <section aria-labelledby="setup-title">
      <button type="button" onClick={onBack} className="button-back">← Back to Modes</button>
      <p className="eyebrow mt-8">02 / Make it yours</p>
      <h1 id="setup-title" tabIndex={-1} className="screen-title">Pick your symbols.</h1>
      <p className="mt-3 text-muted">{modeName} <span aria-hidden="true" className="px-2 text-purple">/</span> Same game, your style.</p>

      <div className="mt-8"><SymbolPicker selectedId={preset.id} onChange={onPresetChange} /></div>

      {mode === "computer" && (
        <div className="mt-8"><DifficultyPicker selected={difficulty} onChange={onDifficultyChange} /></div>
      )}

      <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-muted/20 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div aria-live="polite" aria-atomic="true">
          <p className="text-xs uppercase tracking-widest text-muted">Your matchup</p>
          <p className="mt-2 flex items-center gap-3 text-xl font-bold">
            <span className="text-cyan">{preset.symbols.X}</span>
            <span className="text-sm font-normal text-muted">vs</span>
            <span className="text-magenta">{preset.symbols.O}</span>
            <span className="ml-1 text-sm font-normal">{preset.name}</span>
          </p>
        </div>
        <button type="button" onClick={onStart} className="button-primary">Start Game <span aria-hidden="true">→</span></button>
      </div>
    </section>
  );
}
