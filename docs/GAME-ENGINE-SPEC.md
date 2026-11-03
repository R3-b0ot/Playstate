# Game engine specification — draft 0.2

**Status:** Gameplay rules confirmed by product owner. Architecture and transition contract are specified; implementation and runtime tests are still pending.

## Confirmed gameplay rules

1. Timer durations are based on the question's position in the active session:
   - Questions 1–4: 60 seconds each.
   - Questions 5–9: 120 seconds each.
   - Question 10 onwards: 60 seconds each.
2. When the timer expires, the engine automatically locks the current answer state. If no answer was selected, it records the question as unanswered. The host must explicitly reveal the result.
3. An incorrect answer ends the participant's run. No subsequent question may be played in that session.

These are deliberate Playstate rules. The 60-second duration from question 10 onwards is the confirmed product choice, even though the legacy source appears to have intended 150 seconds for questions after question 10.

## Domain model

A Quiz is a named, versioned collection of ordered questions and optional progression configuration.

A Question has a stable ID, prompt, two or more answer options (legacy migration initially supports A–D), correct option ID, and optional explanation, category, difficulty, media, and timer override.

A Quiz Session is a runtime instance created from a quiz snapshot. It stores session ID and lifecycle status, quiz snapshot/version, ordered question IDs, current index, current question state, timer configuration and remaining time, progression configuration/current milestone, participant outcome, and timestamps.

A question-level timer override may be supported for custom quiz formats. Unless a quiz explicitly enables overrides, the confirmed session-position defaults above apply.

## Question states

- `hidden`: question loaded; choices are not shown.
- `options-visible`: choices are visible; answer may be selected.
- `answer-locked`: selection is frozen; no further changes accepted.
- `answer-revealed`: correct answer and outcome are visible.
- `completed`: host has moved beyond the question.

Visibility and timer status are separate state dimensions and must not be coupled to one UI click.

## Session lifecycle and participant outcome

Session lifecycle: `draft → ready → running → completed`.

A running session may be paused and resumed. A host may end a running session early. Reset creates a clean session or explicitly resets the current one after confirmation; it must not leave a stale question pointer.

Participant outcome is tracked separately from session lifecycle:
- `in-progress`
- `won` (all configured questions completed successfully)
- `lost` (an incorrect answer ends the run)
- `ended-by-host`
- `timed-out` (optional display classification for an unanswered expiry; the session is treated as unsuccessful)

A wrong answer sets the participant outcome to `lost` and ends the run immediately after the host reveals the answer. The engine must not permit Next Question after a loss. Timer expiry with no selection locks the question as unanswered; after the host reveals the result, it is treated as an unsuccessful answer and the run ends. If a selected answer is locked by expiry, the host reveals whether it was correct; an incorrect selection ends the run, while a correct selection may continue.

## Commands and transitions

| Command | Preconditions | Result |
|---|---|---|
| Start session | Session is ready | First question becomes current; timer is prepared |
| Reveal options | Current question is hidden | Options become visible |
| Start timer | Timer is idle or paused; question accepts answers | Countdown runs |
| Pause timer | Timer is running | Countdown pauses with remaining time preserved |
| Resume timer | Timer is paused | Countdown resumes |
| Select answer | Options visible; answer not locked | Selected option changes |
| Lock answer | Options visible; answer not locked | Selection freezes; timer stops |
| Timer expires | Timer is running and reaches zero | Engine locks selection or records unanswered; emits expiry and lock events |
| Reveal answer | Answer is locked | Correct option and outcome are revealed; incorrect/unanswered outcome ends the run |
| Next question | Current answer is revealed and participant remains in progress | Move forward and initialise next question |
| End session | Session is running or paused | Session is ended by host |
| Reset session | Host confirms | New clean session; selection and timer state cleared |

Invalid transitions return typed errors. The UI must reflect the commands currently available. Locking is irreversible for that question; there is no post-lock answer change. A host reset starts a clean session rather than silently unlocking an answer in the same run.

## Timer policy and expiry

The confirmed default schedule is 60 seconds for questions 1–4, 120 seconds for questions 5–9, and 60 seconds for question 10 onwards.

Timer expiry is an engine transition, not merely a visual countdown reaching zero:
- Freeze the timer at zero.
- Lock the current selection.
- If no selection exists, store an explicit unanswered state.
- Emit `TimerExpired` and `AnswerLocked` domain events.
- Do not reveal the correct answer automatically.
- Wait for the host to reveal the answer.
- After reveal, an incorrect or unanswered result ends the participant's run; a correct selected answer can proceed.

Timer ticking uses an injectable clock/time source so tests are deterministic. UI intervals are not the source of truth. Pausing and resuming preserve remaining time.

## Progression policy

Legacy display ladder (question number → score):
1→10, 2→20, 3→40, 4→80, 5→100, 6→150, 7→200, 8→300, 9→600, 10→800, 11→1200, 12→1500, 13→2000.

This is a display ladder only. Safe-harbour levels, fallback winnings, and score award timing are not established by the inspected source. Keep these configurable; do not infer rules from the television format. An incorrect answer ends the run, but any retained prize/score amount must follow an explicitly configured progression policy rather than an assumed safe-harbour rule.

## Events and persistence

The core is pure and framework-independent. Commands return a new state plus domain events. Persistence and UI are adapters.

Potential events: SessionStarted, QuestionChanged, OptionsRevealed, TimerStarted, TimerPaused, TimerResumed, TimerExpired, AnswerSelected, AnswerLocked, AnswerRevealed, ParticipantLost, SessionEnded, SessionReset.

Persist enough state to recover an interrupted desktop session safely. Event history supports presenter feedback and diagnostics; it is not analytics and is not transmitted over a network.

## Invariants

- Question IDs are unique within a quiz.
- Every question has at least two options.
- Correct option ID exists in that question.
- Session order references only questions in its quiz snapshot.
- Current index is in bounds while a question is active.
- Locked answers cannot change.
- Revealed answers must already be locked.
- Remaining timer duration cannot be negative.
- A lost, won, or host-ended participant run cannot accept another question.
- An unanswered timer expiry is distinct from a selected answer.
- Progression values are ordered and explicitly configured.

## Testing

Use table-driven tests for every command, valid/invalid transition, timer boundaries (questions 4/5, 9/10, and 10/11), expiry with and without a selected answer, correct/incorrect/unanswered reveal outcomes, loss preventing further progression, missing answer, and end-of-quiz. Use a fake clock for timer tests. Test presenter/display projection separately from the engine.
