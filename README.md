# Dark Arcade Tic-Tac-Toe

A personal portfolio project built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## Current scope

M1 provides project configuration. M2 adds Home → Mode Selection → Game Setup → Game within the single `/` route, three mode choices, four symbol presets, and a non-interactive board preview. The screens use the approved Dark Arcade palette and responsive layouts. Final fonts and visual polish remain planned for M7.

M3 makes **Play vs Friend** playable: X starts, turns alternate, all eight winning patterns and draws are detected, winning cells are highlighted, and completed rounds reject moves. Presets change the displayed symbols only.

M4 adds independent session scores, New Round/Play Again, and confirmed Reset Scores. M5 adds Computer mode with a 400 ms response delay. M5.5 adds alternating starters for Computer/Friend and Easy, Medium, and Hard computer difficulty. Practice remains a non-playable preview; Undo is not implemented. M1–M5 are merged into main; M5.5 is being reviewed on its feature branch.

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
4. Select **Start Game**. Confirm the mode and symbol pair match your choices. Friend and Computer are playable; Practice remains a preview.
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

Select **Play vs Friend**, choose a preset, and select **Start Game**. Player 1 starts the first round; M5.5 alternates starters on each fresh board. Use an X-start round for the sequences below, number the cells from left to right:

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

Between sequences, use **New Round/Play Again** or **Back to Setup → Start Game**. Leaving the Game screen discards the round; mode and preset selections remain.

During play, try selecting an occupied cell: it must not replace its symbol or advance the turn. After a result, all cells must be disabled. Use Tab to navigate available cells and Enter or Space to place a symbol. Repeat with another preset, then verify Practice remains a preview and Back/Change Mode still work.

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

## M4: Scoreboard and round controls

Scores live in the game reducer, separately from the active round. A valid move that ends a round credits its result once. Rendering never updates scores. Reset Scores clears only the active mode and invalidates the round's credit while retaining its board. New Round/Play Again clears the board and keeps the selected mode, preset, and scores. Since M5.5, Computer/Friend alternate starters. Navigation preserves scores; refreshing the page clears them.

Manual checks: win a Friend round and verify one point; choose Play Again and verify it remains. Try Cancel and Escape in Reset Scores, then confirm a reset. The completed board should remain locked with zero scores. Switch to Computer or Practice and back; Friend scores should survive. Practice remains a placeholder. Refresh to verify all scores reset.

Validation: 68 automated tests passed, plus lint, type-check, and production build. Browser checks passed for X/O wins and draws, accumulated scores, New Round, Play Again, Cancel/Escape/confirm, keyboard focus wrapping/restoration, active/completed-round resets, mode isolation, refresh, and a 320 px dialog layout. No browser console errors or warnings were captured. Screen-reader speech was not manually tested. No new dependencies were added.

## M5: Easy Computer mode

`lib/computerAI.ts` lists the empty cells and uses `Math.floor(random() * emptyCells.length)` to choose an index. Every empty cell has the same chance; the computer does not look ahead or choose strategically. Completed boards return no move.

`useTicTacToe` schedules the computer in a React effect, outside the pure reducer. Cleanup cancels the 400 ms timer on round changes or unmount. A computer action carries its round ID and board snapshot; the reducer rejects stale or duplicate responses, wrong turns, occupied cells, and completed rounds. The shared M4 scoring logic still credits each result once. M5 originally started every round with human X; M5.5 now alternates starters.

Manual checks after `npm run dev`:

1. Choose Computer, pick a preset, and start. Expect **Your Turn** and an empty board.
2. Place X. During **Computer is thinking...**, all cells must be disabled. One O appears after about 400 ms, then input returns.
3. Quickly choose **New Round** or **Change Mode** during the delay. The old response must not affect the replacement round. Since M5.5, an O-start round receives its own single opening move.
4. Finish rounds. Check **You Win!**, **Computer Wins!**, or **It's a Draw!**, winning highlights, disabled cells, and one score update.
5. Check Play Again retains scores, Reset Scores requires confirmation, and Friend scores remain separate. Practice must stay disabled.

