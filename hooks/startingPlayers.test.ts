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

  it("resets the selected mode to X on entry with zero match scores", () => {
    let state = start(createInitialGameState(), "computer");
    state = { ...state, scores: { computer: { X: 2, O: 1, draws: 3 }, friend: { X: 4, O: 5, draws: 6 }, practice: { X: 7, O: 8, draws: 9 } } };
    state = gameReducer(state, { type: "leave" });
    for (const mode of ["friend", "computer", "friend"] as const) {
      state = gameReducer(state, { type: "enterMode", mode });
      expect(state.round).toBeNull();
      expect(state.scores).toEqual(createInitialGameState().scores);
      state = start(state, mode);
      expect(state.round!.turn).toBe("X");
      state = gameReducer(state, { type: "newRound" });
      expect(state.round!.turn).toBe("O");
    }
  });

  it("Reset Match restarts with X and New Round then starts O", () => {
    const state = gameReducer(start(createInitialGameState(), "friend"), { type: "newRound" });
    const reset = gameReducer(state, { type: "resetMatch" });
    expect(reset.round!.turn).toBe("X");
    expect(reset.nextStarter.friend).toBe("O");
    expect(gameReducer(reset, { type: "newRound" }).round!.turn).toBe("O");
  });

  it("allows O to start and win a Friend round without changing player symbols", () => {
    let state = gameReducer(start(createInitialGameState(), "friend"), { type: "newRound" });
    for (const index of [0, 3, 1, 4, 2]) {
      state = gameReducer(state, { type: "move", index, player: state.round!.turn });
    }
    expect(state.round!.board.slice(0, 3)).toEqual(["O", "O", "O"]);
    expect(state.scores.friend).toEqual({ X: 0, O: 1, draws: 0 });
  });

  it("mode re-entry cancels pending moves and rejects old actions even on a later O turn", () => {
    vi.useFakeTimers();
    let state = gameReducer(start(createInitialGameState(), "computer"), { type: "newRound" });
    const stale: GameAction = { type: "computerMove", index: 0, roundId: state.roundId, board: state.round!.board };
    const dispatch = vi.fn();
    const cleanup = scheduleComputerTurn(state.round, state.roundId, dispatch);
    state = gameReducer(state, { type: "enterMode", mode: "computer" });
    cleanup();
    expect(state.round).toBeNull();
    state = start(state, "computer");
    scheduleComputerTurn(state.round, state.roundId, dispatch);
    vi.runAllTimers();
    expect(dispatch).not.toHaveBeenCalled();
    expect(state.round!.turn).toBe("X");
    state = gameReducer(state, { type: "move", index: 4, player: "X" });
    expect(gameReducer(state, stale)).toBe(state);
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

  it("Practice starts X without affecting competitive sequences, which reset in a fresh session", () => {
    let state = start(createInitialGameState(), "computer");
    const sequence = state.nextStarter;
    state = start(state, "practice");
    state = gameReducer(state, { type: "newRound" });
    expect(state.round!.turn).toBe("X");
    expect(state.nextStarter).toBe(sequence);
    expect(createInitialGameState().nextStarter).toEqual({ computer: "X", friend: "X" });
  });
});
