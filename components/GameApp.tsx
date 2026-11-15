"use client";

import { useEffect, useRef, useState } from "react";
import HomeScreen from "@/components/screens/HomeScreen";
import ModeSelectionScreen from "@/components/screens/ModeSelectionScreen";
import GameSetupScreen from "@/components/screens/GameSetupScreen";
import GameScreen from "@/components/screens/GameScreen";
import { gameModes } from "@/data/gameModes";
import { symbolPresets } from "@/data/symbolPresets";
import useTicTacToe from "@/hooks/useTicTacToe";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { GameMode, Screen, SymbolPresetId } from "@/types/game";

export default function GameApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [selectedMode, setSelectedMode] = useState<GameMode>("computer");
  const [selectedPresetId, setSelectedPresetId] = useState<SymbolPresetId>("classic");
  const mainRef = useRef<HTMLElement>(null);
  const game = useTicTacToe();
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Derive display data from the selected IDs instead of duplicating state.
  const mode = gameModes.find((item) => item.id === selectedMode)!;
  const preset = symbolPresets.find((item) => item.id === selectedPresetId)!;

  useEffect(() => {
    // State-based navigation needs an explicit focus destination for keyboards
    // and screen readers, just as a new page would have.
    mainRef.current?.querySelector("h1")?.focus();
  }, [currentScreen]);

  function chooseMode(nextMode: GameMode) {
    setSelectedMode(nextMode);
    setCurrentScreen("setup");
  }

  function startGame() {
    game.startGame(selectedMode, selectedPresetId);
    setCurrentScreen("game");
  }

  function leaveGame(screen: "setup" | "modes") {
    game.leaveGame();
    setCurrentScreen(screen);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <p className="flex items-center gap-3 text-sm font-bold tracking-[0.16em]">
          <span aria-hidden="true" className="text-xl tracking-normal">
            <span className="text-cyan">X</span><span className="text-magenta">O</span>
          </span>
          DARK ARCADE
        </p>
        <span className="text-xs text-muted">Tic-Tac-Toe</span>
      </header>

      <main ref={mainRef} className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-8 sm:px-8 sm:py-12">
        {currentScreen === "home" && (
          <HomeScreen onStart={() => setCurrentScreen("modes")} />
        )}
        {currentScreen === "modes" && (
          <ModeSelectionScreen
            selectedMode={selectedMode}
            onSelect={chooseMode}
            onBack={() => setCurrentScreen("home")}
          />
        )}
        {currentScreen === "setup" && (
          <GameSetupScreen
            modeName={mode.name}
            mode={selectedMode}
            difficulty={game.difficulty}
            onDifficultyChange={game.setDifficulty}
            preset={preset}
            onPresetChange={setSelectedPresetId}
            onBack={() => setCurrentScreen("modes")}
            onStart={startGame}
          />
        )}
        {currentScreen === "game" && game.round && game.result && (
          <GameScreen
            modeName={mode.name}
            preset={preset}
            round={game.round}
            result={game.result}
            scores={game.scores[game.round.mode]}
            onNewRound={game.newRound}
            onResetScores={() => setShowResetDialog(true)}
            onMove={game.playMove}
            onBack={() => leaveGame("setup")}
            onChangeMode={() => leaveGame("modes")}
          />
        )}
      </main>

      {showResetDialog && (
        <ConfirmDialog
          modeName={mode.name}
          onCancel={() => setShowResetDialog(false)}
          onConfirm={() => { game.resetScores(); setShowResetDialog(false); }}
        />
      )}

      <footer className="mx-auto w-full max-w-5xl px-5 py-6 text-xs text-muted sm:px-8">
        <div className="border-t border-muted/15 pt-5">Three ways to play. One classic board.</div>
      </footer>
    </div>
  );
}
