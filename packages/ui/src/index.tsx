import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }>;
export function Button({ variant = "secondary", className = "", children, ...props }: ButtonProps) {
  return <button className={`ps-button ps-button--${variant} ${className}`.trim()} {...props}>{children}</button>;
}
export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`ps-card ${className}`.trim()}>{children}</section>;
}
export function Status({ children, tone = "default" }: PropsWithChildren<{ tone?: "default" | "good" | "live" | "warning" | "danger" }>) {
  return <span className={`ps-status ${tone === "default" ? "" : `ps-status--${tone}`}`}>{children}</span>;
}
export function Field({ label, hint, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="ps-form-field"><span>{label}</span><input className={`ps-field ${className}`} {...props}/>{hint && <small>{hint}</small>}</label>;
}
export function TextAreaField({ label, hint, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return <label className="ps-form-field"><span>{label}</span><textarea className={`ps-field ps-textarea ${className}`} {...props}/>{hint && <small>{hint}</small>}</label>;
}
export function SelectField({ label, children, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="ps-form-field"><span>{label}</span><select className={`ps-field ps-select ${className}`} {...props}>{children}</select></label>;
}
export function QuizCard({ title, detail, status, onOpen }: { title: string; detail: string; status: string; onOpen: () => void }) {
  return <button className="ps-quiz-card" onClick={onOpen}><span className="ps-quiz-card__top"><span className="ps-quiz-card__glyph">Q</span><span className="ps-card-tag">{status}</span></span><strong>{title}</strong><small>{detail}</small><span className="ps-quiz-card__action">Open quiz <span aria-hidden="true">↗</span></span></button>;
}
export function QuestionCard({ number, selected = false, children, onClick }: PropsWithChildren<{ number: number; selected?: boolean; onClick: () => void }>) {
  return <button className={`ps-question-card ${selected ? "is-selected" : ""}`} onClick={onClick}><span className="ps-question-card__number">{String(number).padStart(2,"0")}</span><span>{children}</span></button>;
}
export function AnswerOption({ letter, text, selected = false, correct = false, disabled = false, onClick }: { letter: string; text: string; selected?: boolean; correct?: boolean; disabled?: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled} onClick={onClick} className={`ps-answer-option ${selected ? "is-selected" : ""} ${correct ? "is-correct" : ""}`}><span>{letter}</span><strong>{text || "Add answer text"}</strong>{correct && <em>Correct answer</em>}</button>;
}
export function Dialog({ title, description, children, onClose, footer }: PropsWithChildren<{ title: string; description?: string; onClose: () => void; footer?: ReactNode }>) {
  return <div className="ps-dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="ps-dialog" role="dialog" aria-modal="true" aria-labelledby="ps-dialog-title"><header><div><h2 id="ps-dialog-title">{title}</h2>{description && <p>{description}</p>}</div><button className="ps-icon-button" onClick={onClose} aria-label="Close dialog">×</button></header><div className="ps-dialog__body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}
export function Toast({ message, onDismiss, tone = "info" }: { message: string; onDismiss: () => void; tone?: "info" | "success" | "error" }) {
  return <div className={`ps-toast ps-toast--${tone}`} role="status" aria-live="polite"><span>{message}</span><button onClick={onDismiss} aria-label="Dismiss notification">×</button></div>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="ps-empty-state"><span className="ps-empty-state__icon">✳</span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
