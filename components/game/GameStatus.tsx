import type { BoardResult, Player, SymbolPreset } from "@/types/game";

type GameStatusProps = {
  isPlayable: boolean;
  turn: Player;
  result: BoardResult;
  preset: SymbolPreset;
};

export default function GameStatus({ isPlayable, turn, result, preset }: GameStatusProps) {
  let message = "Board preview. Gameplay is coming soon.";

  if (isPlayable) {
    if (result.winner) {
      message = `Player ${result.winner === "X" ? "1" : "2"} Wins!`;
    } else if (result.isDraw) {
      message = "It's a Draw!";
    } else {
      message = `Player ${turn === "X" ? "1" : "2"}'s turn (${preset.symbols[turn]})`;
    }
  }

  return (
    <p id="board-status" role="status" aria-atomic="true" className={`mt-3 font-medium ${result.winner ? "text-success" : "text-muted"}`}>
      {message}
    </p>
  );
}
