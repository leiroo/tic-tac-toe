import GameBoard from "@/components/game/GameBoard";
import GameStatus from "@/components/game/GameStatus";
import ScoreBoard from "@/components/game/ScoreBoard";
import GameControls from "@/components/game/GameControls";
import type { BoardResult, ModeScores, RoundState, SymbolPreset } from "@/types/game";

type GameScreenProps = {
  modeName: string;
  preset: SymbolPreset;
  round: RoundState;
  result: BoardResult;
  scores: ModeScores;
  onNewRound: () => void;
  onResetMatch: () => void;
  onMove: (index: number) => void;
  onBack: () => void;
  onChangeMode: () => void;
};

export default function GameScreen({ modeName, preset, round, result, scores, onNewRound, onResetMatch, onMove, onBack, onChangeMode }: GameScreenProps) {
  const isPlayable = round.mode !== "practice";

  return (
    <section aria-labelledby="game-title">
      <button type="button" onClick={onBack} className="button-back">← Back to Setup</button>
      <p className="eyebrow mt-8">03 / Your board</p>
      <h1 id="game-title" tabIndex={-1} className="screen-title">{modeName}</h1>
      <GameStatus mode={round.mode} turn={round.turn} result={result} preset={preset} />

      <div className="mt-8 grid items-start gap-8 md:grid-cols-[1fr_300px] md:gap-12">
        <GameBoard
          board={round.board}
          preset={preset}
          winningCells={result.winningCells}
          disabled={!isPlayable || (round.mode === "computer" && round.turn === "O") || result.winner !== null || result.isDraw}
          onMove={onMove}
        />
        <aside aria-label="Game setup summary" className="rounded-2xl border border-muted/20 bg-surface p-6">
          <h2 className="text-lg font-bold">Your setup</h2>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Mode</dt>
              <dd className="mt-2 text-sm">{modeName}</dd>
            </div>
            {round.mode === "computer" && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted">Difficulty</dt>
                <dd className="mt-2 text-sm capitalize">{round.difficulty}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Symbols</dt>
              <dd className="mt-2">
                <span className="text-sm">{preset.name}</span>
                <span className="mt-3 flex items-center gap-4 text-3xl font-bold">
                  <span className="text-cyan" aria-label={`First symbol: ${preset.symbols.X}`}>{preset.symbols.X}</span>
                  <span className="text-sm font-normal text-muted">vs</span>
                  <span className="text-magenta" aria-label={`Second symbol: ${preset.symbols.O}`}>{preset.symbols.O}</span>
                </span>
              </dd>
            </div>
          </dl>
          <ScoreBoard mode={round.mode} scores={scores} />
          <GameControls
            isPractice={round.mode === "practice"}
            completed={result.winner !== null || result.isDraw}
            onNewRound={onNewRound}
            onResetMatch={onResetMatch}
            onChangeMode={onChangeMode}
          />
        </aside>
      </div>
    </section>
  );
}
