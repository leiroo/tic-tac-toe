type GameControlsProps = {
  completed: boolean;
  onNewRound: () => void;
  onResetScores: () => void;
  onChangeMode: () => void;
};

export default function GameControls({ completed, onNewRound, onResetScores, onChangeMode }: GameControlsProps) {
  return (
    <div aria-label="Round controls" className="mt-6 flex flex-col gap-3">
      <button type="button" onClick={onNewRound} className="button-primary">{completed ? "Play Again" : "New Round"}</button>
      <button type="button" onClick={onResetScores} className="button-secondary">Reset Scores</button>
      <button type="button" onClick={onChangeMode} className="button-secondary">Change Mode</button>
    </div>
  );
}
