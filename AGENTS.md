# Codex Instructions — Dark Arcade Tic-Tac-Toe

## Read first
- `PROJECT_PLAN.md` is the source of truth for product scope, modes, game rules, UI, and exclusions.
- `DEVELOPMENT_ROADMAP.md` is the source of truth for implementation order, milestone acceptance criteria, and Git workflow.
- If a requirement appears ambiguous or contradictory, explain it and ask for a decision **before implementing** a change that would pick one interpretation.

## Current authorization state
**Planning only. Do not write application code, install dependencies, initialize a repository, create branches/commits, push, or deploy until the user explicitly approves the applicable action.** On first handoff, inspect the planning files and propose the first milestone and its checks.

## Technology and architecture
- Next.js App Router, React, TypeScript, Tailwind CSS; npm as the default package manager unless the user changes it.
- Use a single `/` route with four React-rendered application screen states.
- Keep interactivity in client components; avoid a backend/database/API.
- Share one 3×3 board/game engine across all three modes.
- Keep pure rules in `lib/gameLogic.ts`, random computer choice in `lib/computerAI.ts`, coordinated game state in `hooks/useTicTacToe.ts`, and display symbol presets in `data/symbolPresets.ts`.
- Prefer `useState` for simple screen/config choices and `useReducer` for related game changes. Keep reducers pure.
- Internal board values are `X`, `O`, and `null`; display symbols are cosmetic only.
- Build responsive mobile-first UI with the fixed Dark Arcade palette in the plan.

## Working agreements
1. **One milestone at a time.** Before coding, identify exact scope, relevant files, dependencies, and testable acceptance criteria. Stop for approval.
2. Make the smallest useful change. No unrelated refactors, tools, libraries, or extra product features.
3. Explain changes in beginner-friendly terms so the developer can learn from each decision.
4. Write or update targeted tests for relevant game logic and state transitions. Explicitly report which tests and checks were actually run, and any failures.
5. Review `git diff` before proposing a commit. Never claim success for unrun tests, builds, or deployments.
6. Do not change product scope, icon presets, score semantics, UI direction, or persistence behavior without user approval.
7. Keep history of meaningful work through clearly named feature branches and small, descriptive commits **when separately approved**.
8. Do not commit credentials, environment secrets, or unnecessary generated files.
9. Before moving on, summarize files changed, behavior implemented, verification evidence, remaining issues, and the next milestone.

## Important edge cases
- Winner checked before draw; ninth-cell winning move counts as win.
- A completed round increments its score exactly once.
- Practice Undo can reverse a completed round's score exactly once, except after a Reset Scores invalidates that round's credit.
- Pending computer moves must be canceled/invalidated after restart or navigation.
- Mode scores remain separate during the page session and reset on refresh.
- Accessibility: semantic cells, focus visibility, turn/result announcements, reduced-motion support, and mobile touch targets.

## When implementation is approved, suggested verification
- Run project's configured test script (to be added during implementation).
- Run lint script and production build.
- Manually verify mode navigation, mobile behavior, symbol selection, reset and pending-computer edge cases.
- Do not assume any script exists until checking `package.json`.

## Response format for a milestone review
- Goal and files affected
- Implementation summary in plain language
- Acceptance criteria: passed / failed / not checked
- Tests/validation actually run
- Known issues and changes needing approval
- Suggested next milestone (do not start automatically)
