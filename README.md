# Playstate

<p align="center">
  <img src="assets/brand/playstate-wordmark-neon.svg" alt="PLAYSTATE — Knowledge. Competition. Game on." width="520" />
</p>

Playstate is an offline-first quiz creation and live-hosting platform.

**Create the quiz. Run the show. Own the moment.**

The web edition is a standalone browser app. Create and edit quizzes, keep a local library, export portable `.playstate` files, import shared quizzes as independent copies, and host a quiz with a live countdown and audience display. No account, backend, or cloud connection is required for the core experience.

> **Current status:** The web app typechecks and builds in GitHub Actions. To publish it, enable GitHub Pages once in repository Settings → Pages → Build and deployment → Source → GitHub Actions. The workflow then deploys each successful push to `main`.

## Try it locally

Requirements: Node.js 24 and pnpm 10.

```bash
pnpm install
pnpm --filter @playstate/web dev
```

Open the local Vite URL shown in the terminal. The first launch includes **The Playstate Challenge**, a five-question demo quiz. For the hosted version, enable Pages using the setting above; deployment is handled by `.github/workflows/web-ci.yml`.

## Web demo workflow

1. Open the Quiz Library and try **The Playstate Challenge**.
2. Select the green play control on a quiz row to host it.
3. Start the show, reveal options, start the countdown, lock an answer, and reveal the correct answer.
4. Switch to Audience view for a clean display, or use Fullscreen for presentation.
5. Create your own quiz, edit its questions, and use **Save .playstate** to export a portable file.
6. Import a `.playstate` file to create a separate editable copy.

### Timer policy

- Questions 1–4: 60 seconds each.
- Questions 5–9: 120 seconds each.
- Question 10 onwards: untimed; the host manually locks the answer.

The timer locks the answer when it expires; the host still reveals the correct answer separately. An unanswered timed question ends the run after reveal.

## User-owned quiz files and local storage

- `.playstate` is the versioned portable quiz-file format.
- Importing always creates a new independent quiz identity. The source file is never modified.
- The browser library and recovery snapshots are stored locally in the current browser profile.
- Browser storage is not cloud backup and may be cleared by browser settings. Export quiz files and keep them somewhere safe.
- Browsers only offer a native close/reload warning; they do not permit a custom Save/Don't Save dialog during tab closure.

## Approved brand identity

The approved identity is **dark cinematic × neon futuristic**, built around the approved geometric symbol + wordmark system.

| Asset | Purpose |
|---|---|
| [Neon wordmark](assets/brand/playstate-wordmark-neon.svg) | Primary brand lockup |
| [Monochrome wordmark](assets/brand/playstate-wordmark.svg) | Single-colour lockup |
| [Neon symbol](assets/brand/playstate-mark-neon.svg) | Brand moments and app icon |
| [Monochrome symbol](assets/brand/playstate-mark.svg) | Compact UI and monochrome use |
| [Browser favicon](apps/web/public/favicon.svg) | Web identity |
| [Design tokens](packages/ui/src/styles/tokens.css) | Shared UI styling |
| [Brand usage guide](assets/brand/README.md) | Asset rules |

These are the approved canonical assets. All future Playstate files and interfaces must use them and the shared design tokens; do not introduce alternate marks or competing palettes.

## Editions

| Edition | Purpose | Runtime |
|---|---|---|
| Web | Create, import, export, manage and host quizzes | React + TypeScript + Vite; browser local storage |
| Desktop (planned) | Native Windows quiz authoring and live event operation | Tauri 2 + local SQLite |

## Principles

- Offline first: core quiz workflows run locally without a backend.
- One game engine: quiz rules live in the shared TypeScript package.
- Presenter-led: host controls the session; audience mode is a read-only projection.
- No mandatory accounts, cloud sync, or telemetry in the initial product.
- Preserve the original PHP/MySQL KBE project as a separate historical reference.
- Target WCAG 2.2 AA: keyboard operation, visible focus, contrast, and reduced motion. This is a target, not a claim of verified compliance.

## Planned structure

- `apps/web` — GitHub Pages browser app
- `apps/desktop` — planned Tauri desktop application
- `packages/game-core` — framework-independent quiz engine and portable file format
- `packages/ui` — shared interface components and approved design tokens
- `docs` — product, architecture, audit, brand and roadmap
- `assets/brand` — approved vector identity assets

## Project history

Playstate is a new product identity and rebuild of an earlier PHP/MySQL quiz prototype called **KBE — Kaun Banega Entrepreneur**, originally created for a Rotaract event. The original repository remains separate: https://github.com/R3-b0ot/KBE

## License

No license has been selected. Until one is added, all rights are reserved by the copyright holder.
