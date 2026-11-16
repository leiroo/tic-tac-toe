type GameControlsProps = {
  completed: boolean;
  onNewRound: () => void;
  onResetMatch: () => void;
  onChangeMode: () => void;
};

export default function GameControls({ completed, onNewRound, onResetMatch, onChangeMode }: GameControlsProps) {
  return (
    <div aria-label="Round controls" className="mt-6 flex flex-col gap-3">
      <button type="button" onClick={onNewRound} className="button-primary">{completed ? "Play Again" : "New Round"}</button>
      <button type="button" onClick={onResetMatch} className="button-secondary">Reset Match</button>
      <button type="button" onClick={onChangeMode} className="button-secondary">Change Mode</button>
    </div>
  );
}
