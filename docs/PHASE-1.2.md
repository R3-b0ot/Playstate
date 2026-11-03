# Phase 1.2 — reusable UI and game-core integration

**Status:** Implemented in the browser showcase source; runtime build and browser verification remain outstanding.

## Shared UI package

The `@playstate/ui` package now exports reusable:
- Buttons, cards and status chips.
- Labelled text inputs, text areas and selects.
- Quiz cards and question navigator rows.
- Answer option rows with selected/correct states.
- Accessible dialog shell, live-region toast and empty state.

The shared component stylesheet covers form states, editor surfaces, dialog overlays, notifications, answer states and responsive editor layouts. Existing brand tokens and approved SVG assets remain the source of truth.

## Quiz editor

The web showcase now routes quiz creation into a question editor. The editor supports:
- Adding and selecting questions.
- Editing question prompts and four answer options.
- Selecting the correct answer.
- Optional explanation text.
- Basic validation before a test run.
- Visible default timer policy: Q1–4 60 seconds, Q5–9 120 seconds, Q10+ untimed.

Draft state currently lives in React/browser memory. It is not yet durable storage and is not shared across browser sessions.

## Shared game engine

A new framework-independent `@playstate/game-core` package provides:
- Quiz validation and session creation.
- Session start, option reveal, answer selection and lock.
- Timer start, pause, resume and expiry transitions.
- Host answer reveal and next-question progression.
- Explicit lost, timed-out, host-ended and won outcomes.
- Domain events returned with state transitions.
- Timer policy boundaries matching the confirmed product rule.

The editor's Test Run uses these engine commands for a real in-browser session flow. It currently uses manual answer locking; a visible ticking countdown, timer controls in the presenter console, persistence, and audience projection are later integration work.

## Verification boundary

Files were committed to `main`. A local pnpm install/build, automated unit tests, browser interaction tests, and GitHub Actions result have not been run/confirmed in this work session. Do not treat this milestone as release-tested.


## Portable web quiz files

The web editor now uses a portable, versioned `.playstate` file format:
- File envelope identifies the Playstate format and schema version.
- Quiz payload includes its title, questions, answer options, correct answer IDs and optional explanations.
- Import rejects invalid JSON, unknown format versions, malformed quiz data and files above 5 MB.
- Import assigns a new quiz ID so the imported working copy is independent of its source.
- The editor can export a validated quiz as a downloadable `.playstate` file.
- Browser-local recovery snapshots are written while editing and restored on reload.
- The browser's native unsaved-changes warning is registered while the editor has changes beyond its last downloaded file snapshot.

The browser cannot show a custom save dialog during tab/window closure or initiate a download from the close prompt. The explicit Save Quiz action is therefore the authoritative export path; the close warning is a last-chance reminder, not a replacement for saving.

## Verification boundary

The file-format and editor integration changes have been committed to `main`. They still require the GitHub Actions typecheck/build run and hands-on browser checks for file download, import validation, reload recovery, and close/reload warnings. The web app currently supports importing a file directly into the editor; a persistent multi-quiz library and full presenter/audience flow remain subsequent work.


## Persistent browser quiz library

The web workspace now stores the user's quiz collection in browser local storage:
- New quizzes are created with stable independent IDs and added to the library immediately.
- Every editor change is synchronized into the local library, so returning to the library and reopening a quiz retains its content.
- The library survives browser reloads on the same browser profile and device.
- Imported `.playstate` files are added as independent entries; importing the same source again produces another independent copy.
- Library entries can be searched, opened and removed. Removing an entry does not delete any downloaded `.playstate` file.
- A local recovery snapshot remains available as an additional safeguard.

Browser local storage is device- and browser-profile-specific, can be cleared by the user/browser, and has finite quota. It is not a substitute for exporting and keeping the portable `.playstate` file. No cloud sync or account storage is introduced.

Verification still requires the next GitHub Actions run and manual browser checks, including reload persistence, editing/reopening, import-as-copy, delete behaviour, quota handling, and export/import round trips.


## Functional web demo — presenter integration

The web application now includes a presenter-led live quiz flow:
- A bundled five-question `The Playstate Challenge` quiz is seeded on first launch only; if a user intentionally removes all quizzes, the empty library remains empty on reload.
- A validated quiz can be launched directly from the library.
- Host controls reveal question/options, start/pause/resume the countdown, lock the answer, reveal the correct answer, advance after correct answers, and end a session.
- Timer behaviour follows the confirmed policy: Q1–4 60 seconds, Q5–9 120 seconds, Q10+ untimed.
- Timer expiry locks the answer; revealing remains a separate host action.
- Audience view hides host controls and conceals the question until reveal; the host can switch back to host view.
- Fullscreen presentation is available.
- The demo uses one browser window and a view toggle; a separate synchronized audience window is not implemented yet.
- Session summaries are shown at the end of the live session but are not yet persisted into Results & History.

## Publishing

The workflow now typechecks and builds the app, then deploys to GitHub Pages on pushes to `main`. GitHub Actions cannot enable Pages for this repository because its token lacks that repository-administration permission. A repository owner must perform the one-time setup: Settings → Pages → Build and deployment → Source → GitHub Actions. After that, the workflow can publish automatically.

The app's Vite base path is configured for `/Playstate/`. CI confirms TypeScript checking and production bundling; actual browser interaction and the first Pages deployment still need verification.


## Session history

Completed presenter sessions now emit a local summary containing quiz title, question count, outcome and completion timestamp. The web app stores these summaries in browser local storage and displays them under Results & History. This is a local summary only; it does not yet include per-question answer analytics, participant identities, prize ladder or exportable reports.
