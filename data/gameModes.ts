import type { GameMode } from "@/types/game";

export const gameModes: {
  id: GameMode;
  name: string;
  label: string;
  description: string;
}[] = [
  {
    id: "computer",
    name: "Play vs Computer",
    label: "Solo challenge",
    description: "Take on a computer opponent. Take turns going first.",
  },
  {
    id: "friend",
    name: "Play vs Friend",
    label: "Same device",
    description: "Sit side by side and take turns on the same device.",
  },
  {
    id: "practice",
    name: "Practice Mode",
    label: "Play With Yourself",
    description: "Explore the board at your own pace, playing both sides.",
  },
];
