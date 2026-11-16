import { describe, expect, it } from "vitest";
import { createInitialGameState, gameReducer } from "./useTicTacToe";
import { analyzeBoard } from "@/lib/gameLogic";
import type { GameMode, GameState } from "@/types/game";

function start(state = createInitialGameState(), mode: GameMode = "friend") {
  return gameReducer(state, { type: "start", mode, presetId: "love-stars" });
}

function play(moves: number[], state = start()): GameState {
  return moves.reduce((previous, index) => gameReducer(previous, {
    type: "move", index, player: previous.round!.turn,
  }), state);
}

const xWin = [0, 3, 1, 4, 2];
const oWin = [0, 3, 1, 4, 8, 5];
const draw = [0, 1, 2, 4, 3, 5, 7, 6, 8];

describe("session scores", () => {
  it.each([
    { name: "X win", moves: xWin, expected: { X: 1, O: 0, draws: 0 }, credit: "X" },
    { name: "O win", moves: oWin, expected: { X: 0, O: 1, draws: 0 }, credit: "O" },
    { name: "draw", moves: draw, expected: { X: 0, O: 0, draws: 1 }, credit: "draws" },
    { name: "ninth-move win", moves: [0, 1, 2, 3, 4, 5, 7, 6, 8], expected: { X: 1, O: 0, draws: 0 }, credit: "X" },
    { name: "two winning lines", moves: [0, 1, 2, 3, 6, 5, 8, 7, 4], expected: { X: 1, O: 0, draws: 0 }, credit: "X" },
  ])("credits $name exactly once", ({ moves, expected, credit }) => {
    let state = play(moves);
    expect(state.scores.friend).toEqual(expected);
    expect(state.round!.scoreCredit).toBe(credit);
    const completed = state;
    for (let index = 0; index < 9; index++) {
      analyzeBoard(state.round!.board); // Recomputing results cannot credit them.
      state = gameReducer(state, { type: "move", index, player: state.round!.turn });
    }
    expect(state).toBe(completed);
    expect(state.scores.computer).toEqual({ X: 0, O: 0, draws: 0 });
    expect(state.scores.practice).toEqual({ X: 0, O: 0, draws: 0 });
  });

  it("does not score unfinished rounds or invalid actions", () => {
    const state = play([0, 3, 1]);
    expect(state.scores).toEqual(createInitialGameState().scores);
    expect(gameReducer(state, { type: "move", index: 0, player: "O" })).toBe(state);
    expect(gameReducer(state, { type: "move", index: 2, player: "X" })).toBe(state);
  });

  it("is pure when React evaluates the same winning action twice", () => {
    const before = play([0, 3, 1, 4]);
    Object.freeze(before.scores.friend);
    Object.freeze(before.scores);
    Object.freeze(before.round!.board);
    Object.freeze(before.round);
    Object.freeze(before);
    const action = { type: "move", index: 2, player: "X" } as const;
    expect(gameReducer(before, action)).toEqual(gameReducer(before, action));
    expect(before.scores.friend.X).toBe(0);
    expect(gameReducer(before, action).scores.friend.X).toBe(1);
  });

  it("New Round clears board and result, alternates starter, and preserves config and scores", () => {
    const won = play(xWin);
    const next = gameReducer(won, { type: "newRound" });
    expect(next.scores).toBe(won.scores);
    expect(next.round).toMatchObject({ mode: "friend", presetId: "love-stars", turn: "O", scoreCredit: null });
    expect(next.round!.board.every((cell) => cell === null)).toBe(true);
    expect(analyzeBoard(next.round!.board)).toEqual({ winner: null, winningCells: [], isDraw: false });
    const second = play(xWin, next); // The first mover is now O.
    const third = play(draw, gameReducer(second, { type: "newRound" }));
    expect(third.scores.friend).toEqual({ X: 1, O: 1, draws: 1 });
  });

  it("discards an unfinished New Round without awarding points", () => {
    const partial = play([0, 4]);
    const next = gameReducer(partial, { type: "newRound" });
    expect(next.scores).toBe(partial.scores);
    expect(next.round!.board.every((cell) => cell === null)).toBe(true);
  });

  it("preserves scores through leaving and switching modes", () => {
    const won = play(xWin);
    let state = gameReducer(won, { type: "leave" });
    expect(state.round).toBeNull();
    for (const mode of ["computer", "practice", "friend"] as const) {
      state = start(state, mode);
      expect(state.scores).toBe(won.scores);
      expect(state.round!.board.every((cell) => cell === null)).toBe(true);
    }
  });

  it.each<GameMode>(["computer", "friend", "practice"])("resets only active %s scores", (mode) => {
    const state = start({
      ...createInitialGameState(),
      roundId: 0,
      round: null,
      scores: {
        computer: { X: 2, O: 1, draws: 3 },
        friend: { X: 4, O: 5, draws: 6 },
        practice: { X: 7, O: 8, draws: 9 },
      },
    }, mode);
    const reset = gameReducer(state, { type: "resetMatch" });
    expect(reset.scores[mode]).toEqual({ X: 0, O: 0, draws: 0 });
    for (const other of ["computer", "friend", "practice"] as const) {
      if (other !== mode) expect(reset.scores[other]).toBe(state.scores[other]);
    }
    expect(reset.round!.board.every((cell) => cell === null)).toBe(true);
    expect(reset.round!.turn).toBe("X");
    expect(reset.round!.history).toEqual([]);
  });

  it("replaces a completed round with an empty X-start round and zero scores", () => {
    const won = play(xWin);
    const reset = gameReducer(won, { type: "resetMatch" });
    expect(reset.round!.scoreCredit).toBeNull();
    expect(reset.round!.board.every((cell) => cell === null)).toBe(true);
    expect(analyzeBoard(reset.round!.board)).toEqual({ winner: null, winningCells: [], isDraw: false });
    expect(reset.round!.turn).toBe("X");
    expect(reset.roundId).not.toBe(won.roundId);
    expect(reset.scores.friend).toEqual({ X: 0, O: 0, draws: 0 });
    expect(play(xWin, reset).scores.friend.X).toBe(1);
  });

  it("discards an unfinished O-start round on Reset Match", () => {
    const partial = play([0, 3, 1, 4], gameReducer(play(xWin), { type: "newRound" }));
    const reset = gameReducer(partial, { type: "resetMatch" });
    expect(reset.round!.board.every((cell) => cell === null)).toBe(true);
    expect(reset.round!.turn).toBe("X");
    expect(reset.scores.friend).toEqual({ X: 0, O: 0, draws: 0 });
    expect(play(xWin, reset).scores.friend.X).toBe(1);
  });

  it("initializes fresh independent zero scores for a new page session", () => {
    const first = createInitialGameState();
    first.scores.friend.X = 9;
    const fresh = createInitialGameState();
    expect(fresh.scores.friend.X).toBe(0);
    expect(fresh.scores.friend).not.toBe(fresh.scores.computer);
    expect(fresh.round).toBeNull();
  });

  it("ignores round controls when no round is active", () => {
    const state = createInitialGameState();
    expect(gameReducer(state, { type: "newRound" })).toBe(state);
    expect(gameReducer(state, { type: "resetMatch" })).toBe(state);
  });
});
