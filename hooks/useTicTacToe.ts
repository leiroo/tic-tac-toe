import { useReducer } from "react";
import { analyzeBoard, createEmptyBoard, isValidMove } from "@/lib/gameLogic";
import type { Board, GameMode, GameState, Player, RoundState, SymbolPresetId } from "@/types/game";

export type GameAction =
  | { type: "start"; mode: GameMode; presetId: SymbolPresetId }
  | { type: "move"; index: number; player: Player }
  | { type: "leave" }
  | { type: "newRound" }
  | { type: "resetScores" };

export function createInitialGameState(): GameState {
  return {
    round: null,
    scores: {
      computer: { X: 0, O: 0, draws: 0 },
      friend: { X: 0, O: 0, draws: 0 },
      practice: { X: 0, O: 0, draws: 0 },
    },
  };
}

function createRound(mode: GameMode, presetId: SymbolPresetId): RoundState {
  return { board: createEmptyBoard(), turn: "X", mode, presetId, scoreCredit: null };
}

// Export the pure reducer so transitions can be tested without a browser.
export function gameReducer(state: GameState, action: GameAction): GameState {
  const round = state.round;
  switch (action.type) {
    case "start":
      return { ...state, round: createRound(action.mode, action.presetId) };
    case "leave":
      return { ...state, round: null };
    case "newRound":
      return round ? { ...state, round: createRound(round.mode, round.presetId) } : state;
    case "resetScores":
      if (!round) return state;
      return {
        ...state,
        scores: { ...state.scores, [round.mode]: { X: 0, O: 0, draws: 0 } },
        // The board stays completed; its cleared credit cannot be counted again.
        round: { ...round, scoreCredit: null },
      };
    case "move": {
      if (
        !round || round.mode !== "friend" || action.player !== round.turn ||
        !isValidMove(round.board, action.index)
      ) return state;

      // Copy first: reducers must never modify a previous state object.
      const board: [...Board] = [...round.board];
      board[action.index] = round.turn;
      const result = analyzeBoard(board);
      const credit = result.winner ?? (result.isDraw ? "draws" : null);
      // Only a valid active-to-completed move credits a result, never a render.
      const scores = credit && round.scoreCredit === null
        ? {
            ...state.scores,
            [round.mode]: {
              ...state.scores[round.mode],
              [credit]: state.scores[round.mode][credit] + 1,
            },
          }
        : state.scores;

      return {
        ...state,
        scores,
        round: {
          ...round,
          board,
          scoreCredit: credit,
          turn: credit ? round.turn : round.turn === "X" ? "O" : "X",
        },
      };
    }
  }
}

export default function useTicTacToe() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const { round, scores } = state;
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

  function newRound() {
    dispatch({ type: "newRound" });
  }

  function resetScores() {
    dispatch({ type: "resetScores" });
  }

  return { round, scores, result, startGame, playMove, leaveGame, newRound, resetScores };
}
