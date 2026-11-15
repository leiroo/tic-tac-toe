import { analyzeBoard } from "@/lib/gameLogic";
import type { Board } from "@/types/game";

export function chooseComputerMove(board: Board, random: () => number = Math.random): number | null {
  const result = analyzeBoard(board);
  if (result.winner || result.isDraw) return null;

  const emptyCells = board.flatMap((cell, index) => cell === null ? [index] : []);
  // Each available cell owns an equal-sized interval of the random range [0, 1).
  return emptyCells[Math.floor(random() * emptyCells.length)];
}
