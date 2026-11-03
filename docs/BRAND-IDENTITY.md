# Playstate — brand identity direction

**Status:** Approved  
**Product:** Offline-first live quiz platform  
**Brand direction:** Dark cinematic × neon futuristic  
**Logo system:** Symbol + wordmark

## Brand positioning

Playstate is a focused quiz platform for building, hosting and presenting live quiz sessions. It should feel exciting enough for a game-show moment and dependable enough for professional use at schools, offices, events and competitions.

**Working tagline:** Knowledge. Competition. Game on.

**Brand promise:** Create the quiz. Run the show. Own the moment.

### Personality

- Confident, energetic and focused.
- Dramatic at moments of competition; calm and legible during setup.
- Modern and technical without looking like a hacker tool.
- Inclusive and professional; not childish, casino-like or esports-exclusive.

## Visual system

### Core palette

| Token | Hex | Role |
|---|---|---|
| Void | `#080B16` | Main application background |
| Panel | `#111827` | Cards, navigation and raised surfaces |
| Panel raised | `#182235` | Active surfaces and overlays |
| Electric cyan | `#5CE3FC` | Primary interactive accent, focus and active states |
| Signal lime | `#B9FC51` | Correct answer, success and key action accent |
| Pulse magenta | `#EE48BB` | Secondary accent, highlights and show moments |
| White | `#F4F7FB` | Primary text |
| Muted | `#98A4B8` | Secondary text and metadata |
| Border | `#29364B` | Dividers and quiet outlines |

Use cyan as the default interaction colour. Lime should communicate success/correctness rather than decorate every surface. Magenta is a controlled secondary accent. Never rely on colour alone to communicate answer correctness or status.

### Typography

- **Display/headings:** Sora, semibold/bold. Geometric and contemporary, but readable at large sizes.
- **Body/UI:** Inter, regular/medium. High legibility for question text, controls and dense setup screens.
- **Numeric emphasis:** Use tabular numerals for timers, question numbers and scores.
- Avoid using a futuristic display face for paragraphs or small controls. Keep typography functional first.

### Approved logo assets

The logo artwork in the repository is approved for use. These files are canonical; use them directly rather than redrawing or inventing alternatives:

- `assets/brand/playstate-mark.svg` — monochrome symbol.
- `assets/brand/playstate-mark-neon.svg` — neon symbol.
- `assets/brand/playstate-wordmark.svg` — monochrome wordmark lockup.
- `assets/brand/playstate-wordmark-neon.svg` — primary neon wordmark lockup.
- `apps/web/public/favicon.svg` — browser favicon.

Use the symbol alone where space is constrained. Use the wordmark lockup for primary product branding. Do not distort, crop or create competing marks.

## Logo system

Create a custom geometric symbol that fuses a forward/play direction with a subtle P construction. It should remain recognisable in a 24 px navigation slot and as a monochrome app icon.

The symbol must be:
- Original vector geometry, not a stock play-button glyph.
- Balanced in a square footprint with intentional negative space.
- Legible in one colour before any neon treatment is applied.
- Reproducible as full-colour, white, dark and single-colour variants.
- Independent of gradients, glow and 3D effects.

The primary lockup is symbol + uppercase PLAYSTATE wordmark. Keep the wordmark clean and avoid modifying individual letters in ways that compromise readability. The app icon uses the symbol alone.

### Motion and effects

- Use short, purposeful transitions for panel changes, question reveal and answer lock.
- Reserve glow for active focus, countdown urgency and reveal moments.
- Avoid constant pulsing, animated backgrounds and heavy glass effects.
- Respect reduced-motion preferences.
- Never use animation as the only indication that a timer has expired or an answer is locked.

## Brand applications

1. Application shell: compact symbol, wordmark, restrained neon active state.
2. Quiz creation: functional, low-distraction workspace.
3. Presenter console: high-contrast operational controls and clear session state.
4. Audience display: cinematic question and answer presentation, with large readable type.
5. App icon: standalone symbol, tested at small sizes and on light/dark backgrounds.

## Design guardrails

- The product is quiz-only in its first release.
- No fake online multiplayer, cloud sync or account features in product messaging.
- The browser showcase and native desktop application share the same visual system.
- Neon is an accent system, not a substitute for hierarchy or contrast.
- Use the approved SVG files and shared CSS tokens as the single source of truth for all new product UI and documentation.
- Check font licences and trademark/domain availability before public launch.
