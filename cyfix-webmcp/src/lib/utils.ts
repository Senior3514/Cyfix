import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HOSTNAME_RE =
  /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

/**
 * Strips protocol/path/query/port from user input and validates it looks
 * like a bare hostname. Returns null for anything that isn't a plausible
 * domain (including localhost/IP literals, to keep the scanner pointed at
 * public authorized domains rather than internal infrastructure).
 */
export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  if (!value) return null;

  value = value.replace(/^[a-z]+:\/\//, "");
  value = value.split("/")[0];
  value = value.split("?")[0];
  value = value.split(":")[0];

  if (!HOSTNAME_RE.test(value)) return null;
  if (value === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return null;

  return value;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Clock time only — the audit log is read as a sequence, not as dates. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
