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
    : `Player ${value === "X" ? "1" : "2"}, ${preset.symbols[value]}`;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      aria-label={`Row ${Math.floor(index / 3) + 1}, column ${(index % 3) + 1}: ${contents}${isWinning ? ", winning cell" : ""}`}
      className={`relative flex aspect-square min-h-11 min-w-11 items-center justify-center rounded-2xl border bg-surface text-4xl font-bold sm:text-5xl ${
        isWinning ? "border-success ring-2 ring-success/40" : "border-purple/25 enabled:hover:border-cyan"
      } ${value === "O" ? "text-magenta" : "text-cyan"}`}
    >
      <span aria-hidden="true">{value === null ? "" : preset.symbols[value]}</span>
      {isWinning && <span aria-hidden="true" className="absolute bottom-1 text-[10px] font-semibold uppercase tracking-wider text-success">Win</span>}
    </button>
  );
}
