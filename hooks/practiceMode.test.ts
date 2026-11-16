import { describe, expect, it } from "vitest";
import { createInitialGameState, gameReducer } from "./useTicTacToe";
import { analyzeBoard } from "@/lib/gameLogic";
import type { GameState, Player, SymbolPresetId } from "@/types/game";

function start(state = createInitialGameState(), presetId: SymbolPresetId = "classic") {
  return gameReducer(state, { type: "start", mode: "practice", presetId });
}

function place(state: GameState, index: number, player = state.round!.turn) {
  const selected = gameReducer(state, { type: "selectSymbol", player });
  return gameReducer(selected, { type: "move", index, player });
}

function play(cells: [number, Player][], state = start()) {
  return cells.reduce((previous, [index, player]) => place(previous, index, player), state);
}

const xWin: [number, Player][] = [[0, "X"], [1, "X"], [2, "X"]];
const draw: [number, Player][] = [[0, "X"], [1, "O"], [2, "X"], [3, "X"], [4, "O"], [5, "O"], [6, "O"], [7, "X"], [8, "X"]];

describe("Practice placement", () => {
  it("starts with X and allows consecutive X or O placements without alternating", () => {
    let state = start();
    expect(state.round!.turn).toBe("X");
    expect(state.round!.history).toEqual([]);
    state = place(state, 0);
    state = place(state, 1);
    expect(state.round!.turn).toBe("X");
    const beforeSelection = state;
    state = gameReducer(state, { type: "selectSymbol", player: "O" });
    expect(state.round!.board).toBe(beforeSelection.round!.board);
    expect(state.round!.history).toBe(beforeSelection.round!.history);
    state = place(state, 3);
    state = place(state, 4);
    expect(state.round!.board.slice(0, 5)).toEqual(["X", "X", null, "O", "O"]);
    expect(state.round!.turn).toBe("O");
    expect(state.round!.history).toHaveLength(4);
  });

  it.each([0, -1, 9, 0.5, NaN])("rejects occupied/invalid cell %s without changing history", (index) => {
    const state = place(start(), 0);
    expect(gameReducer(state, { type: "move", index, player: "X" })).toBe(state);
  });

  it("rejects a stale selection and keeps previous state immutable", () => {
    const before = place(start(), 0);
    Object.freeze(before.round!.board);
    Object.freeze(before.round!.history);
    Object.freeze(before.round);
    const selected = gameReducer(before, { type: "selectSymbol", player: "O" });
    expect(gameReducer(selected, { type: "move", index: 1, player: "X" })).toBe(selected);
    const moved = place(selected, 1);
    expect(before.round!.board[1]).toBeNull();
    expect(before.round!.history).toHaveLength(1);
    expect(moved.round!.history[1]).toBe(before.round!.board);
  });

  it.each<SymbolPresetId>(["classic", "love-stars", "sun-moon", "shapes"])("stores internal symbols with preset %s", (preset) => {
    const state = place(start(createInitialGameState(), preset), 4, "O");
    expect(state.round!.board[4]).toBe("O");
    expect(state.round!.presetId).toBe(preset);
  });
});

