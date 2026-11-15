import type { BoardResult, GameMode, Player, SymbolPreset } from "@/types/game";

type GameStatusProps = {
  mode: GameMode;
  turn: Player;
  result: BoardResult;
  preset: SymbolPreset;
};

export default function GameStatus({ mode, turn, result, preset }: GameStatusProps) {
  let message = "Board preview. Gameplay is coming soon.";

  if (mode !== "practice") {
    if (result.winner) {
      message = mode === "computer"
        ? result.winner === "X" ? "You Win!" : "Computer Wins!"
        : `Player ${result.winner === "X" ? "1" : "2"} Wins!`;
    } else if (result.isDraw) {
      message = "It's a Draw!";
    } else {
      message = mode === "computer"
        ? turn === "X" ? "Your Turn" : "Computer is thinking..."
        : `Player ${turn === "X" ? "1" : "2"}'s turn (${preset.symbols[turn]})`;
    }
  }

  return (
    <p id="board-status" role="status" aria-atomic="true" className={`mt-3 font-medium ${result.winner ? "text-success" : "text-muted"}`}>
      {message}
    </p>
  );
}
