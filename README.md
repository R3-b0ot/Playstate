# Playstate

<p align="center">
  <img src="assets/brand/playstate-wordmark-neon.svg" alt="PLAYSTATE — Knowledge. Competition. Game on." width="520" />
</p>

Playstate is an offline-first live quiz platform for hosted competitions, classrooms, institutions, and corporate events.

The first release is quiz-only. The web edition is a standalone, offline-capable quiz authoring and play experience built around portable `.playstate` files. A Windows desktop edition is planned separately.

> **Status:** Foundation and architecture planning. The original KBE prototype is being audited; feature parity is not yet verified.

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
| Web showcase | Instantly playable sample quiz | Static site; GitHub Pages |
| Desktop | Full quiz authoring and live event operation | Tauri 2 + local SQLite |

## Principles

- Offline first: desktop core workflows work without internet access.
- One game engine: quiz rules live in a shared TypeScript package.
- Presenter-led: host controls the session; audience display is a separate read-only view.
- No mandatory accounts, cloud sync, or telemetry in the initial product.\n- User-owned quiz files: importing a `.playstate` file creates an independent copy; saving exports a new file.\n- Browser storage is a recovery aid, not the authoritative copy. Users keep their quiz files.
- Preserve the original PHP/MySQL KBE project as a separate historical reference.
- Target WCAG 2.2 AA: keyboard operation, visible focus, contrast, and reduced motion.

## Planned stack

TypeScript + pnpm workspaces, React + Vite, Zustand for UI state, Zod for validation, Tauri 2, SQLite, Vitest, and Playwright. These are planned choices and may be revised if the legacy audit reveals constraints.

## Planned structure

- apps/web — GitHub Pages browser app
- apps/desktop — Tauri desktop application
- packages/game-core — framework-independent quiz engine
- packages/data-models — shared types and validation
- packages/ui — shared interface components and approved design tokens
- data — curated demo content
- database/migrations — SQLite migrations
- docs — product, architecture, audit, brand and roadmap
- assets/brand — approved vector identity assets
- legacy — archived KBE source, after audit/import

## Project history

Playstate is a new product identity and rebuild of an earlier PHP/MySQL quiz prototype called **KBE — Kaun Banega Entrepreneur**, originally created for a Rotaract event. The original repository remains separate: https://github.com/R3-b0ot/KBE

## License

No license has been selected. Until one is added, all rights are reserved by the copyright holder.
