# Game engine specification — draft 0.1

**Status:** Draft derived from static review of KBE source. Proposed contract, not implemented behaviour. Confirm timer boundary and scoring policy before final approval.

## Domain model

A Quiz is a named, versioned collection of ordered questions and optional progression configuration.

A Question has a stable ID, prompt, two or more answer options (initial legacy migration supports A–D), correct option ID, and optional explanation, category, difficulty, media, and timer override.

A Quiz Session is a runtime instance created from a quiz snapshot. It stores session ID and lifecycle status, quiz snapshot/version, ordered question IDs, current index, current question state, timer configuration and remaining time, progression configuration/current milestone, and timestamps.

## Question states

- `hidden`: question loaded; choices are not shown.
- `options-visible`: choices are visible; answer may be selected.
- `answer-locked`: selection is frozen; no further changes accepted.
- `answer-revealed`: correct answer and outcome are visible.
- `completed`: host has moved beyond the question.

Visibility and timer status are separate state dimensions and must not be coupled to one UI click.

## Session lifecycle

`draft → ready → running → completed`

A running session may be paused and resumed. A host may end a running session early. Reset creates a clean session or explicitly resets the current one after confirmation; it must not leave a stale question pointer.

## Commands and transitions

| Command | Preconditions | Result |
|---|---|---|
| Start session | Session is ready | First question becomes current; timer is prepared |
| Reveal options | Current question is hidden | Options become visible |
| Start timer | Timer is idle or paused | Countdown runs |
| Pause timer | Timer is running | Countdown pauses with remaining time preserved |
| Resume timer | Timer is paused | Countdown resumes |
| Select answer | Options visible; answer not locked | Selected option changes |
| Lock answer | Options visible; answer not locked | Selection freezes; timer stops |
| Reveal answer | Answer is locked | Correct option and outcome are revealed |
| Next question | Current question is revealed/completed | Move forward and initialise next question |
| End session | Session is running or paused | Session is ended |
| Reset session | Host confirms | New clean session; selection and timer state cleared |

Invalid transitions return typed errors. The UI must reflect the commands currently available.

## Timer policy

Legacy source defaults:
- Question numbers 1–4: 60 seconds.
- 5–9: 120 seconds.
- 10+: likely intended 150 seconds, but legacy code accidentally assigns 60 seconds to question 10.

Proposed corrected default is 60 seconds for 1–4, 120 seconds for 5–9, and 150 seconds for 10+, pending owner confirmation. A question-level override takes precedence.

Timer expiry must be explicit. Recommended behaviour: emit an expiry event and lock the current answer state; if no answer is selected, lock as unanswered. Do not automatically reveal correctness or advance without presenter action.

Timer ticking uses an injectable clock/time source so tests are deterministic. UI intervals are not the source of truth.

## Progression policy

Legacy display ladder (question number → score):
1→10, 2→20, 3→40, 4→80, 5→100, 6→150, 7→200, 8→300, 9→600, 10→800, 11→1200, 12→1500, 13→2000.

This is a display ladder only. Safe-harbour levels, fallback winnings, score award timing, and wrong-answer consequences are not established by the inspected source. Keep these configurable; do not infer rules from the television format.

## Events and persistence

The core is pure and framework-independent. Commands return a new state plus domain events. Persistence and UI are adapters.

Potential events: SessionStarted, QuestionChanged, OptionsRevealed, TimerStarted, TimerPaused, TimerResumed, TimerExpired, AnswerSelected, AnswerLocked, AnswerRevealed, SessionEnded, SessionReset.

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
- Completed sessions reject question and answer commands.
- Progression values are ordered and explicitly configured.

## Testing

Use table-driven tests for every command, valid/invalid transition, timer boundary, progression boundary, missing answer, and end-of-quiz case. Use a fake clock for timer tests. Test presenter/display projection separately from the engine.
