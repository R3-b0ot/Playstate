# Development roadmap

Milestones are gated by verification. A feature is complete only when acceptance criteria are met and recorded.

## Phase 0 — Repository foundation

- [x] Create Playstate repository.
- [x] Establish product brief and architecture direction.
- [x] Record initial legacy feature inventory.
- [x] Add workspace manifests and TypeScript configuration.
- [ ] Add CI checks and contribution conventions.

## Phase 1 — Legacy audit and specification

- [x] Inventory legacy source files and primary assets.
- [x] Review primary PHP, JavaScript, CSS, HTML, and SQL source.
- [x] Record verified behaviour, known defects, and migration requirements.
- [x] Draft shared game-engine specification.
- [ ] Inspect original visual assets and verify layout on a running copy.
- [ ] Extract and validate the question bank for migration.
- [ ] Confirm timer boundary and expiry behaviour.
- [ ] Confirm scoring, safe-harbour, and wrong-answer rules (if any).
- [ ] Approve presenter and audience-display workflow.
- [ ] Approve game-state model and event lifecycle.

Exit: traceable feature matrix and approved game-engine specification.

## Phase 2 — Shared game core

- [ ] Define versioned domain types and schemas.
- [ ] Implement quiz/question validation.
- [ ] Implement session lifecycle and navigation.
- [ ] Implement answer selection, locking, and reveal transitions.
- [ ] Implement progression and timer semantics.
- [ ] Add comprehensive unit tests.

Exit: core rules tested without React, Tauri, or a database.

## Phase 3 — Web showcase

- [ ] Build visual system and responsive interface.
- [ ] Add curated sample quiz.
- [ ] Deliver complete sample playthrough.
- [ ] Configure GitHub Pages deployment.
- [ ] Add keyboard and accessibility testing.

Exit: visitor can play a sample quiz without sign-in or installation.

## Phase 4 — Desktop application

- [ ] Scaffold Tauri 2 desktop shell.
- [ ] Add local SQLite persistence and migrations.
- [ ] Implement quiz authoring and library management.
- [ ] Implement presenter console and audience display window.
- [ ] Validate offline operation and session recovery.
- [ ] Package Windows installer and document WebView2 prerequisites.

Exit: host can prepare and run a complete quiz offline on one Windows computer with a separate audience display.

## Phase 5 — Hardening and release

- [ ] Test import, export, backup, and restore.
- [ ] Test interrupted sessions and destructive-action recovery.
- [ ] Run accessibility review against WCAG 2.2 AA.
- [ ] Test on clean Windows environments.
- [ ] Prepare release notes and user documentation.

Working rule: a screen existing is not proof a feature works end-to-end.
