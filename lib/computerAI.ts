import { analyzeBoard } from "@/lib/gameLogic";
import type { Board, Difficulty, Player } from "@/types/game";

function place(board: Board, index: number, player: Player): Board {
  const next: [...Board] = [...board];
  next[index] = player;
  return next;
}

// O maximizes the outcome; X minimizes it. Cache repeated positions within a search.
function minimax(board: Board, turn: Player, cache: Map<string, number>): number {
  const result = analyzeBoard(board);
  const emptyCells = board.flatMap((cell, index) => cell === null ? [index] : []);
  // Prefer earlier wins and, when a loss is unavoidable, later losses.
  if (result.winner) return (result.winner === "O" ? 1 : -1) * (emptyCells.length + 1);
  if (result.isDraw) return 0;

  const key = turn + board.map((cell) => cell ?? "-").join("");
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const outcomes = emptyCells.map((index) => minimax(
    place(board, index, turn), turn === "O" ? "X" : "O", cache,
  ));
  const score = turn === "O" ? Math.max(...outcomes) : Math.min(...outcomes);
  cache.set(key, score);
  return score;
}

export function chooseComputerMove(
  board: Board,
  difficulty: Difficulty = "easy",
  random: () => number = Math.random,
): number | null {
  const result = analyzeBoard(board);
  if (result.winner || result.isDraw) return null;

  const emptyCells = board.flatMap((cell, index) => cell === null ? [index] : []);

  if (difficulty === "medium") {
    // A computer win takes priority over blocking the human.
    for (const player of ["O", "X"] as const) {
      const index = emptyCells.find((cell) => analyzeBoard(place(board, cell, player)).winner === player);
      if (index !== undefined) return index;
    }
  }

  if (difficulty === "hard") {
    const cache = new Map<string, number>();
    let bestMove = emptyCells[0];
    let bestScore = -Infinity;
    for (const index of emptyCells) {
      const score = minimax(place(board, index, "O"), "X", cache);
      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }
    return bestMove;
  }

  // Each available cell owns an equal-sized interval of the random range [0, 1).
  return emptyCells[Math.floor(random() * emptyCells.length)];
}
