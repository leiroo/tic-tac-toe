import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialGameState, gameReducer, scheduleComputerTurn, type GameAction } from "./useTicTacToe";
import type { Difficulty } from "@/types/game";

describe("difficulty selection and rounds", () => {
  afterEach(() => vi.useRealTimers());

  it.each<Difficulty>(["easy", "medium", "hard"])("Reset Match keeps %s and the preset while canceling a pending opening", (difficulty) => {
    vi.useFakeTimers();
    let state = gameReducer(createInitialGameState(), { type: "setDifficulty", difficulty });
    state = gameReducer(state, { type: "start", mode: "computer", presetId: "shapes" });
    state = gameReducer(state, { type: "newRound" });
    const stale: GameAction = { type: "computerMove", index: 0, roundId: state.roundId, board: state.round!.board };
    const dispatch = vi.fn();
    const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch);
    state = gameReducer(state, { type: "resetMatch" });
    cleanup();
    scheduleComputerTurn(state.round, state.roundId, dispatch);
    vi.runAllTimers();
    expect(dispatch).not.toHaveBeenCalled();
    expect(state.round).toMatchObject({ turn: "X", difficulty, presetId: "shapes", scoreCredit: null });
    expect(state.round!.board.every((cell) => cell === null)).toBe(true);
    expect(gameReducer(state, stale)).toBe(state);
    expect(gameReducer(state, { type: "newRound" }).round!.turn).toBe("O");
  });

  it("defaults to Easy and preserves selection across rounds, setup, and mode changes", () => {
    let state = createInitialGameState();
    expect(state.difficulty).toBe("easy");
    state = gameReducer(state, { type: "setDifficulty", difficulty: "hard" });
    state = gameReducer(state, { type: "start", mode: "computer", presetId: "shapes" });
    state = gameReducer(state, { type: "newRound" });
    expect(state.round!.difficulty).toBe("hard");
    state = gameReducer(state, { type: "leave" });
    expect(state.difficulty).toBe("hard");
    state = gameReducer(state, { type: "start", mode: "friend", presetId: "classic" });
    state = gameReducer(state, { type: "leave" });
    expect(state.difficulty).toBe("hard");
    const scores = state.scores;
    const sequence = state.nextStarter;
    state = gameReducer(state, { type: "setDifficulty", difficulty: "medium" });
    expect(state.scores).toBe(scores);
    expect(state.nextStarter).toBe(sequence);
    state = gameReducer(state, { type: "start", mode: "computer", presetId: "classic" });
    expect(state.round!.difficulty).toBe("medium");
  });

  it("rejects mid-round changes and old responses after changing difficulty in setup", () => {
    let state = gameReducer(createInitialGameState(), { type: "start", mode: "computer", presetId: "classic" });
    state = gameReducer(state, { type: "move", index: 0, player: "X" });
    const oldMove: GameAction = { type: "computerMove", index: 4, roundId: state.roundId, board: state.round!.board };
    expect(gameReducer(state, { type: "setDifficulty", difficulty: "hard" })).toBe(state);
    state = gameReducer(state, { type: "leave" });
    state = gameReducer(state, { type: "setDifficulty", difficulty: "hard" });
    state = gameReducer(state, { type: "start", mode: "computer", presetId: "classic" });
    expect(state.round!.turn).toBe("O");
    expect(gameReducer(state, oldMove)).toBe(state);
  });

  it.each<Difficulty>(["easy", "medium", "hard"])("automatically opens O rounds with %s and allows the next human turn", (difficulty) => {
    vi.useFakeTimers();
    let state = gameReducer(createInitialGameState(), { type: "setDifficulty", difficulty });
    state = gameReducer(state, { type: "start", mode: "computer", presetId: "classic" });
    state = gameReducer(state, { type: "newRound" });
    const dispatch = vi.fn((action: GameAction) => { state = gameReducer(state, action); });
    scheduleComputerTurn(state.round, state.roundId, dispatch, () => 0);
    vi.advanceTimersByTime(400);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(state.round!.board.filter((cell) => cell === "O")).toHaveLength(1);
    expect(state.round!.turn).toBe("X");
    const empty = state.round!.board.findIndex((cell) => cell === null);
    state = gameReducer(state, { type: "move", index: empty, player: "X" });
    expect(state.round!.board[empty]).toBe("X");
    expect(state.round!.turn).toBe("O");
  });
});
