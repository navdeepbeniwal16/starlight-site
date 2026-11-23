import posthog from "posthog-js";
import type { Segment } from "@/generated/prisma/enums";
import { normalizeEmail } from "@/lib/signup/email";
import { isAnalyticsConfigured } from "./config";
import { ANALYTICS_EVENTS } from "./events";
import { readUtm, type Utm } from "./utm";

const UTM_STORAGE_KEY = "starlight.utm";

// First-touch UTM, stashed in sessionStorage (not a cookie, so still cookieless and
// session-scoped) the first time it's seen. A mid-funnel redirect that strips the query
// string — e.g. ?status=invalid after a bad email — then can't lose the original campaign.
export function captureFirstTouchUtm(): Utm {
  if (typeof window === "undefined") return {};
  const fromUrl = () => readUtm(new URLSearchParams(window.location.search));
  try {
    const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Utm;
    const utm = fromUrl();
    if (Object.keys(utm).length > 0) {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }
    return utm;
  } catch {
    // sessionStorage can throw (private mode, quota, parse); analytics is best-effort.
    return fromUrl();
  }
}

export function captureCtaClick(cta: Segment, location: string): void {
  if (!isAnalyticsConfigured) return;
  posthog.capture(ANALYTICS_EVENTS.ctaClick, { cta, location });
}

export function captureSignupSubmitted(segment: Segment): void {
  if (!isAnalyticsConfigured) return;
  posthog.capture(ANALYTICS_EVENTS.signupSubmitted, { segment });
}

// Consent is the lawful basis for a person profile, so this runs only on a consented submit.
// The distinct_id is the email, normalized exactly as the route normalizes it, so the client
// identify and the server events land on one person; anonymous pre-submit events merge into
// it. First-touch UTM is set-once so a later submit can't overwrite the original campaign.
export function identifySignup(email: string, segment: Segment, utm: Utm): void {
  if (!isAnalyticsConfigured) return;
  posthog.identify(
    normalizeEmail(email),
    { [segment]: true, consent_at: new Date().toISOString() },
    utm,
  );
}
