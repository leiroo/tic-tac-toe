import { describe, expect, it } from "vitest";
import { createInitialGameState, gameReducer as reduceGame, type GameAction } from "./useTicTacToe";
import { analyzeBoard } from "@/lib/gameLogic";
import type { GameMode, RoundState, SymbolPresetId } from "@/types/game";

// Keep the M3 round assertions; scoring.test.ts checks the full session state.
function gameReducer(round: RoundState | null, action: GameAction): RoundState | null {
  return reduceGame({ ...createInitialGameState(), round }, action).round;
}

function startRound(mode: GameMode = "friend", presetId: SymbolPresetId = "classic"): RoundState {
  return gameReducer(null, { type: "start", mode, presetId })!;
}

function play(indices: number[]): RoundState {
  return indices.reduce((state, index) => (
    gameReducer(state, { type: "move", index, player: state.turn })!
  ), startRound());
}

describe("Friend round transitions", () => {
  it("starts with X, an empty board, and the chosen configuration", () => {
    const state = startRound("friend", "love-stars");
    expect(state).toEqual({
      board: Array(9).fill(null), turn: "X", mode: "friend", presetId: "love-stars", difficulty: "easy", scoreCredit: null,
    });
  });

  it("places X then O and alternates turns without mutating the previous state", () => {
    const initial = startRound();
    Object.freeze(initial);
    Object.freeze(initial.board);
    const first = gameReducer(initial, { type: "move", index: 0, player: "X" })!;
    expect(first.board[0]).toBe("X");
    expect(first.turn).toBe("O");
    expect(initial.board[0]).toBeNull();
    expect(first.board).not.toBe(initial.board);
    const second = gameReducer(first, { type: "move", index: 4, player: "O" })!;
    expect(second.board[4]).toBe("O");
    expect(second.turn).toBe("X");
  });

  it("ignores occupied-cell attempts and duplicate clicks without changing turn", () => {
    const state = play([0]);
    expect(gameReducer(state, { type: "move", index: 0, player: "O" })).toBe(state);
    expect(gameReducer(state, { type: "move", index: 0, player: "X" })).toBe(state);
    expect(state.turn).toBe("O");
  });

  it("ignores a stale or wrong-player action even on an empty cell", () => {
    const state = play([0]);
    expect(gameReducer(state, { type: "move", index: 1, player: "X" })).toBe(state);
  });

  it.each([-1, 9, 0.5, NaN, Infinity])("ignores invalid index %s without changing state", (index) => {
    const state = startRound();
    expect(gameReducer(state, { type: "move", index, player: "X" })).toBe(state);
  });

  it.each([
    { player: "X", moves: [0, 3, 1, 4, 2], cells: [0, 1, 2] },
    { player: "O", moves: [0, 3, 1, 4, 8, 5], cells: [3, 4, 5] },
  ])("finishes a $player win and rejects every later move", ({ player, moves, cells }) => {
    const state = play(moves);
    expect(analyzeBoard(state.board)).toEqual({ winner: player, winningCells: cells, isDraw: false });
    expect(state.turn).toBe(player);
    for (let index = 0; index < 9; index++) {
      expect(gameReducer(state, { type: "move", index, player: state.turn })).toBe(state);
    }
  });

  it("finishes a draw and rejects further moves", () => {
    const state = play([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(analyzeBoard(state.board)).toEqual({ winner: null, winningCells: [], isDraw: true });
    for (let index = 0; index < 9; index++) {
      expect(gameReducer(state, { type: "move", index, player: state.turn })).toBe(state);
    }
  });

  it("accepts a winning ninth turn as a win, not a draw", () => {
    const state = play([0, 1, 2, 3, 4, 5, 7, 6, 8]);
    expect(analyzeBoard(state.board)).toEqual({ winner: "X", winningCells: [0, 4, 8], isDraw: false });
  });

  it("handles a final move completing both diagonals", () => {
    const state = play([0, 1, 2, 3, 6, 5, 8, 7, 4]);
    const result = analyzeBoard(state.board);
    expect(result.winner).toBe("X");
    expect(result.winningCells.toSorted()).toEqual([0, 2, 4, 6, 8]);
  });

  it.each<SymbolPresetId>(["classic", "love-stars", "sun-moon", "shapes"])("keeps board values as X/O for %s", (presetId) => {
    const state = startRound("friend", presetId);
    const moved = gameReducer(state, { type: "move", index: 0, player: "X" })!;
    expect(moved.board[0]).toBe("X");
    expect(moved.presetId).toBe(presetId);
  });
});

describe("round navigation boundaries", () => {
  it.each<GameMode>(["practice"])("keeps %s non-playable", (mode) => {
    const state = startRound(mode);
    expect(gameReducer(state, { type: "move", index: 0, player: "X" })).toBe(state);
  });

  it("ignores moves before a round has started", () => {
    expect(gameReducer(null, { type: "move", index: 0, player: "X" })).toBeNull();
  });

  it("discards an unfinished round on leave and starts the next selection fresh", () => {
    const old = play([0, 4]);
    const left = gameReducer(old, { type: "leave" });
    expect(left).toBeNull();
    expect(gameReducer(left, { type: "move", index: 2, player: "X" })).toBeNull();
    const next = gameReducer(left, { type: "start", mode: "friend", presetId: "shapes" })!;
    expect(next.board.every((cell) => cell === null)).toBe(true);
    expect(next.turn).toBe("X");
    expect(next.presetId).toBe("shapes");
  });
});
