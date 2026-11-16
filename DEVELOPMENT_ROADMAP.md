# Dark Arcade Tic-Tac-Toe — Stage 6 Development Roadmap

**Status:** Planning complete; no application code created.  
**Approach:** One independently verifiable milestone at a time, user-approved before any implementation.  
**Primary specification:** `PROJECT_PLAN.md`. **Codex guidance:** `AGENTS.md`.

## How to use this roadmap

For each milestone: (1) read its scope, (2) ask Codex to inspect and propose minimal changes, (3) explicitly approve implementation, (4) validate acceptance criteria, (5) review changes, (6) approve Git commit/push separately, (7) only then move forward.

### Milestone M1 — Project setup
**Depends on:** none.  
**Tasks:** Establish local working folder; use Next.js App Router with TypeScript, Tailwind CSS, and ESLint; choose npm and stick to one lockfile; initialize Git and GitHub repository; establish planned directories and planning files; confirm dev environment.  
**Acceptance:** App starts locally; the base route renders without an error; TypeScript/Tailwind/ESLint are configured; Git repository includes the planning documents; `node_modules`, `.next`, local secrets are ignored by Git; a first clean commit is ready for user approval.  
**Verify:** Start local dev server; inspect file tree and `package.json`; run relevant configured lint/build checks. Do not assume scripts before inspecting.  
**Boundary:** No game functionality or decorative feature work.

### Milestone M2 — Navigation and screen skeleton
**Depends on:** M1.  
**Tasks:** Build four screen states (Home, Mode Selection, Game Setup, Game); add navigation/back behavior; create minimal UI for mode selection and setup; selected mode/preset survives forward/back navigation before a game starts.  
**Acceptance:** Home → Modes → Setup → Game works for all three modes; Back and Change Mode behave correctly; no full browser reloads for in-app navigation; provisional game screen identifies chosen mode and symbol pair.  
**Verify:** Manual click-through of all branches; simple component/navigation test if testing tool already configured.  
**Boundary:** Game board may be static; no game logic yet.

### Milestone M3 — Shared board and local Friend mode
**Depends on:** M2.  
**Tasks:** Define internal board types and standard win lines; implement pure move validation, winner/draw detection; render nine accessible cells; wire player turns in Friend mode; highlight wins; prohibit invalid/post-game moves. Add automated tests for pure game rules.  
**Acceptance:** Alternating X/O works; invalid clicks never change turn; all eight wins detected; completed board without winner is draw; winning ninth move is win; no moves accepted after completion; one board implementation reused.  
**Verify:** Unit tests for all eight win patterns, occupied cell, postgame move, draw, ninth-cell win, and multiple win lines; manual keyboard navigation.  
**Boundary:** No AI, Practice Undo, or polished visuals.

### Milestone M4 — Scoring and round controls
**Depends on:** M3.  
**Tasks:** Introduce scores for each mode; implement New Round, Play Again, Change Mode; build scoreboard labels and Reset Scores confirmation; guarantee idempotent result crediting and discard of unfinished rounds.  
**Acceptance:** Friend win/draw increments correct counter exactly once; New Round preserves scores; switching mode retains each mode's scores while session is active; Reset Scores clears only current mode; refresh clears scores; completed game rerenders do not change score.  
**Verify:** Score transition tests, reset confirmation tests, navigation regression checks.  
**Boundary:** Other modes may show placeholder board behavior until M5/M6.

### Milestone M5 — Easy computer mode
**Depends on:** M3 and M4.  
**Tasks:** Add random legal-cell selection; human uses X first; computer uses O; temporarily lock input during computer turn; optional short delay; guard pending move against restart, mode switch, or unmount.  
**Acceptance:** Computer always picks an empty cell, at equal chance across available cells in the algorithm; one response per eligible human move; no response after terminal human move; stale delayed computer moves cannot change a reset/replaced round; scores map to Human/Computer/Draw.  
**Verify:** Inject/control randomness for deterministic tests; test cancellation, restart, mode switch, and rapid clicks; play several manual rounds.  
**Boundary:** No Medium/Hard AI or strategic move prediction.

### Milestone M5.5 — Gameplay enhancements (approved scope extension)
**Depends on:** M5.

**Part A:** Alternate starters independently in Computer/Friend, beginning with X. New Round/Play Again consumes the next starter. Entering a mode from Mode Selection resets its sequence to X and preserves scores. Confirmed Reset Match clears that mode's board/scores and restarts with X, canceling pending computer moves. Practice retains its existing Reset Scores behavior. Refresh resets sequences. Test Part A and report results before Part B.

**Part B:** Retain Easy random play; add Medium win/block/random and optimal Hard Minimax. Add a Computer-only accessible setup selector, default Easy, preserving selection across rounds/navigation.

**Acceptance:** O can open automatically in Computer mode; stale timers remain invalid; scores stay mode-specific and credit once; Hard cannot lose against legal human play with either starter; Friend and Practice behavior remains within scope.

**Verify:** Sequence/reset/navigation tests, exhaustive legal human continuations against Hard, difficulty persistence, timer tests, browser walkthrough, lint, TypeScript, and build.

**Boundary:** No Practice implementation, external AI services, or later milestones. This milestone supersedes M5's Easy-only/human-first boundary for subsequent work.

### Milestone M6 — Practice mode, manual symbol control and Undo
**Depends on:** M3 and M4; can be implemented separately from M5.  
**Tasks:** Manual X/O selector, nonalternating placement, board-history Undo, terminal-result Undo, score-credit reversal and score-reset guard.  
**Acceptance:** X/X or O/O consecutive moves accepted; Undo restores most recent board and does not change selected symbol; Undo available after completed round; completed-score credit reversed once; Undo after Reset Scores never subtracts a cleared credit; no negative scores; New Round clears history and restores X selection.  
**Verify:** Tests for repeated symbols, empty history, multi-step Undo, win/draw Undo, score reset + Undo; manual walkthrough.  
**Boundary:** No redo or save/load.