describe.each<Player>(["X", "O"])("Practice %s wins", (player) => {
  it.each([
    [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
    [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
  ])("detects line %i/%i/%i and credits only once", (a, b, c) => {
    const state = play([[a, player], [b, player], [c, player]]);
    expect(analyzeBoard(state.round!.board)).toEqual({ winner: player, winningCells: [a, b, c], isDraw: false });
    expect(state.scores.practice[player]).toBe(1);
    expect(state.round!.scoreCredit).toBe(player);
    expect(gameReducer(state, { type: "selectSymbol", player: player === "X" ? "O" : "X" })).toBe(state);
    for (let index = 0; index < 9; index++) {
      expect(gameReducer(state, { type: "move", index, player })).toBe(state);
    }
  });
});

describe("Practice Undo and round boundaries", () => {
  it("restores boards in reverse order without changing the selected symbol", () => {
    const first = place(start(), 0);
    const second = place(first, 4, "O");
    const selected = gameReducer(second, { type: "selectSymbol", player: "X" });
    const undone = gameReducer(selected, { type: "undo" });
    expect(undone.round!.board).toBe(first.round!.board);
    expect(undone.round!.turn).toBe("X");
    const empty = gameReducer(undone, { type: "undo" });
    expect(empty.round!.history).toHaveLength(0);
    expect(empty.round!.board.every((cell) => cell === null)).toBe(true);
    expect(gameReducer(empty, { type: "undo" })).toBe(empty);
  });

  it.each([
    { name: "X win", moves: xWin, key: "X" as const },
    { name: "O win", moves: [[0, "O"], [1, "O"], [2, "O"]] as [number, Player][], key: "O" as const },
    { name: "draw", moves: draw, key: "draws" as const },
  ])("reverses $name credit once and can credit the replayed result", ({ moves, key }) => {
    const initial = createInitialGameState();
    initial.scores.practice = { X: 2, O: 3, draws: 4 };
    const completed = play(moves, start(initial));
    expect(completed.scores.practice[key]).toBe(initial.scores.practice[key] + 1);
    const undone = gameReducer(completed, { type: "undo" });
    expect(undone.scores).toEqual(initial.scores);
    expect(undone.round!.scoreCredit).toBeNull();
    expect(analyzeBoard(undone.round!.board)).toEqual({ winner: null, winningCells: [], isDraw: false });
    const [index, player] = moves[moves.length - 1];
    const replayed = place(undone, index, player);
    expect(replayed.scores).toEqual(completed.scores);
    let state = replayed;
    for (let count = 0; count < 12; count++) state = gameReducer(state, { type: "undo" });
    expect(state.scores).toEqual(initial.scores);
    expect(state.round!.history).toEqual([]);
  });

  it("credits a ninth-move double-diagonal win once and reverses it once", () => {
    const state = play([[0, "X"], [1, "O"], [2, "X"], [3, "O"], [6, "X"], [5, "O"], [8, "X"], [7, "O"], [4, "X"]]);
    expect(analyzeBoard(state.round!.board)).toEqual({ winner: "X", winningCells: [0, 4, 8, 2, 6], isDraw: false });
    expect(state.scores.practice).toEqual({ X: 1, O: 0, draws: 0 });
    expect(gameReducer(state, { type: "undo" }).scores.practice).toEqual({ X: 0, O: 0, draws: 0 });
  });

  it("is deterministic when React evaluates the same winning action twice", () => {
    const state = play([[0, "X"], [1, "X"]]);
    const action = { type: "move", index: 2, player: "X" } as const;
    expect(gameReducer(state, action)).toEqual(gameReducer(state, action));
    expect(state.scores.practice.X).toBe(0);
    expect(gameReducer(state, action).scores.practice.X).toBe(1);
  });

  it("New Round clears history, selects X, and preserves earned scores", () => {
    const won = play([[0, "O"], [1, "O"], [2, "O"]]);
    const fresh = gameReducer(won, { type: "newRound" });
    expect(fresh.round).toMatchObject({ turn: "X", history: [], scoreCredit: null });
    expect(fresh.round!.board.every((cell) => cell === null)).toBe(true);
    expect(fresh.scores).toBe(won.scores);
    expect(gameReducer(fresh, { type: "undo" })).toBe(fresh);
  });

  it.each([false, true])("Reset Match clears history and only Practice scores (completed=%s)", (completed) => {
    const initial = createInitialGameState();
    initial.scores = { computer: { X: 1, O: 2, draws: 3 }, friend: { X: 4, O: 5, draws: 6 }, practice: { X: 7, O: 8, draws: 9 } };
    const played = play(completed ? xWin : [[0, "O"]], start(initial));
    const reset = gameReducer(played, { type: "resetMatch" });
    expect(reset.round).toMatchObject({ turn: "X", history: [], scoreCredit: null });
    expect(reset.round!.board.every((cell) => cell === null)).toBe(true);
    expect(reset.scores.practice).toEqual({ X: 0, O: 0, draws: 0 });
    expect(reset.scores.friend).toBe(initial.scores.friend);
    expect(reset.scores.computer).toBe(initial.scores.computer);
    expect(reset.nextStarter).toBe(initial.nextStarter);
    for (let count = 0; count < 12; count++) expect(gameReducer(reset, { type: "undo" })).toBe(reset);
    expect(play(xWin, reset).scores.practice.X).toBe(1);
  });

  it("mode changes discard history, preserve scores, and start Practice with X", () => {
    const won = play(xWin);
    let state = gameReducer(won, { type: "leave" });
    expect(state.round).toBeNull();
    expect(gameReducer(state, { type: "undo" })).toBe(state);
    state = gameReducer(state, { type: "enterMode", mode: "friend" });
    state = gameReducer(state, { type: "start", mode: "friend", presetId: "classic" });
    expect(gameReducer(state, { type: "undo" })).toBe(state);
    state = gameReducer(state, { type: "enterMode", mode: "practice" });
    state = start(state);
    expect(state.round).toMatchObject({ turn: "X", history: [] });
    expect(state.scores).toBe(won.scores);
  });

  it.each(["friend", "computer"] as const)("does not add Practice selection or Undo to %s", (mode) => {
    let state = gameReducer(createInitialGameState(), { type: "start", mode, presetId: "classic" });
    state = gameReducer(state, { type: "move", index: 0, player: "X" });
    expect(state.round!.history).toEqual([]);
    expect(gameReducer(state, { type: "selectSymbol", player: "X" })).toBe(state);
    expect(gameReducer(state, { type: "undo" })).toBe(state);
  });
});
