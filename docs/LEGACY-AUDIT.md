# KBE legacy feature audit

Status: Initial inventory — verification in progress.

Source: https://github.com/R3-b0ot/KBE  
Original identity: KBE — Kaun Banega Entrepreneur  
Observed stack: PHP, MySQL, MeekroDB, Apache/Bitnami WAMP, Bootstrap 3, jQuery, jQuery UI, and FlipClock. A SQL dump and sample question bank are present.

## Known from existing project notes and inspected source

- Quiz question display with four answer options (A–D).
- Question navigation, including a manual question-ID workflow.
- Controls to reveal/hide answer options.
- Answer selection and visual correctness feedback.
- Reset action that resets the stored next-question counter.
- Add-question workflow with choices and correct-answer selection.
- Next-question workflow.
- Question/prize ladder with current prize highlighting.
- Timer controls: start, stop, pause, and resume.
- README describes 60-second early questions, 120-second middle questions, and 150-second later questions.
- Presenter/audience arrangement described using TightVNC and HDMI splitting.
- SQL seed data reportedly contains 31 questions.
- README notes describe 13 prize levels.

## Source files identified for deeper review

`index.php`, `quiz.php`, `add_quiz.php`, `next_que.php`, `process_quizAdd.php`, `reset.php`, `includes/db.php`, `includes/header.html`, `includes/footer.html`, `js/screen.js`, `kbh.sql`, and `functions_list.php` (confirm exact path and contents).

## Audit questions

- Verify every control, route, form field, and AJAX request.
- Confirm exact prize ladder values, safe-harbour levels, scoring, and elimination rules.
- Confirm timer behaviour on question changes, pauses, and answer lock.
- Determine whether audience display is a separate page/window or a mirrored presenter screen.
- Inspect all CSS, JavaScript, image, audio, and font assets.
- Identify data constraints, question ordering, IDs, and reset semantics from SQL.
- Identify edge cases: missing question, invalid answer, repeated click, refresh, and concurrent windows.
- Distinguish implemented features from README claims and event-setup instructions.

## Migration policy

1. Preserve the original repository untouched.
2. Complete source and asset inventory before porting.
3. Map each verified feature to a Playstate requirement.
4. Recreate intended behaviour in the shared TypeScript game core.
5. Do not carry over PHP/MySQL runtime dependencies.
6. Do not copy secrets from the old source. Any historical database credential that was real should be considered exposed and rotated.

## Initial mapping

| Area | Legacy evidence | Verification | Playstate action |
|---|---|---|---|
| Four choices | Quiz screen / SQL | Observed; details pending | Preserve; consider configurable count |
| Navigation | Next-question flow | Edge cases pending | Deterministic session navigation |
| Reveal/hide | Screen JavaScript | Observed | Presenter control |
| Answer lock/reveal | JavaScript and README notes | Full route verification pending | Formal state transitions |
| Prize ladder | README and quiz UI | Values/rules pending | Configurable progression |
| Timer | README and FlipClock | Exact semantics pending | Engine-owned timer model |
| Authoring | Add-question flow | Validation/persistence pending | Local CRUD |
| Presenter/display | Event setup notes | Architecture details pending | Native multi-window mode |
| Reset/new participant | Reset endpoint | Semantics pending | Safe session lifecycle |
| Sample bank | SQL dump | 31 rows reported | Validate and migrate content |
