# Dark Arcade Tic-Tac-Toe — Project Plan

**Status:** Stages 1–6 planned; application implementation NOT authorized yet.  
**Purpose:** Demonstrate junior-level React/Next.js skills for a SUpost job application.  
**Deployment target:** Vercel Hobby, personal/non-commercial portfolio project.

## 1. Project overview

Build a responsive, single-page Tic-Tac-Toe web application with a Dark Arcade visual identity. The app must be small, readable, accessible, and reliable. Players can choose a game mode and a predefined pair of board symbols before starting.

### Technical decisions
- Next.js App Router and React, TypeScript, Tailwind CSS.
- One route (`/`) with four client-side screen states: Home, Mode Selection, Game Setup, Game.
- Server-rendered layout/page shell; interactive `GameApp` as Client Component.
- React `useState` for navigation and setup; a `useTicTacToe` custom hook with `useReducer` for related game transitions.
- Shared board, move validation, win/draw detection, and scoreboard logic across all modes.
- A single GitHub repository and Git-managed development; Vercel for final hosting.
- No database, login, online multiplayer, API endpoints, external AI, Redux, or localStorage in v1.
- Scores and current session do not survive a page refresh.

## 2. Version 1 features

### Mode A: Play vs Computer
- Human is internal `X`; computer is internal `O`. Starting player alternates each fresh round, beginning with X (approved M5.5 extension).
- Difficulty defaults to **Easy** (uniformly random empty cell). **Medium** wins immediately if possible, otherwise blocks an immediate human win, otherwise chooses randomly. **Hard** uses optimal Minimax and supports either starting player.
- Computer-only setup difficulty persists during the page session and is captured for each round; it cannot change mid-round.
- Human input is disabled during the computer's turn.
- A short 300–500 ms status delay is permitted; cancel/ignore pending computer actions after restart, mode change, or unmount.
- If human move ends game, do not schedule a computer move.

### Mode B: Play vs Friend
- Two humans play on the **same device**, not online.
- Player 1 is internal X; Player 2 is O. Starting player alternates each fresh round, beginning with X. Alternate turns after each valid nonterminal move.

### Mode C: Play With Yourself / Practice
- One person can manually choose X or O before each move; repeated same-symbol placement is permitted.
- Undo reverses the latest placement, including a game-ending placement.
- Practice starts each fresh round with X selected. Undo changes the board but keeps the current selected placement symbol.
- Practice shows an X/O/Draw scoreboard, not competitive player names.

### Shared features
- 3×3 board with nine cell indices (`0..8`); internal cell values `X`, `O`, `null`.
- Only empty cells accept moves; occupied cells and moves after completion are ignored.
- Detect all 8 standard rows, columns, and diagonals; winner has priority over full-board draw. Multiple winning lines still score once.
- Show turn or status message; announce winning player or draw and highlight winning cells.
- New Round/Play Again clears board and preserves current mode's scores.
- Entering Computer or Friend from Mode Selection resets that mode's next starter to X while preserving all scores. New Round/Play Again alternates starters even after unfinished rounds. Returning directly from Game to Setup and starting again consumes the next starter. Reset Match clears the active board/scores and restarts with X; refresh resets both sequences. Practice always starts with X selected and never automatically alternates symbols.
- Change Mode returns to mode selection, discards unfinished round, preserves mode scores for this page session.
- Reset Match asks confirmation in Computer/Friend, cancels pending computer moves, clears the active board and mode scores, and starts X with O next. Difficulty, preset, and other modes' scores remain unchanged. Practice also uses confirmed Reset Match: clear its board, move history, scores, and score credit, with X selected; other modes remain unchanged.
- Four paired symbol presets: Classic (X/O), Love & Stars (♥/★), Sun & Moon (☀/☾), Shapes (◆/●).
- Presets change **display only**. No icon characters are stored in board state. Selection is finalized at Game Setup for each started round; changing appearance mid-round is not required.
- Maintain independent score counters per mode: first symbol wins, second symbol wins, draws. Labels vary by mode.

### Score semantics and tricky cases
- A result is credited exactly once on the transition from active game to completed game, never simply on render.
- A Practice Undo that reopens a completed round reverses its existing credited result exactly once.
- Practice Reset Match clears its history and score credit along with its board/scores. Undo is then unavailable and cannot subtract any cleared credit or produce negative values.
- Completed results must never be credited again by rerendering. New Round discards history while keeping prior scores; Undo affects only the active round.
- Refresh loses session game/scores; navigating between the app's own screens does not.

## 3. UX and screens

1. **Home:** arcade title, introductory text, Start Playing.
2. **Mode Selection:** three cards (Computer, Friend, Practice) with short descriptions, Back.
3. **Game Setup:** select one of four paired-symbol presets; show selection/preview and Start Game; Back.
4. **Game:** 3×3 board, current-turn indicator, mode-specific scoreboard, New Round, Reset Scores, Change Mode; Practice-only X/O selector and Undo.
5. **Results:** inline within Game screen (not separate screen); winning cells highlighted, result announced, Play Again available.

