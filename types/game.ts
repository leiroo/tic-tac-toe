export type Screen = "home" | "modes" | "setup" | "game";

export type GameMode = "computer" | "friend" | "practice";
export type Difficulty = "easy" | "medium" | "hard";

export type SymbolPresetId = "classic" | "love-stars" | "sun-moon" | "shapes";

export type SymbolPreset = {
  id: SymbolPresetId;
  name: string;
  symbols: { X: string; O: string };
};

export type Player = "X" | "O";
export type CellValue = Player | null;

// A readonly tuple guarantees nine cells and discourages accidental mutation.
export type Board = readonly [
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
  CellValue, CellValue, CellValue,
];

export type BoardResult = {
  winner: Player | null;
  winningCells: number[];
  isDraw: boolean;
};

export type RoundState = {
  board: Board;
  history: readonly Board[];
  turn: Player;
  mode: GameMode;
  presetId: SymbolPresetId;
  difficulty: Difficulty;
  scoreCredit: ScoreKey | null;
};

export type ScoreKey = Player | "draws";
export type ModeScores = Record<ScoreKey, number>;
export type GameState = {
  roundId: number;
  nextStarter: Record<"computer" | "friend", Player>;
  difficulty: Difficulty;
  round: RoundState | null;
  scores: Record<GameMode, ModeScores>;
};
