import { useReducer } from "react";
import { analyzeBoard, createEmptyBoard, isValidMove } from "@/lib/gameLogic";
import type { Board, GameMode, Player, RoundState, SymbolPresetId } from "@/types/game";

type GameAction =
  | { type: "start"; mode: GameMode; presetId: SymbolPresetId }
  | { type: "move"; index: number; player: Player }
  | { type: "leave" };

// Export the pure reducer so transitions can be tested without a browser.
export function gameReducer(state: RoundState | null, action: GameAction): RoundState | null {
  switch (action.type) {
    case "start":
      return {
        board: createEmptyBoard(),
        turn: "X",
        mode: action.mode,
        presetId: action.presetId,
      };
    case "leave":
      return null;
    case "move": {
      if (
        !state || state.mode !== "friend" || action.player !== state.turn ||
        !isValidMove(state.board, action.index)
      ) return state;

      // Copy first: reducers must never modify a previous state object.
      const board: [...Board] = [...state.board];
      board[action.index] = state.turn;
      const result = analyzeBoard(board);

      return {
        ...state,
        board,
        turn: result.winner || result.isDraw
          ? state.turn
          : state.turn === "X" ? "O" : "X",
      };
    }
  }
}

export default function useTicTacToe() {
  const [round, dispatch] = useReducer(gameReducer, null);
  // Results come from the board; storing them separately could let them drift.
  const result = round ? analyzeBoard(round.board) : null;

  function startGame(mode: GameMode, presetId: SymbolPresetId) {
    dispatch({ type: "start", mode, presetId });
  }

  function playMove(index: number) {
    if (round) dispatch({ type: "move", index, player: round.turn });
  }

  function leaveGame() {
    dispatch({ type: "leave" });
  }

  return { round, result, startGame, playMove, leaveGame };
}
