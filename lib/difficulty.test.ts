import { describe, expect, it } from "vitest";
import { chooseComputerMove } from "./computerAI";
import { analyzeBoard, createEmptyBoard } from "./gameLogic";
import type { Board, Difficulty, Player } from "@/types/game";

describe("Medium difficulty", () => {
  it("takes an immediate win before blocking an immediate human threat", () => {
    const board: Board = ["O", "O", null, "X", "X", null, null, null, null];
    expect(chooseComputerMove(board, "medium")).toBe(2);
  });

  it("blocks an immediate human win when it cannot win", () => {
    const board: Board = ["X", "X", null, null, "O", null, null, null, null];
    expect(chooseComputerMove(board, "medium")).toBe(2);
  });

  it("falls back to random empty cells when no win or block exists", () => {
    const board: Board = [null, null, null, null, "X", null, null, null, null];
    expect(chooseComputerMove(board, "medium", () => 0)).toBe(0);
    expect(chooseComputerMove(board, "medium", () => 0.999)).toBe(8);
  });
});

describe("Hard difficulty", () => {
  it("wins immediately and defends against a fork", () => {
    expect(chooseComputerMove(["O", "O", null, "X", "X", null, null, null, null], "hard")).toBe(2);
    const fork: Board = ["X", null, null, null, "O", null, null, null, "X"];
    expect([1, 3, 5, 7]).toContain(chooseComputerMove(fork, "hard"));
    expect(fork).toEqual(["X", null, null, null, "O", null, null, null, "X"]);
  });

  it.each<Player>(["X", "O"])("cannot lose against any legal human continuation when %s starts", (starter) => {
    let completedGames = 0;
    function explore(board: Board, turn: Player) {
      const result = analyzeBoard(board);
      if (result.winner || result.isDraw) {
        expect(result.winner).not.toBe("X");
        completedGames++;
        return;
      }

      // Explore EVERY legal human choice, then the actual Hard AI response.
      const choices = turn === "X"
        ? board.flatMap((cell, index) => cell === null ? [index] : [])
        : [chooseComputerMove(board, "hard")!];
      for (const index of choices) {
        expect(Number.isInteger(index)).toBe(true);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(9);
        expect(board[index]).toBeNull();
        const next: [...Board] = [...board];
        next[index] = turn;
        explore(next, turn === "X" ? "O" : "X");
      }
    }
    explore(createEmptyBoard(), starter);
    expect(completedGames).toBeGreaterThan(0);
  });
});

describe.each<Difficulty>(["easy", "medium", "hard"])("%s boundaries", (difficulty) => {
  it("can open an empty board and returns no move after a result", () => {
    const index = chooseComputerMove(createEmptyBoard(), difficulty);
    expect(index).not.toBeNull();
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(9);
    expect(chooseComputerMove(["X", "X", "X", "O", "O", null, null, null, null], difficulty)).toBeNull();
    expect(chooseComputerMove(["X", "O", "X", "X", "O", "O", "O", "X", "X"], difficulty)).toBeNull();
  });
});
