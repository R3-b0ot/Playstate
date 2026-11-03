# Playstate — UI layout specification

**Status:** Layout proposal 0.1  
**Visual direction:** Approved dark cinematic × neon futuristic  
**Targets:** Browser showcase and Windows desktop application

## Mandatory brand integration

All UI work must use the approved identity assets and shared design tokens. Primary lockup: `assets/brand/playstate-wordmark-neon.svg`. Compact symbol: `assets/brand/playstate-mark.svg` or `assets/brand/playstate-mark-neon.svg`. Monochrome lockup: `assets/brand/playstate-wordmark.svg`. Favicon: `apps/web/public/favicon.svg`. Shared CSS tokens: `packages/ui/src/styles/tokens.css`. Do not redraw the logo or introduce competing marks or palettes.

## Product navigation

Keep the product focused on the quiz workflow. Primary navigation:

- Home
- Quizzes
- Results / History
- Settings

Do not add game-mode navigation in the first release. A live session should be launched from a selected quiz, not hidden behind unrelated product areas.

## 1. Home dashboard

### Desktop layout

- **Left rail:** approved Playstate symbol/wordmark, primary navigation, app version and connection/storage status.
- **Top bar:** Page title, current workspace/library context, primary Create Quiz action.
- **Main content:** Welcome/quick action area with Create Quiz, Open Quizzes and Start/Resume Session.
- **Recent area:** Recently edited quizzes and recent session summaries.
- **Empty state:** A clear first action to create or import a quiz; never show fabricated activity.

### Responsive behaviour

- Desktop: persistent navigation rail.
- Narrow screens: collapsible navigation; content becomes a single column.
- Keep primary action visible without requiring horizontal scrolling.

## 2. Quiz library

- Search and filter by title, tags and last modified.
- Quiz cards/list rows show title, question count, status and modified date.
- Actions: Open, Duplicate, Export and Delete (with confirmation).
- Import and export are explicit actions with validation feedback.
- No invented quiz ratings, popularity or online status.

## 3. Quiz editor / builder

Use a structured editor rather than a decorative card wall.

- **Header:** Quiz title, save state, question count, Preview and session launch.
- **Question navigator:** Ordered list of questions with clear selected state and reorder affordance.
- **Question workspace:** Prompt editor, answer options, correct-answer selection, optional explanation and media slot.
- **Inspector:** Question metadata and timer policy visibility.
- **Validation:** Missing prompt, duplicate IDs, missing options and missing correct answer must be surfaced before launch.

Timer policy defaults must be visible and accurate:
- Questions 1–4: 60 seconds.
- Questions 5–9: 120 seconds.
- Question 10 onwards: untimed.

## 4. Presenter console

The presenter console is an operational control surface, not the audience-facing show screen.

- **Header:** Quiz/session name, session lifecycle, current question position and connection/display status.
- **Main stage:** Current question and answer state preview.
- **Control zone:** Reveal options, start/pause timer when applicable, lock answer, reveal answer, next question and end session.
- **Progression rail:** Question ladder / progression, with current position clearly marked.
- **Status feedback:** Selected answer, locked/unanswered state, timer state and participant outcome.

Controls must be state-aware. Invalid actions should be disabled or explain why they are unavailable. Question 10 onwards must not display a countdown or timer controls. Host can still manually lock and reveal an untimed question.

## 5. Audience / projector display

A dedicated, read-only display designed for a second monitor or projector.

- Large question prompt and answer options.
- Strong visual hierarchy and generous spacing.
- Question number and progression context.
- Timer shown only for questions 1–9, using the confirmed durations.
- Clear locked, revealed, correct and incorrect states.
- No presenter-only controls, edit tools or navigation chrome.
- Keep contrast and text size suitable for viewing at a distance.

Audience display is a projection of presenter-owned state. It must not become a second source of game authority.

## 6. Results and session summary

- Final outcome and completed question count.
- Correct, incorrect and unanswered breakdown.
- Progression reached, only if an explicit progression/prize policy is configured.
- Session date and quiz title.
- Export/print only when implemented and tested.
- Do not imply guaranteed winnings or safe-harbour awards; those rules remain undecided.

## Shared component system

Build reusable components for:
- App shell, navigation rail and top bar.
- Buttons: primary, secondary, quiet, destructive.
- Inputs, text areas, selects and toggles.
- Question cards and answer option rows.
- Timer display (timed questions only).
- Status chips and inline validation.
- Modal/dialog and confirmation.
- Toast/notification and empty states.
- Progression ladder.
- Audience question and answer presentation.

## Interaction and accessibility

- Keyboard-operable controls with visible focus states.
- Semantic labels and logical focus order.
- WCAG 2.2 AA is the target; do not claim compliance until tested.
- Never communicate correctness, lock state or timer urgency by colour alone.
- Provide text labels/icons alongside status colour.
- Respect reduced motion.
- Ensure the audience display remains readable at common projector resolutions.

## Suggested implementation order

1. Define design tokens, typography and base components.
2. Build the app shell and dashboard.
3. Build quiz library and editor.
4. Build presenter console against the shared game core.
5. Build the audience display as a read-only projection.
6. Validate responsive layouts, keyboard navigation, contrast and projector readability.
