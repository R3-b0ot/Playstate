import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }>;

export function Button({ variant = "secondary", className = "", children, ...props }: ButtonProps) {
  return <button className={`ps-button ps-button--${variant} ${className}`.trim()} {...props}>{children}</button>;
}

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`ps-card ${className}`.trim()}>{children}</section>;
}

export function Status({ children, tone = "default" }: PropsWithChildren<{ tone?: "default" | "good" | "live" }>) {
  return <span className={`ps-status ${tone === "default" ? "" : `ps-status--${tone}`}`}>{children}</span>;
}
