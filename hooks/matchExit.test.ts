import { afterEach, expect, it, vi } from "vitest";
import { createInitialGameState, gameReducer, scheduleComputerTurn, type GameAction } from "./useTicTacToe";

afterEach(() => vi.useRealTimers());

it.each(["computer", "friend", "practice"] as const)("exiting %s clears wins, draws and progress but keeps difficulty", (mode) => {
  let state = gameReducer(createInitialGameState(), { type: "setDifficulty", difficulty: "hard" });
  state = gameReducer(state, { type: "start", mode, presetId: "shapes" });
  state = gameReducer(state, { type: "move", index: 0, player: "X" });
  const other = mode === "friend" ? "practice" : "friend";
  const otherScores = { X: 4, O: 2, draws: 1 };
  state = { ...state, scores: { ...state.scores, [other]: otherScores, [mode]: { X: 2, O: 1, draws: 3 } } };
  const left = gameReducer(state, { type: "leave" });
  expect(left.round).toBeNull();
  expect(left.difficulty).toBe("hard");
  expect(left.scores[mode]).toEqual({ X: 0, O: 0, draws: 0 });
  expect(left.scores[other]).toEqual(otherScores);
  expect(left.nextStarter).toEqual({ computer: "X", friend: "X" });
  const reentered = gameReducer(left, { type: "start", mode, presetId: "shapes" });
  expect(reentered.round).toMatchObject({ turn: "X", history: [], presetId: "shapes", difficulty: "hard" });
  expect(reentered.round!.board.every(cell => cell === null)).toBe(true);
});

it("confirmed exit cancels the timer and rejects a stale action after reentry", () => {
  vi.useFakeTimers();
  let state = gameReducer(createInitialGameState(), { type: "start", mode: "computer", presetId: "classic" });
  state = gameReducer(state, { type: "move", index: 0, player: "X" });
  const stale: GameAction = { type: "computerMove", index: 4, board: state.round!.board, roundId: state.roundId };
  const dispatch = vi.fn();
  const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch);
  state = gameReducer(state, { type: "leave" });
  cleanup();
  vi.runAllTimers();
  expect(dispatch).not.toHaveBeenCalled();
  state = gameReducer(state, { type: "start", mode: "computer", presetId: "classic" });
  expect(gameReducer(state, stale)).toBe(state);
});

it("a dialog-only render leaves a valid pending computer turn usable", () => {
  vi.useFakeTimers();
  let state = gameReducer(createInitialGameState(), { type: "start", mode: "computer", presetId: "classic" });
  state = gameReducer(state, { type: "move", index: 0, player: "X" });
  const dispatch = vi.fn((action: GameAction) => { state = gameReducer(state, action); });
  scheduleComputerTurn(state.round, state.roundId, dispatch, () => 0);
  // Opening/canceling the UI dialog dispatches no game action or cleanup.
  vi.advanceTimersByTime(400);
  expect(dispatch).toHaveBeenCalledTimes(1);
  expect(state.round!.board.filter(cell => cell === "O")).toHaveLength(1);
});
