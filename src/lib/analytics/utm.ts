export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type Utm = Partial<Record<UtmKey, string>>;

export function readUtm(params: URLSearchParams): Utm {
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) utm[key] = value;
  }
  return utm;
}

export function readUtmFromForm(form: FormData): Utm {
  const utm: Utm = {};
  for (const key of UTM_KEYS) {
    const value = form.get(key);
    if (typeof value === "string" && value.trim()) utm[key] = value.trim();
  }
  return utm;
}
