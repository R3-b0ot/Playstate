# Architecture decision record

Status: Accepted as the initial implementation direction; validate during the first vertical slice.

## Goals

- One source of truth for quiz rules.
- Browser showcase deployable as static files to GitHub Pages.
- Full desktop app usable offline.
- Local presenter and audience-display windows.
- No PHP, Apache, MySQL server, hosted backend, or mandatory network services.

## System shape

`packages/game-core` is shared by `apps/web` and `apps/desktop`. The web app uses bundled demo data and browser-local state. The desktop app uses Tauri commands, SQLite, and local inter-window messaging.

## Workspace

Use pnpm workspaces and TypeScript. Planned packages:

- `@playstate/game-core`: domain logic, valid state transitions, progression rules, and timer semantics.
- `@playstate/data-models`: shared types and Zod schemas for quiz content, settings, and persistence boundaries.
- `@playstate/ui`: reusable React presentation components where the editions have compatible needs.
- `apps/web`: static showcase.
- `apps/desktop`: Tauri shell and local integrations.

## State ownership

The game core defines valid game transitions. UI state (dialogs, navigation, layout preferences) is separate from domain state. In desktop mode, the presenter owns the active session. The audience display is a read-only projection receiving snapshots/events through a local Tauri message bridge. Avoid two competing writable game states.

## Persistence

- Desktop: SQLite accessed through typed Tauri commands; migrations live in `database/migrations`.
- Web: bundled demo content and browser-local transient state. IndexedDB may be used for optional local preferences; no server persistence is implied.
- Validate imported JSON with Zod before storage or execution.

## Security and reliability

Keep database access behind typed Tauri commands. Validate imported data and command inputs. Avoid arbitrary filesystem access from the webview. Never embed credentials or secrets in frontend code. Handle interrupted sessions and app restarts predictably. Desktop core workflows must not depend on internet access.

## Build and test

Vitest for domain rules and validation; Playwright for web showcase flows; Tauri build checks for packaging and multi-window behaviour. Windows is the first desktop target. Confirm WebView2 availability and provide clear prerequisite instructions.

## Deployment

The web showcase is a static Vite build deployed to GitHub Pages. Configure Vite's base path for the repository URL. The desktop edition is built and distributed separately with Tauri bundling.

## Decisions to revisit

- Exact Tauri inter-window state transport.
- SQLite access approach and migration runner.
- Shared React app with window modes vs separate entry points.
- Import/export file format and versioning.
- Local media asset management.
