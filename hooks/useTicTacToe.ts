import { useEffect, useReducer } from "react";
import { chooseComputerMove } from "@/lib/computerAI";
import { analyzeBoard, createEmptyBoard, isValidMove } from "@/lib/gameLogic";
import type { Board, Difficulty, GameMode, GameState, Player, RoundState, SymbolPresetId } from "@/types/game";

export type GameAction =
  | { type: "start"; mode: GameMode; presetId: SymbolPresetId }
  | { type: "enterMode"; mode: GameMode }
  | { type: "setDifficulty"; difficulty: Difficulty }
  | { type: "selectSymbol"; player: Player }
  | { type: "undo" }
  | { type: "move"; index: number; player: Player }
  | { type: "computerMove"; index: number; roundId: number; board: Board }
  | { type: "leave" }
  | { type: "newRound" }
  | { type: "resetMatch" };

export function createInitialGameState(): GameState {
  return {
    roundId: 0,
    nextStarter: { computer: "X", friend: "X" },
    difficulty: "easy",
    round: null,
    scores: {
      computer: { X: 0, O: 0, draws: 0 },
      friend: { X: 0, O: 0, draws: 0 },
      practice: { X: 0, O: 0, draws: 0 },
    },
  };
}

function startRound(state: GameState, mode: GameMode, presetId: SymbolPresetId, difficulty = state.difficulty): GameState {
  const starter = mode === "practice" ? "X" : state.nextStarter[mode];
  return {
    ...state,
    roundId: state.roundId + 1,
    // Consume the starter only when a fresh board is actually created.
    nextStarter: mode === "practice" ? state.nextStarter : {
      ...state.nextStarter,
      [mode]: starter === "X" ? "O" : "X",
    },
    round: { board: createEmptyBoard(), history: [], turn: starter, mode, presetId, difficulty, scoreCredit: null },
  };
}

// Export the pure reducer so transitions can be tested without a browser.
export function gameReducer(state: GameState, action: GameAction): GameState {
  const round = state.round;
  switch (action.type) {
    case "selectSymbol": {
      if (!round || round.mode !== "practice") return state;
      const result = analyzeBoard(round.board);
      if (result.winner || result.isDraw || round.turn === action.player) return state;
      return { ...state, round: { ...round, turn: action.player } };
    }
    case "undo": {
      if (!round || round.mode !== "practice" || round.history.length === 0) return state;
      const credit = round.scoreCredit;
      // Only the completed round owns a credit. Clearing it prevents double reversal.
      const scores = credit === null ? state.scores : {
        ...state.scores,
        practice: { ...state.scores.practice, [credit]: Math.max(0, state.scores.practice[credit] - 1) },
      };
      return {
        ...state,
        scores,
        round: {
          ...round,
          board: round.history[round.history.length - 1],
          history: round.history.slice(0, -1),
          scoreCredit: null,
          // Keep the current placement symbol, rather than restoring an old turn.
        },
      };
    }
    case "enterMode":
      return {
        ...state,
        round: null,
        roundId: state.roundId + 1,
        nextStarter: action.mode === "practice" ? state.nextStarter : { ...state.nextStarter, [action.mode]: "X" },
      };
    case "setDifficulty":
      // Setup changes apply to the next round, never to a running game or timer.
      return round ? state : { ...state, difficulty: action.difficulty };
    case "start":
      return startRound(state, action.mode, action.presetId);
    case "leave":
      return { ...state, round: null };
    case "newRound":
      return round ? startRound(state, round.mode, round.presetId, round.difficulty) : state;
    case "resetMatch": {
      if (!round) return state;
      const cleared = {
        ...state,
        scores: { ...state.scores, [round.mode]: { X: 0, O: 0, draws: 0 } },
      };
      return startRound(
        { ...cleared, nextStarter: round.mode === "practice" ? state.nextStarter : { ...state.nextStarter, [round.mode]: "X" } },
        round.mode, round.presetId, round.difficulty,
      );
    }
    case "move":
    case "computerMove": {
      if (
        !round ||
        !isValidMove(round.board, action.index)
      ) return state;

      if (action.type === "computerMove") {
        if (round.mode !== "computer" || round.turn !== "O" ||
          action.roundId !== state.roundId || action.board !== round.board) return state;
      } else if (action.player !== round.turn ||
        (round.mode === "computer" && action.player !== "X")) return state;

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
          history: round.mode === "practice" ? [...round.history, round.board] : round.history,
          scoreCredit: credit,
          turn: credit || round.mode === "practice" ? round.turn : round.turn === "X" ? "O" : "X",
        },
      };
    }
  }
}

// The effect owns the timer; the reducer only validates and applies its action.
export function scheduleComputerTurn(
  round: RoundState | null,
  roundId: number,
  dispatch: (action: GameAction) => void,
  random: () => number = Math.random,
): () => void {
  if (!round || round.mode !== "computer" || round.turn !== "O") return () => {};
  const result = analyzeBoard(round.board);
  if (result.winner || result.isDraw) return () => {};

  const timer = setTimeout(() => {
    const index = chooseComputerMove(round.board, round.difficulty, random);
    if (index !== null) dispatch({ type: "computerMove", index, roundId, board: round.board });
  }, 400);
  // React calls this before replacing the effect and when the hook unmounts.
  return () => clearTimeout(timer);
}

export default function useTicTacToe() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState);
  const { round, scores } = state;
  // Results come from the board; storing them separately could let them drift.
  const result = round ? analyzeBoard(round.board) : null;

  useEffect(() => scheduleComputerTurn(round, state.roundId, dispatch), [round, state.roundId]);

  function startGame(mode: GameMode, presetId: SymbolPresetId) {
    dispatch({ type: "start", mode, presetId });
  }

  function enterMode(mode: GameMode) {
    dispatch({ type: "enterMode", mode });
  }

  function setDifficulty(difficulty: Difficulty) {
    dispatch({ type: "setDifficulty", difficulty });
  }

  function playMove(index: number) {
    if (round) dispatch({ type: "move", index, player: round.mode === "computer" ? "X" : round.turn });
  }

  function leaveGame() {
    dispatch({ type: "leave" });
  }

  function newRound() {
    dispatch({ type: "newRound" });
  }

  function resetMatch() {
    dispatch({ type: "resetMatch" });
  }

  function selectSymbol(player: Player) {
    dispatch({ type: "selectSymbol", player });
  }

  function undo() {
    dispatch({ type: "undo" });
  }

  return { round, scores, result, difficulty: state.difficulty, setDifficulty, enterMode, startGame, playMove, leaveGame, newRound, resetMatch, selectSymbol, undo };
}
