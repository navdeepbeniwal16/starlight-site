import { PostHog } from "posthog-node";
import { isAnalyticsConfigured, POSTHOG_HOST, POSTHOG_KEY } from "./config";

type CaptureMessage = Parameters<PostHog["capture"]>[0];
type CaptureExceptionOptions = NonNullable<
  Parameters<PostHog["captureException"]>[1]
>;

// The server-side slice of analytics: the two server events and runtime-error reporting.
// Narrowed to what the route and instrumentation actually call, so the no-op fake below
// stays trivial.
export interface ServerAnalytics {
  capture(message: CaptureMessage): void;
  captureException(error: unknown, options?: CaptureExceptionOptions): void;
  flush(): Promise<void>;
}

// Unconfigured (local, CI, tests): drop everything, so nothing reaches PostHog and no
// network call is made — the same stance as the no-op HubSpot client.
const noopAnalytics: ServerAnalytics = {
  capture() {},
  captureException() {},
  flush: async () => {},
};

// Dev HMR re-imports this module on every edit; cache the client on globalThis so each
// reload reuses one instance instead of leaking another background flush loop.
const globalForAnalytics = globalThis as unknown as { posthog?: PostHog };

function createClient(): PostHog {
  return new PostHog(POSTHOG_KEY, {
    host: POSTHOG_HOST,
    // Serverless has no long-lived process to drain a timer-based queue, so disable the
    // background flush and drain explicitly (in after()) once events are queued.
    flushAt: 1,
    flushInterval: 0,
    // We attach country ourselves from the edge geo header and never forward the raw IP,
    // so PostHog's own IP-based GeoIP enrichment stays off.
    disableGeoip: true,
  });
}

function realAnalytics(): ServerAnalytics {
  const client =
    globalForAnalytics.posthog ?? (globalForAnalytics.posthog = createClient());
  return {
    capture: (message) => client.capture(message),
    captureException: (error, options) =>
      client.captureException(error, options),
    flush: () => client.flush(),
  };
}

export const analytics: ServerAnalytics = isAnalyticsConfigured
  ? realAnalytics()
  : noopAnalytics;
