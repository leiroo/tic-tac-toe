import type { Player, SymbolPreset } from "@/types/game";

type PracticeControlsProps = {
  selected: Player;
  preset: SymbolPreset;
  completed: boolean;
  canUndo: boolean;
  onSelect: (player: Player) => void;
  onUndo: () => void;
};

export default function PracticeControls({ selected, preset, completed, canUndo, onSelect, onUndo }: PracticeControlsProps) {
  return (
    <div className="mx-auto mb-5 w-full max-w-[360px]">
      <div role="group" aria-label="Placement symbol" className="grid grid-cols-2 gap-3">
        {(["X", "O"] as const).map((player) => (
          <button
            key={player}
            type="button"
            aria-label={`Select ${player}`}
            aria-pressed={selected === player}
            disabled={completed}
            onClick={() => onSelect(player)}
            className={`${selected === player ? "button-primary" : "button-secondary"} disabled:opacity-60`}
          >
            <span aria-hidden="true">{preset.symbols[player]}</span>
            <span className="text-sm">Place {player}</span>
          </button>
        ))}
      </div>
      <button type="button" disabled={!canUndo} onClick={onUndo} className="button-secondary mt-3 w-full disabled:opacity-40">Undo</button>
    </div>
  );
}
