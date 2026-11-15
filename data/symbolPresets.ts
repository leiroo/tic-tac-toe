import type { SymbolPreset } from "@/types/game";

// These symbols are display choices, never values for the future game board.
export const symbolPresets: SymbolPreset[] = [
  { id: "classic", name: "Classic", symbols: { X: "X", O: "O" } },
  { id: "love-stars", name: "Love & Stars", symbols: { X: "♥", O: "★" } },
  { id: "sun-moon", name: "Sun & Moon", symbols: { X: "☀", O: "☾" } },
  { id: "shapes", name: "Shapes", symbols: { X: "◆", O: "●" } },
];
