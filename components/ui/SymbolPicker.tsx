import { symbolPresets } from "@/data/symbolPresets";
import type { SymbolPresetId } from "@/types/game";

type SymbolPickerProps = {
  selectedId: SymbolPresetId;
  onChange: (id: SymbolPresetId) => void;
};

export default function SymbolPicker({ selectedId, onChange }: SymbolPickerProps) {
  return (
    <fieldset>
      <legend className="mb-4 text-sm font-semibold text-muted">Symbol presets</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {symbolPresets.map((preset) => (
          <label key={preset.id} className="relative cursor-pointer">
            <input
              className="peer sr-only"
              type="radio"
              name="symbol-preset"
              value={preset.id}
              checked={selectedId === preset.id}
              onChange={() => onChange(preset.id)}
              aria-label={`${preset.name} (${preset.symbols.X} / ${preset.symbols.O})`}
            />
            <span className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-muted/20 bg-surface px-3 py-5 text-center transition-colors hover:border-purple peer-checked:border-cyan peer-checked:bg-cyan/5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-cyan">
              <span className="flex items-center gap-3 text-3xl font-bold" aria-hidden="true">
                <span className="text-cyan">{preset.symbols.X}</span>
                <span className="text-magenta">{preset.symbols.O}</span>
              </span>
              <span className="mt-4 text-sm font-semibold">{preset.name}</span>
              <span className="mt-2 text-xs text-cyan">{selectedId === preset.id ? "Selected" : "Choose pair"}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
