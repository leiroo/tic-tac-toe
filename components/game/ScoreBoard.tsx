import type { GameMode, ModeScores } from "@/types/game";

const labels: Record<GameMode, [string, string]> = {
  computer: ["Human", "Computer"],
  friend: ["Player 1", "Player 2"],
  practice: ["X", "O"],
};

export default function ScoreBoard({ mode, scores }: { mode: GameMode; scores: ModeScores }) {
  return (
    <section aria-labelledby="scoreboard-title" className="mt-4 border-t border-muted/20 pt-3">
      <h3 id="scoreboard-title" className="text-sm font-semibold">Match scores</h3>
      <dl aria-live="polite" aria-atomic="true" className="mt-2 grid grid-cols-3 gap-2 text-center">
        {[{ key: "X", label: labels[mode][0], color: "text-cyan" },
          { key: "O", label: labels[mode][1], color: "text-magenta" },
          { key: "draws", label: "Draws", color: "text-purple" }].map(({ key, label, color }) => (
          <div key={key}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{scores[key as keyof ModeScores]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
