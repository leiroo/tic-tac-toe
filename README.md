# Dark Arcade Tic-Tac-Toe

A personal portfolio project built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## Current scope

M1 provides project configuration. M2 adds Home → Mode Selection → Game Setup → Game within the single `/` route, three mode choices, four symbol presets, and a non-interactive board preview. The screens use the approved Dark Arcade palette and responsive layouts. Final fonts and visual polish remain planned for M7.

M3 makes **Play vs Friend** playable: X starts, turns alternate, all eight winning patterns and draws are detected, winning cells are highlighted, and completed rounds reject moves. Presets change the displayed symbols only.

Computer and Practice remain non-playable previews. Scoring, New Round/Play Again controls, AI, and Undo are not implemented yet. The project is not deployed.

## Local development

Use Node.js 24 or newer and npm. The initial setup was checked with Node.js 24 and npm 11.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js (normally http://localhost:3000).

## Checks

```sh
npm run test
npm run lint
npm run typecheck
npm run build
```

`npm run typecheck` generates Next.js route types before checking TypeScript. After a successful build, `npm start` serves the production build locally.

`npm run test` runs the Vitest game-rule and reducer tests once. Tests live beside the implementation in `lib/gameLogic.test.ts` and `hooks/useTicTacToe.test.ts`.

Development and build scripts use Next.js's Webpack option because Turbopack's CSS worker failed to bind a local port in the initial development environment. This does not change the App Router architecture.

Known tooling limitation: ESLint 9 is deprecated but currently satisfies the lint plugins shipped with this Next.js configuration. Trying ESLint 10 produced peer dependency conflicts. The initial npm audit reported seven moderate findings in the development-only TypeScript lint dependency chain; `npm audit fix` did not resolve them.

## Project structure

- `app/`: the route, shared HTML layout, and global CSS.
- `components/GameApp.tsx`: client-side screen and selection state.
- `components/screens/`: four application screens.
- `components/game/`: shared board, individual cells, and turn/result status.
- `components/ui/`: accessible symbol preset picker.
- `hooks/useTicTacToe.ts`: pure game reducer and round actions.
- `lib/gameLogic.ts`: pure move validation and win/draw analysis.
- `data/`: mode descriptions and cosmetic X/O symbol mappings.
- `types/`: navigation, setup, board, result, and round types.

Empty directories use `.gitkeep` files so Git preserves the planned structure.

## Planning documents

- [Project plan](PROJECT_PLAN.md): approved product scope, rules, and design.
- [Development roadmap](DEVELOPMENT_ROADMAP.md): milestones, acceptance checks, and Git workflow.
- [Agent instructions](AGENTS.md): working agreements and approval boundaries.

The planning documents retain their original planning-stage status. M1, M2, and M3 implementation were subsequently approved in chat; later milestones, commits, remote actions, and deployment still need their applicable approvals.

## Manually check M2

1. Run `npm run dev` and open the local URL.
2. Select **Start Playing**, then try each of the three modes.
3. In setup, select each of the four presets and check the preview.
4. Select **Start Game**. Confirm the mode and symbol pair match your choices. Computer and Practice remain inactive; Friend is now playable in M3.
5. Use **Back to Setup**, **Back to Modes**, and **Back to Home**, then move forward again. Your selected mode and preset should be preserved.
6. From the Game screen, use **Change Mode** and choose another mode. The previously selected preset should remain selected.
7. Confirm navigation keeps the URL at `/`. Refresh returns to Home and resets selections to Computer and Classic; nothing is saved between page loads.
8. Repeat at 320, 375, 768, and 1280 CSS px. Check for horizontal overflow and the stacked/mobile versus side-by-side/desktop Game layout.
9. Use Tab and Enter/Space for buttons, and arrow keys to change preset radio options. Check visible focus and that each screen change moves focus to its heading.

`GameApp` uses `useState` to remember the current screen and selection IDs. Each screen receives data and callback functions through props. Conditional rendering shows one screen at a time, while the parent state stays mounted. A small `useEffect` moves keyboard focus after navigation. M3 adds `useReducer` through the game hook for board and turn changes.

### M2 validation performed

- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- Browser checks: all 12 mode/preset combinations, nine disabled preview cells, unchanged `/` URL, Back navigation through Home, and Change Mode passed.
- All four screens at 320, 375, 768, and 1280 CSS px: no horizontal overflow; visible application buttons met the 44 px minimum. Desktop board/summary and mobile stacking were visually inspected.
- Keyboard checks: Enter activated navigation, arrow keys changed presets, Tab reached Start Game, preset focus had a visible outline, and screen transitions focused the heading. No browser console warnings or errors were captured.

These were direct browser checks, not a committed automated test suite. Reduced-motion styles are included; operating-system reduced-motion behavior and screen-reader speech were not manually tested.

## Manually check M3

Select **Play vs Friend**, choose a preset, and select **Start Game**. Player 1 starts every fresh round. For the sequences below, number the cells from left to right:

```text
1 2 3
4 5 6
7 8 9
```

- Player 1 win: **1, 4, 2, 5, 3**. Expect "Player 1 Wins!" and a highlighted top row.
- Player 2 win: **1, 4, 2, 5, 9, 6**. Expect "Player 2 Wins!" and a highlighted middle row.
- Draw: **1, 2, 3, 5, 4, 6, 8, 7, 9**. Expect "It's a Draw!" without winning highlights.
- Ninth-move win: **1, 2, 3, 4, 5, 6, 8, 7, 9**. Expect a Player 1 diagonal win, not a draw.
- Two winning lines: **1, 2, 3, 4, 7, 6, 9, 8, 5**. Expect both diagonals highlighted, with the center marked once.

Between sequences, use **Back to Setup → Start Game**. Leaving the Game screen discards the round; mode and preset selections remain. New Round/Play Again controls arrive in M4.

During play, try selecting an occupied cell: it must not replace its symbol or advance the turn. After a result, all cells must be disabled. Use Tab to navigate available cells and Enter or Space to place a symbol. Repeat with another preset, then verify Computer and Practice are still previews and Back/Change Mode still work.

### M3 implementation concepts

- **Pure functions:** `gameLogic.ts` reads a board and returns an answer without changing the board or accessing the UI.
- **Reducer:** the hook processes `start`, `move`, and `leave` actions. A valid move copies the board and updates the turn together. Invalid actions return the same state object.
- **Derived results:** winner, winning cells, and draw are calculated from the board instead of stored independently. Win detection takes priority over a full-board draw.
- **Display versus rules:** the board stores only `X`, `O`, or `null`. `GameCell` maps X/O to the chosen display symbols.
- **State ownership:** setup selections stay in `GameApp`; the hook owns the active round. Starting from setup captures its mode/preset and starts with X.

### M3 validation performed

- `npm run test`: all **51 tests passed**, covering both players across all eight win lines, invalid/duplicate/wrong-turn moves, immutable state updates, draws, ninth-cell wins, multiple winning lines, placeholder modes, and round lifecycle.
- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- Browser: Player 1/Player 2 wins, draw, ninth-move win, two-diagonal win, winning highlights, and complete board lock passed.
- Browser: all 12 mode/preset combinations, Back through Home, Change Mode, preserved selections, and fresh X-start rounds passed. Computer and Practice stayed disabled.
- Keyboard: Tab navigation, visible cell focus, and Enter/Space moves passed. No browser console warnings or errors were captured.
- Winning board checked at 320/375/768/1280 CSS px: no horizontal overflow and cells exceeded 44×44 px.

Reducer tests exercise state transitions directly; hook mounting and component interactions are covered by direct browser checks rather than a React Testing Library suite. Screen-reader speech and OS reduced-motion behavior were not manually tested. The existing seven moderate development-tooling audit findings remain.
