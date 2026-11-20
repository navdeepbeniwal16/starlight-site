import { createHmac, timingSafeEqual } from "node:crypto";

export const HONEYPOT_FIELD = "website";
export const TIMESTAMP_FIELD = "ts";
export const SIGNATURE_FIELD = "sig";

const MIN_FILL_MS = 2_000;
// Kept generous: it bounds how long a harvested token stays replayable, but tightening
// it silently drops a real visitor who lingers before submitting.
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
 * isBotSubmission is the pure bot check; `now` is passed in rather than read from the
 * clock so the too-fast and expiry branches stay deterministic under test.
 */
export function isBotSubmission({
  honeypot,
  timestamp,
  signature,
  now,
}: Submission): boolean {
  if (honeypot.trim() !== "") return true;

  // Guard the raw string first: Number("") is 0, which would pass as a real timestamp.
  if (!/^\d+$/.test(timestamp)) return true;
  const issuedAt = Number(timestamp);

  if (!verifyTimestamp(issuedAt, signature)) return true;

  const elapsed = now - issuedAt;
  return elapsed < MIN_FILL_MS || elapsed > MAX_TOKEN_AGE_MS;
}
