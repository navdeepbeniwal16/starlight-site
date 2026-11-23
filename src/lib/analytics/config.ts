// PostHog is optional, the same no-op posture as the HubSpot client and Sanity: with no
// key (local, CI, unconfigured deploys) analytics stands down end to end — the browser SDK
// never initializes and the server client is a fake — so nothing reaches a third party
// unless it's deliberately configured.
const DEFAULT_HOST = "https://eu.i.posthog.com";

// The project API key is public by design: it ships to the browser and is a write-only
// ingestion key, so the client and the server share it. Host defaults to EU cloud.
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_HOST;

export const isAnalyticsConfigured = POSTHOG_KEY.length > 0;
