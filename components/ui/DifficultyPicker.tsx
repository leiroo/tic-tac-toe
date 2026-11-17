import type { Difficulty } from "@/types/game";

const options: { id: Difficulty; label: string; description: string }[] = [
  { id: "easy", label: "Easy", description: "Random moves" },
  { id: "medium", label: "Medium", description: "Wins and blocks" },
  { id: "hard", label: "Hard", description: "Unbeatable play" },
];

export default function DifficultyPicker({ selected, onChange }: {
  selected: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-muted">Computer difficulty</legend>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {options.map(({ id, label, description }) => (
          <label key={id} className="cursor-pointer">
            <input
              type="radio"
              name="difficulty"
              value={id}
              checked={selected === id}
              onChange={() => onChange(id)}
              aria-label={label}
              className="peer sr-only"
            />
            <span className="flex h-full min-h-20 flex-col justify-center rounded-xl border border-muted/20 bg-surface px-3 py-2 transition-colors hover:border-purple peer-checked:border-cyan peer-checked:bg-cyan/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-cyan">
              <span className="text-sm font-semibold">{label}</span>
              <span className="mt-1 text-xs text-muted">{description}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
