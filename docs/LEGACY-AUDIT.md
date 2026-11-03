# KBE legacy audit — verified source findings

**Source:** https://github.com/R3-b0ot/KBE (branch: `master`)  
**Status:** Static review of primary PHP, JavaScript, CSS, HTML, and SQL completed. Runtime behaviour and visual asset inspection remain outstanding.

## Runtime and project structure

The original is a single-page PHP application with auxiliary PHP routes. Stack: PHP, MySQL, bundled MeekroDB, Apache/Bitnami WAMP, Bootstrap 3, jQuery, jQuery UI effects, and FlipClock.

- `index.php` loads root `header.html`, `includes/functions_list.php`, and `quiz.php`.
- `quiz.php` reads `nextque.nextid` and `nextque.queno`, then loads the matching question.
- `next_que.php` accepts a manually entered question ID and increments the question number.
- `add_quiz.php` and `process_quizAdd.php` create question records.
- `reset.php` sets the question number to zero.
- Root `header.html` initialises the timer; `includes/header.html` is used by the admin forms.

## Quiz screen behaviour

- Four fixed answer slots labelled A–D.
- Options start hidden on page load.
- `Show Option` toggles the options with a jQuery UI size effect.
- The same click handler starts the countdown, including when the click hides the options.
- Clicking an option marks it yellow and stores its letter.
- `Lock` stops the timer and evaluates the stored selection.
- Correct selection becomes green; incorrect selection becomes red and the correct option becomes green.
- Lock does not disable answer selection. Repeated clicks can change the selection after evaluation; repeated Lock clicks re-run visual evaluation.
- Pause and Resume call FlipClock stop/start. Lock also stops the clock.
- There is no dedicated Start Timer control.

## Timer rules

The countdown is not auto-started on page load:
- Question numbers 1–4: 60 seconds.
- Question numbers 5–9: 120 seconds.
- Question numbers 10 and above appear intended to use 150 seconds.

**Boundary defect:** the code tests `quel > 4 && quel < 10`, then `quel > 10`. Question 10 falls through to the default 60 seconds. Proposed Playstate behaviour is 150 seconds from question 10 onward, pending confirmation.

Timer expiry has no explicit lock, reveal, or progression behaviour in the inspected code.

## Prize / score ladder

The screen contains 13 rows, highest to lowest:

| Row / question number | Displayed score |
|---:|---:|
| 13 | 2000 |
| 12 | 1500 |
| 11 | 1200 |
| 10 | 800 |
| 9 | 600 |
| 8 | 300 |
| 7 | 200 |
| 6 | 150 |
| 5 | 100 |
| 4 | 80 |
| 3 | 40 |
| 2 | 20 |
| 1 | 10 |

The current row is highlighted from `queno`. The inspected source does not define safe-harbour levels, guaranteed winnings, score accumulation, or prize-award logic. Do not infer these from the ladder alone.

## Question authoring

The form collects a manually supplied question ID, question text, four answer texts, and correct-answer letter. Server validation checks non-empty values and answer-string length of at most one character, then uppercases the answer and inserts the record. It does not validate A/B/C/D, duplicate IDs, whitespace, or robustly handle database errors.

## Sequencing and reset

- Operator manually enters the next question ID.
- Route stores the ID and increments `queno`.
- It does not verify that the question ID exists before updating sequence state.
- Reset sets `queno=0` for key 1 but does not clear `nextid`.
- The code assumes one control row (key 1); the read query has no explicit filter/order.

## Database and seed data

Two tables:
- `question`: primary key `id` (varchar 10), prompt, four option text fields, answer letter.
- `nextque`: primary key `key`, `nextid`, and `queno`.

The SQL dump contains 31 records, AH01–AH31, and one next-question control row. Table defaults are latin1 while the DB wrapper configures utf8; validate encoding before migration.

**Data anomaly:** AH22 options A and D both say “Development of a new product”, while D is marked correct. Flag for editorial correction rather than blindly importing.

## Presenter and audience setup

README suggests TightVNC for a remote two-PC setup or an HDMI splitter for mirrored screens. The code does not implement a separate audience display, remote-control protocol, or multi-window synchronisation. It renders one browser page intended to be mirrored or remotely viewed using external tools.

## UI assets

- `images/kbc.jpg`: page background.
- `images/bq.png`: question panel.
- `images/ow.png`: default answer state.
- `images/oy.png`: selected answer.
- `images/or.png`: incorrect answer.
- `images/og.png`: correct answer.
- `images/iconkbh.png`: icon.
- `css/theme.css`: custom styling, with fixed dimensions and layout assumptions.

Bootstrap and FlipClock assets are bundled. These assets are reference material, not a responsive design baseline.

## Defects and risks

1. Lock does not lock the answer controls.
2. Previously selected option styling is not cleared.
3. Show/hide is coupled to timer start.
4. Question 10 gets 60 seconds due to a boundary condition.
5. Timer expiry has no visible lock or progression behaviour.
6. Invalid/non-existent question IDs can be stored.
7. Reset leaves the next question ID in place.
8. Authoring validation is weak; duplicate IDs are not handled gracefully.
9. Question values are interpolated into JavaScript string literals without safe JSON encoding.
10. No actual separate audience display or multi-window synchronisation exists.
11. A database credential is embedded in the legacy DB wrapper. Do not migrate it; rotate it if it was ever used against a real database.
12. Legacy DB wrapper and vendor assets are not part of Playstate's runtime architecture.

## Playstate requirements derived from the audit

- Model quiz content independently of legacy question IDs.
- Define an explicit ordered session and validate every question reference.
- Separate option visibility, timer lifecycle, answer selection, answer lock, and answer reveal.
- Make locking irreversible for the question unless host explicitly resets/reopens it.
- Define timer policy, question 10 boundary, and expiry behaviour.
- Model progression values as configuration, not DOM row IDs.
- Add explicit session start, end, reset, and recovery semantics.
- Implement presenter and audience display as coordinated local windows.
- Validate, normalise, and version imported question banks.
