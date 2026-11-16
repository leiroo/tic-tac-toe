type GameControlsProps = {
  completed: boolean;
  isPractice: boolean;
  onNewRound: () => void;
  onResetMatch: () => void;
  onChangeMode: () => void;
};

export default function GameControls({ completed, isPractice, onNewRound, onResetMatch, onChangeMode }: GameControlsProps) {
  return (
    <div aria-label="Round controls" className="mt-6 flex flex-col gap-3">
      <button type="button" onClick={onNewRound} className="button-primary">{completed ? "Play Again" : "New Round"}</button>
      <button type="button" onClick={onResetMatch} className="button-secondary">{isPractice ? "Reset Scores" : "Reset Match"}</button>
      <button type="button" onClick={onChangeMode} className="button-secondary">Change Mode</button>
    </div>
  );
}
