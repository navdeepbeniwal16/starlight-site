import { createHmac, timingSafeEqual } from "node:crypto";

// Form fields the trap round-trips between render and submit. The honeypot is a
// decoy a human never sees; ts/sig carry the signed render time.
export const HONEYPOT_FIELD = "website";
export const TIMESTAMP_FIELD = "ts";
export const SIGNATURE_FIELD = "sig";

// A human needs at least a moment to read and fill the form; a faster submit is a
// script. The upper bound caps how long a harvested token stays replayable while
// still tolerating a visitor who lingers on the page.
const MIN_FILL_MS = 2_000;
const MAX_TOKEN_AGE_MS = 60 * 60 * 1000;

function secret(): string {
  const value = process.env.SIGNUP_FORM_SECRET;
  if (!value) {
    throw new Error("SIGNUP_FORM_SECRET is not set");
  }
  return value;
}

export function signTimestamp(timestamp: number): string {
  return createHmac("sha256", secret()).update(String(timestamp)).digest("hex");
}

export function verifyTimestamp(timestamp: number, signature: string): boolean {
  const expected = Buffer.from(signTimestamp(timestamp));
  const actual = Buffer.from(signature);
  // Length guard first: timingSafeEqual throws when the buffers differ in length.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export interface FormToken {
  timestamp: number;
  signature: string;
}

/** issueFormToken mints a fresh signed render time for one form instance. */
export function issueFormToken(now: number = Date.now()): FormToken {
  return { timestamp: now, signature: signTimestamp(now) };
}

export interface Submission {
  honeypot: string;
  timestamp: string;
  signature: string;
  now: number;
}

/**
 * isBotSubmission is the pure guard: it trips on a filled honeypot, a missing or
 * forged signature, or a timestamp that is implausibly fresh or already stale.
 * `now` is injected so the verdict stays deterministic and testable.
 */
export function isBotSubmission({
  honeypot,
  timestamp,
  signature,
  now,
}: Submission): boolean {
  if (honeypot.trim() !== "") return true;

  // Reject non-numeric timestamps before Number() coerces "" or junk to a value.
  if (!/^\d+$/.test(timestamp)) return true;
  const issuedAt = Number(timestamp);

  if (!verifyTimestamp(issuedAt, signature)) return true;

  const elapsed = now - issuedAt;
  return elapsed < MIN_FILL_MS || elapsed > MAX_TOKEN_AGE_MS;
}
