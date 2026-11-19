const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_LENGTH = 64;

// Characters RFC 5321 permits unquoted in a local part.
const LOCAL_PART = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
const DOMAIN_LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;
// At least two letters, which rules out numeric TLDs.
const TLD = /^[A-Za-z]{2,}$/;

/**
 * isValidEmail is a structural syntax check, deliberately not RFC-exhaustive:
 * it rejects typos but does no MX or disposable-domain lookup.
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
  // Empty labels fail DOMAIN_LABEL, so this also rejects leading, trailing, and
  // consecutive dots in the domain.
  if (labels.length < 2) return false;
  if (!TLD.test(labels[labels.length - 1])) return false;
  return labels.every((label) => DOMAIN_LABEL.test(label));
}

/** normalizeEmail returns the canonical dedup key: trimmed and lowercased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
