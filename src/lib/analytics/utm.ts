// First-touch UTM is the only attribution signal we keep: captured from the landing URL,
// persisted to the signup row, and sent as person props on a consented identify. Geo stays
// coarse (country only, resolved server-side then discarded) and referrers are dropped.
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

// Pulls the known UTM params out of a query string, dropping blanks. Used client-side to
// read the landing URL.
export function readUtm(params: URLSearchParams): Utm {
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value;
  }
  return utm;
}

// The server counterpart: reads the same keys off the posted form, so the row stores the
// first-touch UTM the client stashed into its hidden fields.
export function readUtmFromForm(form: FormData): Utm {
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = form.get(key);
    if (typeof value === "string" && value.trim()) utm[key] = value.trim();
  }
  return utm;
}
