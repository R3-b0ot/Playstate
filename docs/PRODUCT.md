# Product brief

## Identity

- Product: Playstate
- Category: Live quiz platform
- Tagline: Knowledge. Competition. Game on.
- Initial scope: quiz experiences only
- Editions: browser showcase and offline-first desktop

Playstate should feel like a polished live game show supported by dependable event software. It must look compelling on a projector while remaining clear and efficient for a presenter operating under time pressure.

## Users

Quiz hosts, event organisers, schools, colleges, clubs, institutions, and corporate engagement teams.

## Product promise

Create, host, and present a structured quiz without needing a server, account, or reliable internet connection.

## First-release capabilities

1. Quiz library: create, edit, duplicate, organise, import, and export content.
2. Question authoring: prompt, answer choices, correct answer, explanation, category, difficulty, and optional media.
3. Live session: start, navigate, reveal/hide choices, lock an answer, reveal correctness, and advance.
4. Game progression: configurable prize ladder or score progression, milestones, and current-level highlighting.
5. Timer: configurable duration with start, pause, resume, stop, reset, and expiry handling.
6. Presenter console: authoritative controls and session status.
7. Audience display: dedicated presentation window with large, legible content and no presenter-only controls.
8. Session reset: safe end/reset flow with confirmation for destructive actions.
9. Local persistence: quiz library and settings stored in desktop SQLite.
10. Showcase mode: curated sample quiz playable immediately in a browser.

## Explicit non-goals

- Public-internet multiplayer
- Cloud accounts, sync, or hosted databases
- Payments or subscription infrastructure
- General-purpose game builder or non-quiz game modes
- Mobile-native application
- AI question generation in the initial release

## Edition boundaries

The web edition is a static demonstration using bundled sample data and browser-local state. It must not imply central persistence or a shared live presenter session. The desktop edition is the complete local application and supports presenter and audience-display windows on one computer.

## Accessibility

Target WCAG 2.2 AA. Support keyboard operation, logical focus, visible focus indicators, sufficient contrast, non-colour-only correctness cues, and reduced motion. Audience typography must remain readable at distance.

Features in this brief are planned requirements, not claims of existing implementation or compliance.
