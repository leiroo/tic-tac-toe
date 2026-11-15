import { afterEach, describe, expect, it, vi } from "vitest";
import { createInitialGameState, gameReducer, scheduleComputerTurn, type GameAction } from "./useTicTacToe";
import type { GameMode, GameState } from "@/types/game";

function start(state: GameState, mode: GameMode) {
  return gameReducer(state, { type: "start", mode, presetId: "classic" });
}

describe("independent starting-player sequences", () => {
  afterEach(() => vi.useRealTimers());

  it.each(["friend", "computer"] as const)("alternates X, O, X in %s even when rounds are unfinished", (mode) => {
    let state = start(createInitialGameState(), mode);
    const starters = [state.round!.turn];
    state = gameReducer(state, { type: "move", index: 4, player: "X" });
    for (let round = 0; round < 2; round++) {
      state = gameReducer(state, { type: "newRound" });
      starters.push(state.round!.turn);
      expect(state.round!.board.every((cell) => cell === null)).toBe(true);
    }
    expect(starters).toEqual(["X", "O", "X"]);
    expect(state.scores).toEqual(createInitialGameState().scores);
  });

  it("preserves each sequence through mode changes and advances on Start Game", () => {
    let state = start(createInitialGameState(), "computer");
    state = gameReducer(state, { type: "leave" });
    expect(state.nextStarter).toEqual({ computer: "O", friend: "X" });
    state = start(state, "friend");
    expect(state.round!.turn).toBe("X");
    state = start(state, "computer");
    expect(state.round!.turn).toBe("O");
    state = start(state, "friend");
    expect(state.round!.turn).toBe("O");
    state = start(state, "computer");
    expect(state.round!.turn).toBe("X");
  });

  it("Reset Scores changes neither the current turn nor the next starter", () => {
    const state = gameReducer(start(createInitialGameState(), "friend"), { type: "newRound" });
    const reset = gameReducer(state, { type: "resetScores" });
    expect(reset.round!.turn).toBe("O");
    expect(reset.nextStarter).toBe(state.nextStarter);
    expect(gameReducer(reset, { type: "newRound" }).round!.turn).toBe("X");
  });

  it("allows O to start and win a Friend round without changing player symbols", () => {
    let state = gameReducer(start(createInitialGameState(), "friend"), { type: "newRound" });
    for (const index of [0, 3, 1, 4, 2]) {
      state = gameReducer(state, { type: "move", index, player: state.round!.turn });
    }
    expect(state.round!.board.slice(0, 3)).toEqual(["O", "O", "O"]);
    expect(state.scores.friend).toEqual({ X: 0, O: 1, draws: 0 });
  });

  it("automatically opens with O, and cancels an opening move when restarted", () => {
    vi.useFakeTimers();
    let state = gameReducer(start(createInitialGameState(), "computer"), { type: "newRound" });
    const dispatch = vi.fn((action: GameAction) => { state = gameReducer(state, action); });
    scheduleComputerTurn(state.round, state.roundId, dispatch, () => 0);
    vi.advanceTimersByTime(400);
    expect(state.round!.board[0]).toBe("O");
    expect(state.round!.turn).toBe("X");
    expect(dispatch).toHaveBeenCalledTimes(1);

    state = gameReducer(state, { type: "newRound" }); // X
    state = gameReducer(state, { type: "newRound" }); // O
    const opening = { type: "computerMove", index: 0, roundId: state.roundId, board: state.round!.board } as const;
    const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch);
    state = gameReducer(state, { type: "newRound" }); // X again
    cleanup();
    vi.runAllTimers();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(gameReducer(state, opening)).toBe(state);
    expect(state.round!.board.every((cell) => cell === null)).toBe(true);
  });

  it("leaves Practice unchanged and resets sequences in a fresh page session", () => {
    let state = start(createInitialGameState(), "computer");
    const sequence = state.nextStarter;
    state = start(state, "practice");
    state = gameReducer(state, { type: "newRound" });
    expect(state.round!.turn).toBe("X");
    expect(state.nextStarter).toBe(sequence);
    expect(gameReducer(state, { type: "move", index: 0, player: "X" })).toBe(state);
    expect(createInitialGameState().nextStarter).toEqual({ computer: "X", friend: "X" });
  });
});
