import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialGameState, gameReducer, scheduleComputerTurn, type GameAction } from "./useTicTacToe";
import { analyzeBoard } from "@/lib/gameLogic";
import type { GameState } from "@/types/game";

function start(state = createInitialGameState()) {
  return gameReducer(state, { type: "start", mode: "computer", presetId: "shapes" });
}

function human(state: GameState, index: number) {
  return gameReducer(state, { type: "move", index, player: "X" });
}

function computerAction(state: GameState, index: number): Extract<GameAction, { type: "computerMove" }> {
  return { type: "computerMove", index, roundId: state.roundId, board: state.round!.board };
}

function play(moves: number[]) {
  return moves.reduce((state, index, turn) => turn % 2 === 0
    ? human(state, index)
    : gameReducer(state, computerAction(state, index)), start());
}

describe("Computer rounds", () => {
  it("starts with human X and rejects computer or human-O actions before their turn", () => {
    const state = start();
    expect(state.round).toMatchObject({ turn: "X", mode: "computer", presetId: "shapes" });
    expect(state.round!.board.every((cell) => cell === null)).toBe(true);
    expect(gameReducer(state, computerAction(state, 0))).toBe(state);
    expect(gameReducer(state, { type: "move", index: 0, player: "O" })).toBe(state);
  });

  it("accepts one X then one O, locking out rapid human clicks and duplicate computer actions", () => {
    const waiting = human(start(), 0);
    expect(waiting.round!.turn).toBe("O");
    expect(human(waiting, 1)).toBe(waiting);
    expect(gameReducer(waiting, { type: "move", index: 1, player: "O" })).toBe(waiting);
    expect(gameReducer(waiting, computerAction(waiting, 0))).toBe(waiting);
    const action = computerAction(waiting, 4);
    const moved = gameReducer(waiting, action);
    expect(moved.round!.board).toEqual(["X", null, null, null, "O", null, null, null, null]);
    expect(moved.round!.turn).toBe("X");
    expect(gameReducer(moved, action)).toBe(moved);
    // Even during a later O turn, a response for an older board is invalid.
    const later = human(moved, 1);
    expect(gameReducer(later, { ...action, index: 2 })).toBe(later);
  });

  it.each([
    { name: "human win", moves: [0, 3, 1, 4, 2], scores: { X: 1, O: 0, draws: 0 } },
    { name: "computer win", moves: [0, 3, 1, 4, 8, 5], scores: { X: 0, O: 1, draws: 0 } },
    { name: "draw", moves: [0, 1, 2, 4, 3, 5, 7, 6, 8], scores: { X: 0, O: 0, draws: 1 } },
    { name: "ninth-cell win", moves: [0, 1, 2, 3, 4, 5, 7, 6, 8], scores: { X: 1, O: 0, draws: 0 } },
  ])("credits $name once, preserves other modes, and rejects all later moves", ({ moves, scores }) => {
    const state = play(moves);
    expect(state.scores.computer).toEqual(scores);
    expect(state.scores.friend).toEqual({ X: 0, O: 0, draws: 0 });
    expect(state.scores.practice).toEqual({ X: 0, O: 0, draws: 0 });
    for (let index = 0; index < 9; index++) {
      expect(human(state, index)).toBe(state);
      expect(gameReducer(state, computerAction(state, index))).toBe(state);
    }
    const next = gameReducer(state, { type: "newRound" });
    expect(next.round!.turn).toBe("O");
    expect(next.round!.presetId).toBe("shapes");
    expect(next.scores).toBe(state.scores);
    const reset = gameReducer(state, { type: "resetMatch" });
    expect(reset.round!.board.every((cell) => cell === null)).toBe(true);
    expect(reset.round!.turn).toBe("X");
    expect(reset.scores.computer).toEqual({ X: 0, O: 0, draws: 0 });
    expect(gameReducer(reset, computerAction(reset, 8))).toBe(reset);
  });

  it("rejects a stale response after restart, leave, mode change, and return to Computer", () => {
    const waiting = human(start(), 0);
    const stale = computerAction(waiting, 4);
    const restarted = gameReducer(waiting, { type: "newRound" });
    expect(restarted.roundId).not.toBe(waiting.roundId);
    expect(gameReducer(restarted, stale)).toBe(restarted);
    // Round identity protects even an action carrying the new board.
    expect(gameReducer(restarted, { ...stale, board: restarted.round!.board })).toBe(restarted);
    const left = gameReducer(waiting, { type: "leave" });
    expect(gameReducer(left, stale)).toBe(left);
    const friend = gameReducer(left, { type: "start", mode: "friend", presetId: "classic" });
    expect(gameReducer(friend, stale)).toBe(friend);
    const returned = human(start(friend), 0);
    expect(gameReducer(returned, stale)).toBe(returned);
  });
});

