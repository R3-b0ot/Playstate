export type AnswerOption = { id: string; label: string; text: string };
export type QuizQuestion = { id: string; prompt: string; options: AnswerOption[]; correctOptionId: string; explanation?: string };
export type QuizDefinition = { id: string; title: string; questions: QuizQuestion[] };
export type QuestionPhase = "hidden" | "options-visible" | "answer-locked" | "answer-revealed";
export type ParticipantOutcome = "in-progress" | "won" | "lost" | "timed-out" | "ended-by-host";
export type TimerState = { status: "idle" | "running" | "paused" | "expired" | "disabled"; durationMs: number | null; remainingMs: number | null; startedAt: number | null };
export type SessionState = { quiz: QuizDefinition; status: "ready" | "running" | "completed"; outcome: ParticipantOutcome; questionIndex: number; phase: QuestionPhase; selectedOptionId: string | null; timer: TimerState; revealedCorrectOptionId: string | null };
export type EngineEvent = { type: string; at: number; detail?: string };
export type EngineResult = { state: SessionState; events: EngineEvent[] };
export type EngineErrorCode = "INVALID_QUIZ" | "INVALID_STATE" | "INVALID_ANSWER" | "TIMER_DISABLED" | "TIMER_NOT_RUNNING" | "SESSION_ENDED" | "NO_NEXT_QUESTION";
export class EngineError extends Error { constructor(public code: EngineErrorCode, message: string) { super(message); this.name = "EngineError"; } }

