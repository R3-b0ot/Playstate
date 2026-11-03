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