### Milestone M7 — Symbol presets and Dark Arcade responsive polish
**Depends on:** M2–M6.  
**Tasks:** Implement four paired symbol presets (Classic X/O; Love & Stars ♥/★; Sun & Moon ☀/☾; Shapes ◆/●); keep board logic internal X/O; apply approved palette, Space Grotesk and Inter, component spacing, neon hover/focus styles, winner highlights, minimal animations; responsive layouts; semantic labels/live statuses/reduced-motion settings.  
**Acceptance:** All four presets render correctly in all modes and never affect wins; selected preset applies to new game; desktop board/side panel and mobile stacked layout; no horizontal scrolling at 320 px; cells/buttons have >=44×44 CSS px targets; keyboard game works; visible focus and textual status are present.  
**Verify:** Manual 320, 375, 768, 1280 px views; keyboard-only play; reduced-motion checks; preset regression tests.  
**Boundary:** No user-uploaded icons, persistent preferences, or additional themes.

### Milestone M8 — Quality assurance and portfolio documentation
**Depends on:** M1–M7.  
**Tasks:** Run full automated checks (game logic + component interactions), manual regression matrix, fix critical bugs, validate accessibility and responsiveness, verify production build; complete README with overview, screenshots, features, tech stack, setup, testing, live-demo placeholder until deployment, and learning outcomes.  
**Acceptance:** Required scenarios GL-01..GL-24 (see project plan coverage) checked; no known critical defects; lint, tests, and production build succeed; README accurately documents what was implemented; repo does not include secret keys.  
**Verify:** Record actual commands and evidence, do not claim unrun checks.  
**Boundary:** No unapproved extra features.

### Milestone M9 — Vercel deployment and portfolio handoff
**Depends on:** M8 and user approval to connect/deploy.  
**Tasks:** Connect GitHub repo to Vercel Hobby, confirm production branch `main`, deploy, inspect logs, test public URL on phone and desktop, place live link in README, rehearse application demo.  
**Acceptance:** Public Vercel URL loads; all three modes and presets work online; scoreboard, Undo, restarts, results and navigation work; responsive mobile design holds; README links to live demo and repository; final release commit/tag only with approval.  
**Verify:** Manually test deployed URL and check Vercel build status.  
**Boundary:** No commercial hosting use, account creation, domain purchase or additional infrastructure.

## Milestone dependencies

```text
M1 Setup
  ↓
M2 Screens and Navigation
  ↓
M3 Core Board + Friend Game
  ↓
M4 Scoreboard and Controls
  ↓
M5 Computer Mode ─┐
M6 Practice Mode ─┤ (both required; order between them can vary)
                 ↓
M7 Presets + Dark Arcade Polish
  ↓
M8 Tests + Documentation
  ↓
M9 Deploy + Portfolio Handoff
```

## GitHub workflow (beginner friendly)

- Use `main` as the stable branch. Avoid unfinished code on `main`.
- Work on one short-lived branch per approved milestone, e.g. `feature/m03-friend-game`, `feature/m05-computer-mode`, `feature/m07-dark-arcade`.
- Review changed files and run the checks required by the milestone before any commit.
- Create small descriptive commits, e.g. `feat: add win detection for friend mode` or `test: cover all winning patterns`.
- If feasible, open a pull request to `main` and use its description for goal, screenshots/verification, and outstanding issues; approve merging only when ready. GitHub PRs support reviewing commits, checks, and file diffs.
- Once Vercel is connected, feature branch pushes may create preview deployments, and approved changes merged to `main` can create production deployments. Explicitly approve external pushes and deployments.
- Use GitHub Issues or a short checklist to track each milestone; no project-management service is required.

### Suggested milestone PR template

**Goal:** What this milestone adds.  
**In scope:** Expected changed components/modules.  
**Out of scope:** What was deliberately excluded.  
**Acceptance evidence:** What was tested and observed.  
**Screenshots:** If UI changed.  
**Known issues:** Any failures or follow-up items.  
**Approval:** Was the branch reviewed and authorized for merge?

## Testing tool decision (to confirm at M1/M3)

- Use a lightweight unit-test runner such as Vitest for pure game rules; React Testing Library is suitable for user interactions and game controls.
- These are **proposed** additions, not installed yet. Keep setup small and avoid an elaborate testing framework unless needed.
- Run the scripts actually defined in `package.json`; likely checks later will include `npm run lint`, `npm run test`, and `npm run build` after corresponding scripts have been added.
- The browser test matrix should include widths 320/375/768/1280 px and keyboard-only controls.

## Prioritized risk register

| Risk | When to address | Prevention / acceptance |
| --- | --- | --- |
| Duplicate scores due to rerenders | M4 | Credit once per completed round |
| Stale computer timeout after restart | M5 | Invalidate previous round actions |
| Practice Undo / Reset Scores interaction | M6 | Credit bookkeeping and targeted tests |
| Preset icons corrupt internal rules | M7 | Always store X/O internally |
| Narrow mobile layout overflow | M7 | Check 320 px first |
| Codex makes too many changes at once | All | One approved milestone, diff review, stop between phases |
| Build passes but live website fails | M9 | Manual check of production Vercel URL |

## Overall release gate

Do not call the project complete until all three modes, all four presets, responsive layouts, score semantics, and required user interactions are verified; tests and production build pass; code is reviewed; the live Vercel project works; and the README contains accurate links and portfolio context.
