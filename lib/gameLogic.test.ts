import { describe, expect, it } from "vitest";
import { analyzeBoard, createEmptyBoard, findWinner, isValidMove } from "./gameLogic";
import type { Board, Player } from "@/types/game";

const winCases = [
  { name: "top row", cells: [0, 1, 2] },
  { name: "middle row", cells: [3, 4, 5] },
  { name: "bottom row", cells: [6, 7, 8] },
  { name: "left column", cells: [0, 3, 6] },
  { name: "middle column", cells: [1, 4, 7] },
  { name: "right column", cells: [2, 5, 8] },
  { name: "descending diagonal", cells: [0, 4, 8] },
  { name: "ascending diagonal", cells: [2, 4, 6] },
];

describe.each<Player>(["X", "O"])("win detection for %s", (player) => {
  it.each(winCases)("detects the $name", ({ cells }) => {
    const board: [...Board] = [...createEmptyBoard()];
    cells.forEach((index) => { board[index] = player; });
    expect(analyzeBoard(board)).toEqual({ winner: player, winningCells: cells, isDraw: false });
  });
});

describe("board analysis", () => {
  it("creates independent empty boards without a winner or draw", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(9);
    expect(board.every((cell) => cell === null)).toBe(true);
    expect(createEmptyBoard()).not.toBe(board);
    expect(analyzeBoard(board)).toEqual({ winner: null, winningCells: [], isDraw: false });
  });

  it("does not treat mixed symbols or two-in-a-row as a win", () => {
    const board: Board = ["X", "X", "O", null, "O", null, null, null, null];
    expect(findWinner(board)).toEqual({ winner: null, winningCells: [] });
    expect(analyzeBoard(board).isDraw).toBe(false);
  });

  it("recognizes a full board without a winner as a draw", () => {
    const board: Board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
    expect(analyzeBoard(board)).toEqual({ winner: null, winningCells: [], isDraw: true });
  });

  it("gives a ninth-cell win priority over a draw", () => {
    const board: Board = ["X", "O", "X", "O", "X", "O", "O", "X", "X"];
    expect(analyzeBoard(board)).toEqual({ winner: "X", winningCells: [0, 4, 8], isDraw: false });
  });

  it("returns unique winning cells when the final move completes two lines", () => {
    const board: Board = Object.freeze(["X", "O", "X", "O", "X", "O", "X", "O", "X"]);
    const result = analyzeBoard(board);
    expect(result.winner).toBe("X");
    expect(result.isDraw).toBe(false);
    expect(result.winningCells.toSorted()).toEqual([0, 2, 4, 6, 8]);
  });
});

describe("move validation", () => {
  it("accepts all nine cells on a fresh board", () => {
    for (let index = 0; index < 9; index++) expect(isValidMove(createEmptyBoard(), index)).toBe(true);
  });

  it.each([-1, 9, 1.5, NaN, Infinity])("rejects index %s", (index) => {
    expect(isValidMove(createEmptyBoard(), index)).toBe(false);
  });

  it("rejects occupied cells but accepts an empty cell during play", () => {
    const board: Board = ["X", "O", null, null, null, null, null, null, null];
    expect(isValidMove(board, 0)).toBe(false);
    expect(isValidMove(board, 1)).toBe(false);
    expect(isValidMove(board, 2)).toBe(true);
  });

  it("rejects an empty cell after a win", () => {
    const board: Board = ["X", "X", "X", "O", "O", null, null, null, null];
    expect(isValidMove(board, 5)).toBe(false);
  });
});
