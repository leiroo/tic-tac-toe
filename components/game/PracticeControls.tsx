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
    <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
      <div role="group" aria-label="Placement symbol" className="grid grid-cols-2 gap-2">
        {(["X", "O"] as const).map((player) => (
          <button
            key={player}
            type="button"
            aria-label={`Select ${player} (${preset.symbols[player]})`}
            aria-pressed={selected === player}
            disabled={completed}
            onClick={() => onSelect(player)}
            className={`button-secondary px-2 ${selected === player
              ? player === "X" ? "border-cyan bg-cyan/10 text-cyan" : "border-magenta bg-magenta/10 text-magenta"
              : "text-muted"}`}
          >
            <span className="text-xs">Place</span>
            <span aria-hidden="true">{preset.symbols[player]}</span>
          </button>
        ))}
      </div>
      <button type="button" disabled={!canUndo} onClick={onUndo} className="button-secondary">Undo</button>
    </div>
  );
}
