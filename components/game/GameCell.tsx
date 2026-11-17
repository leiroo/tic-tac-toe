import type { CellValue, SymbolPreset } from "@/types/game";

type GameCellProps = {
  index: number;
  value: CellValue;
  preset: SymbolPreset;
  disabled: boolean;
  isWinning: boolean;
  onSelect: () => void;
};

export default function GameCell({ index, value, preset, disabled, isWinning, onSelect }: GameCellProps) {
  const contents = value === null
    ? "empty"
    : `${value}, ${preset.symbols[value]}`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${contents}${isWinning ? ", winning cell" : ""}`}
      className={`game-cell relative flex aspect-square min-h-11 min-w-11 items-center justify-center rounded-2xl border bg-surface font-bold ${
        isWinning ? "border-success ring-2 ring-success/40" : "border-purple/25 enabled:hover:border-cyan"
      } ${value === "O" ? "text-magenta" : "text-cyan"}`}
    >
      {value !== null && <span key={value} aria-hidden="true" className="symbol-appear">{preset.symbols[value]}</span>}
      {isWinning && <span aria-hidden="true" className="absolute bottom-1 text-[10px] font-semibold uppercase tracking-wider text-success">Win</span>}
    </button>
  );
}
