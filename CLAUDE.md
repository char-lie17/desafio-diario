# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Desafío Diario: a React 19 + Vite + Tailwind 4 single-page app with two modules: one Spanish-language math problem per day for grades 7–11, and one chess puzzle per day for each rating level. Deployed on Netlify (`netlify.toml`: `npm run build`, publish `dist/`, SPA redirect). All UI text and problem content is in Spanish; keep it that way.

`README.md` (Spanish) documents the chess dataset preparation. `AGENTS.md` holds the repo's style and commit conventions (two-space JS/JSON, four-space Python, `feat:`/`fix:`/`docs:`/`chore:` commits).

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — production bundle to `dist/`
- `npm run preview` — serve the built bundle
- `npm run lint` — Oxlint (`.oxlintrc.json`)
- `npm test` — `node:test` suite in `tests/` (replays every chess puzzle, ~20 s); one file: `node --test tests/chess.test.js`; one case: add `--test-name-pattern "<name>"`
- `python content-engine/build_chess_levels.py [path/to/lichess_db_puzzle.csv.zst]` — regenerate the chess level files (needs `pip install zstandard`)
- `python content-engine/validate_json.py` — structural check of the five math datasets; exits 1 on errors

Only the chess logic has automated tests; verify everything else with lint + build and by exercising the app manually. The math generators need `sympy`; there is no `requirements.txt`.

## Architecture

### Daily problem selection (`src/features/daily/dailySelector.js`)

This module is the core of the app and also owns all localStorage state.

- The five `src/content/math/grade-*.json` files are imported statically and bundled; there is no backend for content.
- The problem for a date is `problems[daysSince(LAUNCH_DATE) % problems.length]`: sequential by array order, not random. Reordering or regenerating a dataset changes which problem every past and future date shows.
- `LAUNCH_DATE` (`'2026-07-23'`) is also the lower bound for date navigation in `App.jsx`; the upper bound is today.
- Dates are `YYYY-MM-DD` strings in the user's local timezone. They are parsed by splitting and calling `new Date(y, m - 1, d)`, never `new Date(str)`, to avoid UTC shifts. Follow that pattern.
- localStorage keys: `desafiodiario_grade`, `desafiodiario_chess_level`, `desafiodiario_module`, `desafiodiario_completed`, `desafiodiario_streak`, `desafiodiario_last_streak`. Completion is stored as `{ [date]: { math: { [grade]: true }, chess: { [level]: true } } }`; legacy boolean values are dropped on read. `getDayProgress` / `markChallengeCompleted(type, date, key)` are the only accessors.
- The streak increments only when one of today's challenges (math or chess) is solved, at most once per day, and resets when more than one day is skipped.

### App state and sync

`src/App.jsx` holds all state (active module, grade, chess level, date, day progress, streak) and renders the whole page, mounting `MathChallenge` or the lazy-loaded `ChessChallenge`. `src/main.jsx` wraps the app in `AuthProvider` (`src/context/AuthContext.jsx`), which withholds rendering until Firebase reports the auth state.

localStorage is the source of truth. `src/features/sync/firebaseSync.js` writes a snapshot to Firestore `users/{uid}` (profile, grade, chessLevel, streak, `completedDays.{date}.math.{grade}` and `.chess.{level}`) on sign-in and after each solve. It sends only completed entries with `merge: true`, so a pending challenge never clears one completed elsewhere. `fetchFromFirestore` exists but is not called, so nothing is restored from Firestore to the device.

Firebase config is hardcoded in `src/firebase.js`; sign-in is Google via `signInWithPopup`.

### Problems and answer checking

Problem schema: `id` (`math-{grade}-{NNN}`), `grade`, `category`, `subcategory`, `difficulty` (1–5), `title`, `question`, `latex`, `answer` (string), `solution` (list of `{latex, explanation}`), `hints` (list), `type` (`numeric`, `multiple_choice`, or `true_false`), and `options` for multiple choice.

`MathChallenge.jsx` checks answers by exact string equality after lowercasing and stripping whitespace. There is no numeric or symbolic equivalence, so the `answer` string in the JSON must match what a student would type. `question` text may embed inline math between `$` delimiters; `latex` is rendered as a display formula. All math rendering goes through `KaTeXView`.

### Content engine (`content-engine/`)

Two generators both overwrite `src/content/math/grade-*.json`:

- `generate_curriculum.py` — random parametric problems, shuffled, 100 per grade, IDs reassigned by position. The committed datasets (100 per grade) match this script's output.
- `generate_and_validate.py` — a hand-written set of 20 per grade with SymPy/KaTeX checks; also writes `quality_report.md` and `quality_report.json`. The committed `quality_report.md` (100 total) reflects this script, not the current data.

Running either one replaces the datasets, and `generate_curriculum.py` is unseeded, so a rerun reshuffles the date-to-problem mapping. Review dataset diffs before committing and run `validate_json.py` afterwards.

### Chess module

- Data: `content-engine/build_chess_levels.py` streams the Lichess puzzle CSV (~6.2M rows) once and writes `public/chess/level-<rating>.json` (23 levels, 730 puzzles each, ~100 KB) plus the bundled manifest `src/content/chess/levels.json`. Rows keep Lichess's raw shape `[id, fen, moves, rating, themes]`. The browser fetches one level file on demand (`src/features/daily/chessLevels.js`, cached per session); never import the level files into the bundle.
- Selection: `chessDaily.js` indexes the level file by days since `LAUNCH_DATE`, the same convention as math. File order is part of the contract: regenerating changes which puzzle each date shows.
- Lichess FENs are the position before the opponent's last move. `rowToPuzzle` keeps `startFen` + `firstMove` and treats the remaining moves as `solution` (player, reply, player...). The player's colour is the side to move after `firstMove`.
- `chessPuzzle.js` holds the chess.js logic (move checking, alternative mates accepted, SAN solution, Spanish theme names and hints). Keep chess.js imports out of anything `App.jsx` imports eagerly, so it stays in the lazy `ChessChallenge` chunk.
- `ChessChallenge.jsx` is a small state machine: `intro` (plays the opponent's first move) → `play` ⇄ `reply` → `solved`, or `reveal` for solution playback. Revealing the solution does not mark the puzzle completed.

### Styling

`src/index.css` defines the design tokens and shared component classes (`.card`, `.btn*`, `.chip*`, `.option`, `.alert*`, `.field`, `.module-tab`, `.board-frame`). The module accent comes from `--accent`, switched by `data-module` on the app root (emerald for math, sky for chess). Reuse these classes instead of ad-hoc Tailwind colour utilities.
