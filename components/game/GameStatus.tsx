import type { BoardResult, GameMode, Player, SymbolPreset } from "@/types/game";

type GameStatusProps = {
  mode: GameMode;
  turn: Player;
  result: BoardResult;
  preset: SymbolPreset;
};

export default function GameStatus({ mode, turn, result, preset }: GameStatusProps) {
  let message: string;

  if (mode === "practice") {
    message = result.winner ? `${result.winner} Wins!`
      : result.isDraw ? "It's a Draw!" : `Place ${turn}`;
  } else {
    if (result.winner) {
      message = mode === "computer"
        ? result.winner === "X" ? "You Win!" : "Computer Wins!"
        : `Player ${result.winner === "X" ? "1" : "2"} Wins!`;
    } else if (result.isDraw) {
      message = "It's a Draw!";
    } else {
      message = mode === "computer"
        ? turn === "X" ? "Your Turn" : "Computer is thinking..."
        : `Player ${turn === "X" ? "1" : "2"}'s turn`;
    }
  }

  const player = result.winner ?? turn;
  const completed = result.winner !== null || result.isDraw;

  return (
    <p id="board-status" role="status" aria-atomic="true" className={`mt-3 flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium ${completed ? "border-purple/40 bg-purple/10" : "border-muted/15 bg-surface"}`}>
      {!result.isDraw && (
        <span className={`text-xl font-bold ${player === "X" ? "text-cyan" : "text-magenta"}`}>
          <span className="sr-only">{player} symbol: </span>{preset.symbols[player]}
        </span>
      )}
      <span key={message} className={`${completed ? "result-appear" : ""} ${result.winner ? "text-success" : "text-foreground"}`}>{message}</span>
    </p>
  );
}