export function timerDurationForQuestion(position: number): number | null {
  if (!Number.isInteger(position) || position < 1) throw new RangeError("Question position must be a positive integer.");
  if (position <= 4) return 60_000;
  if (position <= 9) return 120_000;
  return null;
}
export function validateQuiz(quiz: QuizDefinition): string[] {
  const errors: string[] = [];
  if (!quiz.title.trim()) errors.push("Quiz title is required.");
  if (!quiz.questions.length) errors.push("Add at least one question.");
  const ids = new Set<string>();
  for (const [index, q] of quiz.questions.entries()) {
    if (!q.id || ids.has(q.id)) errors.push(`Question ${index + 1} has a missing or duplicate ID.`);
    ids.add(q.id);
    if (!q.prompt.trim()) errors.push(`Question ${index + 1} needs a prompt.`);
    if (q.options.length < 2) errors.push(`Question ${index + 1} needs at least two options.`);
    const optionIds = new Set(q.options.map(o => o.id));
    if (!optionIds.has(q.correctOptionId)) errors.push(`Question ${index + 1} needs a valid correct answer.`);
    if (new Set(q.options.map(o => o.id)).size !== q.options.length) errors.push(`Question ${index + 1} has duplicate option IDs.`);
  }
  return errors;
}
function currentQuestion(state: SessionState): QuizQuestion {
  const question = state.quiz.questions[state.questionIndex];
  if (!question) throw new EngineError("NO_NEXT_QUESTION", "There is no active question.");
  return question;
}
function active(state: SessionState) {
  if (state.status !== "running" || state.outcome !== "in-progress") throw new EngineError("SESSION_ENDED", "This session is no longer accepting commands.");
}
function result(state: SessionState, type: string, now: number, detail?: string): EngineResult {
  return { state, events: [{ type, at: now, ...(detail ? { detail } : {}) }] };
}
export function createSession(quiz: QuizDefinition, now = Date.now()): EngineResult {
  const errors = validateQuiz(quiz);
  if (errors.length) throw new EngineError("INVALID_QUIZ", errors.join(" "));
  const duration = timerDurationForQuestion(1);
  return { state: { quiz: structuredClone(quiz), status: "ready", outcome: "in-progress", questionIndex: 0, phase: "hidden", selectedOptionId: null, timer: { status: duration === null ? "disabled" : "idle", durationMs: duration, remainingMs: duration, startedAt: null }, revealedCorrectOptionId: null }, events: [{ type: "SessionPrepared", at: now }] };
}
export function startSession(state: SessionState, now = Date.now()): EngineResult {
  if (state.status !== "ready") throw new EngineError("INVALID_STATE", "Only a ready session can start.");
  return result({ ...state, status: "running" }, "SessionStarted", now);
}
export function revealOptions(state: SessionState, now = Date.now()): EngineResult {
  active(state); if (state.phase !== "hidden") throw new EngineError("INVALID_STATE", "Options can only be revealed once per question.");
  return result({ ...state, phase: "options-visible" }, "OptionsRevealed", now);
}
export function startTimer(state: SessionState, now = Date.now()): EngineResult {
  active(state); if (state.timer.status === "disabled") throw new EngineError("TIMER_DISABLED", "This question is untimed.");
  if (state.phase !== "options-visible" || !["idle", "paused"].includes(state.timer.status) || state.timer.remainingMs === null) throw new EngineError("INVALID_STATE", "Timer cannot be started in this state.");
  return result({ ...state, timer: { ...state.timer, status: "running", startedAt: now } }, "TimerStarted", now);
}
export function selectAnswer(state: SessionState, optionId: string, now = Date.now()): EngineResult {
  active(state); if (state.phase !== "options-visible") throw new EngineError("INVALID_STATE", "Answers can only be selected while options are visible.");
  if (!currentQuestion(state).options.some(o => o.id === optionId)) throw new EngineError("INVALID_ANSWER", "That answer does not belong to the current question.");
  return result({ ...state, selectedOptionId: optionId }, "AnswerSelected", now, optionId);
}
export function lockAnswer(state: SessionState, now = Date.now()): EngineResult {
  active(state); if (state.phase !== "options-visible") throw new EngineError("INVALID_STATE", "Only a visible answer can be locked.");
  if (state.timer.status === "running") throw new EngineError("INVALID_STATE", "Pause or expire the timer before manually locking.");
  return result({ ...state, phase: "answer-locked", timer: { ...state.timer, status: state.timer.status === "disabled" ? "disabled" : state.timer.status } }, "AnswerLocked", now, state.selectedOptionId ?? "unanswered");
}
export function expireTimer(state: SessionState, now = Date.now()): EngineResult {
  active(state); if (state.timer.status !== "running" || state.timer.durationMs === null) throw new EngineError("TIMER_NOT_RUNNING", "No timed countdown is running.");
  return result({ ...state, phase: "answer-locked", timer: { ...state.timer, status: "expired", remainingMs: 0, startedAt: null }, outcome: state.selectedOptionId ? state.outcome : "timed-out" }, "TimerExpired", now, state.selectedOptionId ?? "unanswered");
}
export function revealAnswer(state: SessionState, now = Date.now()): EngineResult {
  active(state); if (state.phase !== "answer-locked") throw new EngineError("INVALID_STATE", "Lock the answer before revealing it.");
  const question = currentQuestion(state);
  const correct = state.selectedOptionId === question.correctOptionId;
  const unanswered = state.selectedOptionId === null;
  const outcome = correct ? state.outcome : unanswered ? "timed-out" : "lost";
  return result({ ...state, phase: "answer-revealed", revealedCorrectOptionId: question.correctOptionId, outcome, status: correct ? "running" : "completed" }, "AnswerRevealed", now, correct ? "correct" : unanswered ? "unanswered" : "incorrect");
}
export function nextQuestion(state: SessionState, now = Date.now()): EngineResult {
  if (state.status !== "running" || state.outcome !== "in-progress" || state.phase !== "answer-revealed") throw new EngineError("INVALID_STATE", "A revealed correct answer is required to continue.");
  const nextIndex = state.questionIndex + 1;
  if (nextIndex >= state.quiz.questions.length) return result({ ...state, status: "completed", outcome: "won" }, "SessionCompleted", now);
  const duration = timerDurationForQuestion(nextIndex + 1);
  return result({ ...state, questionIndex: nextIndex, phase: "hidden", selectedOptionId: null, revealedCorrectOptionId: null, timer: { status: duration === null ? "disabled" : "idle", durationMs: duration, remainingMs: duration, startedAt: null } }, "QuestionChanged", now);
}
export function endSession(state: SessionState, now = Date.now()): EngineResult {
  active(state);
  return result({ ...state, status: "completed", outcome: "ended-by-host" }, "SessionEnded", now);
}