Validation: automated tests cover random selection intervals, terminal boards, human-first turns, duplicate/stale actions, timer cleanup (including Strict Mode's setup/cleanup sequence), restarts, navigation, reset during thinking, and computer-mode scoring. Browser checks covered human/computer turns, input lock, restart/mode-change cancellation, three scored human wins, Play Again, reset cancel/confirm, Shapes symbols, Friend regression, mode score isolation, Practice preview, navigation back to Home, and mobile layout at 375 px. No browser console errors or warnings were captured. Computer wins and draws are covered by automated tests; screen-reader speech was not manually tested. No dependencies were added.


## M5.5: Alternating starters and difficulty

Computer and Friend each remember their next starter, initially X. Creating a board with Start Game or New Round/Play Again consumes that starter and flips it for that mode. This includes unfinished rounds and returning directly from Game to Setup. Entering Computer/Friend from Mode Selection resets that mode to X while preserving all scores. Players keep their X/O assignments. Confirmed Reset Match clears that mode's board/scores, cancels pending moves, and restarts with X (O next). Difficulty and preset remain selected. Refresh resets the session. Practice retains its existing Reset Scores behavior.

The Computer-only setup selector defaults to Easy and persists for the page session. Each started round captures its difficulty; mid-round difficulty changes are rejected. Easy remains uniformly random. Medium checks for an O win, then blocks an X win, then chooses randomly. Hard uses Minimax to explore possible continuations, assuming both players choose their best outcome; repeated positions are cached within each search. It prefers faster wins and supports both starting orders. All levels share the existing win/draw rules, 400 ms timer, and stale-action guards.

Manual checks:

1. Start Computer: X starts. New Round: O opens automatically. New Round again: X starts. Rapidly restart during the opening delay and confirm no stale O appears in the X-start round.
2. Switch to Friend: its first round starts X, its second starts O. Return to Computer through Mode Selection: it starts X again and retains its scores.
3. Reset Match and confirm the board and current mode scores clear, X starts, and the next New Round starts O. Check O-start wins credit Player 2/Computer once.
4. In Computer setup, choose Easy, Medium, or Hard using mouse or arrow keys. The selection should persist through rounds and returning to setup. The selector must be absent in Friend and Practice.
5. Try to beat Hard with either starting order. Check different symbol presets, score preservation, resets, and navigation. Refresh: Easy, X-first sequences, and zero scores return.

Validation: Part A passed 94 tests, lint, and TypeScript before Part B began. Final validation passed 108 tests, lint, TypeScript, and production build. Tests exhaustively explore every legal human continuation against Hard from both starting orders and find no human wins. Tests also cover Medium priorities, Easy probability intervals, O openings in every difficulty, sequences, difficulty persistence, scores, and stale timers.

Browser checks used the local production build: Computer X/O/X starts, all three difficulty openings, two Hard computer wins, Friend O-start win, independent sequences/scores, reset confirmation, restart and mode-change cancellation, keyboard difficulty selection, Love & Stars display, hidden selectors in Friend/Practice, refresh defaults, and 375 px mobile layout passed. No console errors or warnings were captured. Screen-reader speech was not manually tested. No dependencies were added; M6/M7 were not started.


### M5.5 reset refinement

Computer/Friend now show **Reset Match** with confirmation; **Cancel** leaves the match unchanged. Mode Selection starts a fresh X-first sequence without clearing scores. New Round continues alternating and preserving scores. Reset Match preserves difficulty, preset, and other modes' scores. Practice and the AI algorithms are unchanged. Earlier milestone validation notes describe behavior at those milestones.

Refinement validation: 112 tests, lint, TypeScript, and production build passed. Focused tests cover resets in all difficulties, mode re-entry with pending moves, score isolation, and X/O sequencing. Browser checks passed for Cancel/Escape/confirm, clearing an occupied board and current scores, X restart followed by O, Computer → Friend → Computer score preservation and X-first entry, stale mode-change protection, and unchanged Practice controls. No browser console warnings or errors were captured.
