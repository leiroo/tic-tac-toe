import GameCell from "@/components/game/GameCell";
import type { Board, SymbolPreset } from "@/types/game";

type GameBoardProps = {
  board: Board;
  preset: SymbolPreset;
  winningCells: number[];
  disabled: boolean;
  onMove: (index: number) => void;
};

export default function GameBoard({ board, preset, winningCells, disabled, onMove }: GameBoardProps) {
  return (
    <div role="group" aria-label="Tic-Tac-Toe board" aria-describedby="board-status" className="mx-auto grid w-full max-w-[360px] grid-cols-3 gap-3">
      {board.map((value, index) => (
        <GameCell
          key={index}
          index={index}
          value={value}
          preset={preset}
          disabled={disabled || value !== null}
          isWinning={winningCells.includes(index)}
          onSelect={() => onMove(index)}
        />
      ))}
    </div>
  );
}
