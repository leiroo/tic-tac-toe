import type { Board, BoardResult } from "@/types/game";

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
] as const;

export function createEmptyBoard(): Board {
  return [null, null, null, null, null, null, null, null, null];
}

export function findWinner(board: Board): Pick<BoardResult, "winner" | "winningCells"> {
  const lines = WINNING_LINES.filter(([a, b, c]) => (
    board[a] !== null && board[a] === board[b] && board[a] === board[c]
  ));

  if (lines.length === 0) return { winner: null, winningCells: [] };

  // A final move can complete two lines. Include each winning cell only once.
  return {
    winner: board[lines[0][0]],
    winningCells: [...new Set(lines.flat())],
  };
}

export function analyzeBoard(board: Board): BoardResult {
  const win = findWinner(board);
  return {
    ...win,
    // Check the winner first: a full board can still be a ninth-move win.
    isDraw: win.winner === null && board.every((cell) => cell !== null),
  };
}

export function isValidMove(board: Board, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= board.length) return false;
  if (board[index] !== null) return false;

  const result = analyzeBoard(board);
  return result.winner === null && !result.isDraw;
}