### User flow
Home → Mode Selection → Game Setup → Game ↔ (New Round / inline Result); Change Mode → Mode Selection. All within one Next.js route.

## 4. Dark Arcade design

- Background `#090D1B`; surface `#171D32`.
- Cyan `#22D3EE` for internal X / primary accent; magenta `#F472B6` for internal O; purple `#A78BFA` for secondary accent.
- Text `#F8FAFC`; muted text `#B8C3D9`; success `#4ADE80`.
- Headings: Space Grotesk; body: Inter.
- Square rounded board cells, subtle neon focus/hover/win effects; avoid distracting perpetual animations.
- Mobile-first: no horizontal scrolling at 320 px width; touch targets at least 44×44 CSS px; board capped around 360 px.
- Mobile: board then scoreboard/actions. Desktop: board and side panel next to each other.
- Use real buttons, descriptive labels, keyboard-accessible cell controls, visible focus, readable status announcements, and reduced-motion support. Do not rely on color alone.

## 5. System architecture

### Top-level component hierarchy
- `GameApp`
  - `HomeScreen`
  - `ModeSelectionScreen`
  - `GameSetupScreen` → `SymbolPicker`
  - `GameScreen`
    - `GameStatus`
    - `GameBoard` → 9 × `GameCell`
    - `ScoreBoard`
    - `GameControls`
    - `ResultBanner`
    - `PracticeControls` (Practice only)
  - `ConfirmDialog` (for resetting scores)

### State ownership
- `GameApp` holds UI navigation (`currentScreen`), pending mode and preset, and score-reset dialog visibility.
- `useTicTacToe` owns active round: board, active mode/preset, turn/phase, move history, score counters by mode, and score-credit bookkeeping.
- Winner, winning cells, and draw are **derived from the board**; do not store duplicate independent result state.
- Random cell selection and optional delay occur in the controller/effect layer, **not inside a pure reducer**.
- Use a round identifier and action validity checks so old delayed computer moves cannot affect a new game.

### Game logic module responsibilities
- `lib/gameLogic.ts`: pure move checks, winner/draw analysis.
- `lib/computerAI.ts`: Easy random choice, Medium win/block/random, and Hard Minimax using the shared game rules.
- `hooks/useTicTacToe.ts`: game reducer and actions/score semantics.
- `data/symbolPresets.ts`: display mapping for X and O.
- `types/game.ts`: documented game/domain types.

### Proposed files
```text
app/layout.tsx
app/page.tsx
app/globals.css
components/GameApp.tsx
components/screens/HomeScreen.tsx
components/screens/ModeSelectionScreen.tsx
components/screens/GameSetupScreen.tsx
components/screens/GameScreen.tsx
components/game/GameBoard.tsx
components/game/GameCell.tsx
components/game/GameStatus.tsx
components/game/ScoreBoard.tsx
components/game/GameControls.tsx
components/game/ResultBanner.tsx
components/game/PracticeControls.tsx
components/ui/SymbolPicker.tsx
components/ui/ConfirmDialog.tsx
hooks/useTicTacToe.ts
lib/gameLogic.ts
lib/computerAI.ts
data/symbolPresets.ts
types/game.ts
PROJECT_PLAN.md
DEVELOPMENT_ROADMAP.md
AGENTS.md
README.md  (to complete during development)
```
Use sensible simplification if a file adds no value; avoid overengineering.

## 6. Critical test scenarios

- All 8 win patterns; ninth-cell win is a win, not a draw; full-board no-winner is draw.
- Occupied-cell, out-of-range, duplicate-click, wrong-turn, and postgame moves rejected without state changes.
- Computer only picks legal empty cells; computer does not play after human terminal move.
- Restart or Change Mode while computer response is pending never creates a stale move.
- Practice permits repeated same symbol; Undo removes only most recent placement and can reverse a win/draw score.
- Re-rendering a completed game never increments score twice.
- Reset Scores during a completed round followed by Practice Undo does not make a score negative.
- Mode switching preserves independent per-mode scores until refresh.
- All four presets render without changing internal winner logic.
- Mobile 320/375, tablet 768, and desktop 1280 CSS px layouts; keyboard and reduced-motion checks.

## 7. MVP definition of done

All three modes work, all planned game controls and preset options work, no critical game-state bugs remain, visual design is consistent and responsive, game logic is tested, a production build passes, the README explains setup/features and links to the live Vercel site, and the public site has been manually checked. See `DEVELOPMENT_ROADMAP.md` for milestone-by-milestone acceptance criteria.

## 8. Out of scope

Online rooms or invites, authentication, persistence across refreshes, database, leaderboards, multiplayer networking, external AI services, custom asset uploads, monetization. Local Medium/Hard AI and alternating starters were approved as the M5.5 scope extension.

## 9. Planning and approval

The project is not yet authorized for implementation. Codex must first review the repository and planning documents and propose the **next single milestone**. It may implement only a milestone the user explicitly approves. Keep commits, remote pushes, external actions, credentials, and Vercel deployment separately approval-gated.
