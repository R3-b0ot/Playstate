import { validateQuiz, type QuizDefinition } from "./index";

export const PLAYSTATE_QUIZ_FORMAT = "playstate.quiz" as const;
export const PLAYSTATE_QUIZ_FILE_VERSION = 1 as const;
export const PLAYSTATE_QUIZ_FILE_EXTENSION = ".playstate";
export const PLAYSTATE_QUIZ_MAX_BYTES = 5 * 1024 * 1024;

export type PlaystateQuizFile = {
  format: typeof PLAYSTATE_QUIZ_FORMAT;
  formatVersion: typeof PLAYSTATE_QUIZ_FILE_VERSION;
  exportedAt: string;
  quiz: QuizDefinition;
};

export class QuizFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizFileError";
  }
}

export function createQuizFile(quiz: QuizDefinition, exportedAt = new Date()): PlaystateQuizFile {
  const errors = validateQuiz(quiz);
  if (errors.length) throw new QuizFileError(errors.join(" "));
  return {
    format: PLAYSTATE_QUIZ_FORMAT,
    formatVersion: PLAYSTATE_QUIZ_FILE_VERSION,
    exportedAt: exportedAt.toISOString(),
    quiz: structuredClone(quiz),
  };
}

export function serializeQuizFile(quiz: QuizDefinition): string {
  return JSON.stringify(createQuizFile(quiz), null, 2);
}

export function parseQuizFile(source: string): QuizDefinition {
  if (new TextEncoder().encode(source).byteLength > PLAYSTATE_QUIZ_MAX_BYTES) {
    throw new QuizFileError("This quiz file is larger than the 5 MB import limit.");
  }

  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new QuizFileError("This file is not valid Playstate quiz data.");
  }

  if (!value || typeof value !== "object") {
    throw new QuizFileError("The selected file does not contain a Playstate quiz.");
  }
  const file = value as Partial<PlaystateQuizFile>;
  if (file.format !== PLAYSTATE_QUIZ_FORMAT) {
    throw new QuizFileError("This is not a .playstate quiz file.");
  }
  if (file.formatVersion !== PLAYSTATE_QUIZ_FILE_VERSION) {
    throw new QuizFileError(`Unsupported Playstate file version: ${String(file.formatVersion)}.`);
  }
  if (!file.quiz || typeof file.quiz !== "object") {
    throw new QuizFileError("The quiz data is missing.");
  }

  const quiz = file.quiz as QuizDefinition;
  if (typeof quiz.id !== "string" || typeof quiz.title !== "string" || !Array.isArray(quiz.questions)) {
    throw new QuizFileError("The quiz file is missing required quiz fields.");
  }
  const errors = validateQuiz(quiz);
  if (errors.length) throw new QuizFileError(`The quiz file failed validation: ${errors.join(" ")}`);

  // Import is deliberately a copy operation: give the imported quiz its own identity.
  return { ...structuredClone(quiz), id: createIndependentQuizId() };
}

function createIndependentQuizId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function quizFileName(title: string): string {
  const safe = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
  return `${safe || "playstate-quiz"}${PLAYSTATE_QUIZ_FILE_EXTENSION}`;
}
