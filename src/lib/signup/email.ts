const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;

// Characters RFC 5321 permits unquoted in a local part.
const LOCAL_PART = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
// A domain label: alphanumeric, hyphens allowed only between, never at an edge.
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
// A top-level domain: at least two letters (rules out `.c` and numeric TLDs).
const TLD = /^[A-Za-z]{2,}$/;

/**
 * Hand-written structural email check (no validation library, per #4). It catches
 * the typos real users make; it is deliberately not RFC-exhaustive, and MX /
 * disposable-domain checks are out of scope for Tier 1.
 */
export function isValidEmail(email: string): boolean {
  const value = email.trim();
  if (value.length === 0 || value.length > MAX_EMAIL_LENGTH) return false;

  const at = value.indexOf("@");
  // Exactly one "@", with a non-empty part on either side.
  if (at <= 0 || at !== value.lastIndexOf("@") || at === value.length - 1) {
    return false;
  }

  const local = value.slice(0, at);
  if (local.length > MAX_LOCAL_LENGTH) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
    return false;
  }
  if (!LOCAL_PART.test(local)) return false;

  const labels = value.slice(at + 1).split(".");
  // Require at least a label plus a TLD; empty labels fail DOMAIN_LABEL, which
  // rules out leading/trailing/consecutive dots in the domain.
  if (labels.length < 2) return false;
  if (!TLD.test(labels[labels.length - 1])) return false;
  return labels.every((label) => DOMAIN_LABEL.test(label));
}

/** Canonical form stored and deduped against: trimmed and lowercased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
