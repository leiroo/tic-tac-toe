import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GameStatus from "./GameStatus";
import GameCell from "./GameCell";
import PracticeControls from "./PracticeControls";
import ModeSelectionScreen from "@/components/screens/ModeSelectionScreen";
import { symbolPresets } from "@/data/symbolPresets";
import type { BoardResult, GameMode } from "@/types/game";

const active: BoardResult = { winner: null, winningCells: [], isDraw: false };
const modes: GameMode[] = ["computer", "friend", "practice"];
const noop = () => {};

describe.each(symbolPresets)("$name presentation", (preset) => {
  it.each(modes)("announces the active X and winning O symbols in %s mode", (mode) => {
    for (const result of [active, { ...active, winner: "O" as const, winningCells: [0, 1, 2] }]) {
      const html = renderToStaticMarkup(<GameStatus mode={mode} turn="X" result={result} preset={preset} />);
      const player = result.winner ?? "X";
      expect(html).toContain('role="status"');
      expect(html).toContain('aria-atomic="true"');
      expect(html).toContain(`${player} symbol: </span>${preset.symbols[player]}`);
      expect(html).toContain(player === "X" ? "text-cyan" : "text-magenta");
      if (result.winner) expect(html).toContain(mode === "computer" ? "Computer Wins!" : mode === "friend" ? "Player 2 Wins!" : "O Wins!");
    }
  });

  it("labels an occupied winning cell with its coordinate, internal player, and display symbol", () => {
    const html = renderToStaticMarkup(<GameCell index={4} value="O" preset={preset} disabled isWinning onSelect={noop} />);
    expect(html).toContain(`aria-label="Row 2, column 2: O, ${preset.symbols.O}, winning cell"`);
    expect(html).toContain('disabled=""');
    expect(html).toContain("text-magenta");
  });

  it("exposes the selected Practice symbol and disables controls after completion", () => {
    const html = renderToStaticMarkup(<PracticeControls selected="O" preset={preset} completed canUndo={false} onSelect={noop} onUndo={noop} />);
    expect(html).toContain(`aria-label="Select O (${preset.symbols.O})" aria-pressed="true" disabled=""`);
    expect(html.match(/disabled=""/g)).toHaveLength(3);
  });
});

it("announces a draw without attributing it to a player symbol", () => {
  const html = renderToStaticMarkup(<GameStatus mode="computer" turn="O" result={{ ...active, isDraw: true }} preset={symbolPresets[1]} />);
  expect(html).toContain("It&#x27;s a Draw!");
  expect(html).not.toContain("symbol:");
});

it("renders all modes as neutral navigation buttons", () => {
  const html = renderToStaticMarkup(<ModeSelectionScreen onSelect={noop} onBack={noop} />);
  expect(html).not.toContain("aria-pressed");
  expect(html).not.toMatch(/selected/i);
  for (const name of ["Play vs Computer", "Play vs Friend", "Practice Mode"]) {
    expect(html).toContain(`aria-label="${name}"`);
  }
});

it.each([
  ["setup", "Return to Setup?", "Returning to setup", "Leave &amp; Reset"],
  ["modes", "Change Game Mode?", "Changing modes", "Leave &amp; Change Mode"],
] as const)("explains the consequence of leaving for %s", async (purpose, title, action, confirm) => {
  const { default: ConfirmDialog } = await import("@/components/ui/ConfirmDialog");
  const html = renderToStaticMarkup(<ConfirmDialog purpose={purpose} modeName="Friend" isPractice={false} onConfirm={noop} onCancel={noop} />);
  for (const text of [title, action + " will end your current match and reset your scores. This cannot be undone.", "Keep Playing", confirm]) {
    expect(html).toContain(text);
  }
});
