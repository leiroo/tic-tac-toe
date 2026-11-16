import { describe, expect, it, vi } from "vitest";
import { chooseComputerMove } from "./computerAI";
import { createEmptyBoard } from "./gameLogic";
import type { Board } from "@/types/game";

describe("Easy computer selection", () => {
  it("gives every empty cell an equal interval and never selects an occupied cell", () => {
    const board: Board = ["X", null, "O", null, null, "X", null, null, null];
    const available = [1, 3, 4, 6, 7, 8];
    const counts = new Map<number | null, number>();
    for (let sample = 0; sample < 600; sample++) {
      const move = chooseComputerMove(board, "easy", () => (sample + 0.5) / 600);
      counts.set(move, (counts.get(move) ?? 0) + 1);
    }
    expect([...counts.entries()]).toEqual(available.map((index) => [index, 100]));
    expect(board).toEqual(["X", null, "O", null, null, "X", null, null, null]);
  });

  it("handles both ends of the random range on an empty board", () => {
    expect(chooseComputerMove(createEmptyBoard(), "easy", () => 0)).toBe(0);
    expect(chooseComputerMove(createEmptyBoard(), "easy", () => 1 - Number.EPSILON)).toBe(8);
  });

  it("selects the only remaining empty cell", () => {
    const board: Board = ["X", "O", "X", "X", "O", "O", "O", "X", null];
    expect(chooseComputerMove(board, "easy", () => 0.99)).toBe(8);
  });

  it.each<{ board: Board }>([
    { board: ["X", "X", "X", "O", "O", null, null, null, null] },
    { board: ["X", "X", null, "O", "O", "O", null, null, "X"] },
    { board: ["X", "O", "X", "X", "O", "O", "O", "X", "X"] },
  ])("returns no move on a completed board %#", ({ board }) => {
    const random = vi.fn(() => 0);
    expect(chooseComputerMove(board, "easy", random)).toBeNull();
    expect(random).not.toHaveBeenCalled();
  });
});
