import GameBoard from "@/components/game/GameBoard";
import GameStatus from "@/components/game/GameStatus";
import ScoreBoard from "@/components/game/ScoreBoard";
import GameControls from "@/components/game/GameControls";
import PracticeControls from "@/components/game/PracticeControls";
import type { BoardResult, ModeScores, Player, RoundState, SymbolPreset } from "@/types/game";

type GameScreenProps = {
  modeName: string;
  preset: SymbolPreset;
  round: RoundState;
  result: BoardResult;
  scores: ModeScores;
  onNewRound: () => void;
  onResetMatch: () => void;
  onMove: (index: number) => void;
  onSelectSymbol: (player: Player) => void;
  onUndo: () => void;
  onBack: () => void;
  onChangeMode: () => void;
};

export default function GameScreen({ modeName, preset, round, result, scores, onNewRound, onResetMatch, onMove, onSelectSymbol, onUndo, onBack, onChangeMode }: GameScreenProps) {
  const completed = result.winner !== null || result.isDraw;

  return (
    <section aria-labelledby="game-title">
      <button type="button" onClick={onBack} className="button-back">← Back to Setup</button>
      <p className="eyebrow mt-3">03 / Your board</p>
      <h1 id="game-title" tabIndex={-1} className="screen-title">{modeName}</h1>
      <GameStatus mode={round.mode} turn={round.turn} result={result} preset={preset} />

      <div className="game-layout">
        <div className={`board-panel ${round.mode === "practice" ? "board-panel-practice" : ""}`}>
          {round.mode === "practice" && (
            <PracticeControls
              selected={round.turn}
              preset={preset}
              completed={completed}
              canUndo={round.history.length > 0}
              onSelect={onSelectSymbol}
              onUndo={onUndo}
            />
          )}
          <GameBoard
            board={round.board}
            preset={preset}
            winningCells={result.winningCells}
            disabled={(round.mode === "computer" && round.turn === "O") || completed}
            onMove={onMove}
          />
        </div>
        <aside aria-label="Game setup summary" className="rounded-2xl border border-muted/20 bg-surface p-4">
          <h2 className="text-lg font-bold">Your setup</h2>
          <dl className="mt-3 space-y-3">
            {round.mode === "computer" && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs text-muted">Difficulty</dt>
                <dd className="text-sm capitalize">{round.difficulty}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted">Symbols</dt>
              <dd className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">{preset.name}</span>
                <span className="flex items-center gap-2 text-2xl font-bold">
                  <span className="text-cyan" aria-label={`First symbol: ${preset.symbols.X}`}>{preset.symbols.X}</span>
                  <span className="text-sm font-normal text-muted">vs</span>
                  <span className="text-magenta" aria-label={`Second symbol: ${preset.symbols.O}`}>{preset.symbols.O}</span>
                </span>
              </dd>
            </div>
          </dl>
          <ScoreBoard mode={round.mode} scores={scores} />
          <GameControls
            completed={completed}
            onNewRound={onNewRound}
            onResetMatch={onResetMatch}
            onChangeMode={onChangeMode}
          />
        </aside>
      </div>
    </section>
  );
}