describe("computer effect timer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("waits 400 ms and dispatches exactly one legal O move", () => {
    let state = human(start(), 0);
    const dispatch = vi.fn((action: GameAction) => { state = gameReducer(state, action); });
    scheduleComputerTurn(state.round, state.roundId, dispatch, () => 0);
    vi.advanceTimersByTime(399);
    expect(dispatch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(state.round!.board[1]).toBe("O");
    expect(state.round!.turn).toBe("X");
    vi.advanceTimersByTime(1000);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("cleanup followed by setup (Strict Mode) leaves only one response", () => {
    const state = human(start(), 0);
    const dispatch = vi.fn();
    const random = vi.fn(() => 0);
    const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch, random);
    cleanup();
    scheduleComputerTurn(state.round, state.roundId, dispatch, random);
    vi.runAllTimers();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(random).toHaveBeenCalledTimes(1);
  });

  it("Reset Match during thinking clears the board and cancels the response", () => {
    let state = human(start(), 0);
    const board = state.round!.board;
    const stale: GameAction = { type: "computerMove", index: 1, roundId: state.roundId, board };
    const dispatch = vi.fn((action: GameAction) => { state = gameReducer(state, action); });
    const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch, () => 0);
    vi.advanceTimersByTime(200);
    state = gameReducer(state, { type: "resetMatch" });
    cleanup();
    scheduleComputerTurn(state.round, state.roundId, dispatch, () => 0);
    expect(state.round!.board.every((cell) => cell === null)).toBe(true);
    vi.runAllTimers();
    expect(dispatch).not.toHaveBeenCalled();
    expect(gameReducer(state, stale)).toBe(state);
    expect(state.round!.turn).toBe("X");
  });

  it.each(["newRound", "leave", "unmount"] as const)("cancels a pending response on %s", (action) => {
    let state = human(start(), 0);
    const dispatch = vi.fn();
    const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch);
    vi.advanceTimersByTime(200);
    cleanup();
    if (action !== "unmount") {
      state = gameReducer(state, { type: action });
      scheduleComputerTurn(state.round, state.roundId, dispatch);
    }
    vi.runAllTimers();
    if (action === "newRound") {
      expect(dispatch).toHaveBeenCalledExactlyOnceWith({
        type: "computerMove", index: expect.any(Number), roundId: state.roundId, board: state.round!.board,
      });
      expect(state.round!.board.every((cell) => cell === null)).toBe(true);
    } else {
      expect(dispatch).not.toHaveBeenCalled();
    }
  });

  it("does not schedule on human turns, other modes, or terminal human/computer moves", () => {
    const dispatch = vi.fn();
    const states = [start(), createInitialGameState(),
      play([0, 3, 1, 4, 2]), play([0, 3, 1, 4, 8, 5]),
      play([0, 1, 2, 4, 3, 5, 7, 6, 8]),
      ...(["friend", "practice"] as const).map((mode) => gameReducer(createInitialGameState(), { type: "start", mode, presetId: "classic" })),
    ];
    for (const state of states) scheduleComputerTurn(state.round, state.roundId, dispatch);
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers();
    expect(dispatch).not.toHaveBeenCalled();
    expect(analyzeBoard(states[3].round!.board).winner).toBe("O");
  });
});
