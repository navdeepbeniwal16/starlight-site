const DEFAULT_HOST = "https://eu.i.posthog.com";

// Public by design — it ships to the browser and is a write-only ingestion key — so the client
// and server share the one key.
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST;

// Gates analytics everywhere: unset, the client SDK never initializes and the server client is
// a no-op fake, so nothing reaches PostHog.
export const isAnalyticsConfigured = POSTHOG_KEY.length > 0;
