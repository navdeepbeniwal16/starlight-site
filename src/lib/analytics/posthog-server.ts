import { PostHog } from "posthog-node";
import { isAnalyticsConfigured, POSTHOG_HOST, POSTHOG_KEY } from "./config";

type CaptureMessage = Parameters<PostHog["capture"]>[0];
type CaptureExceptionOptions = NonNullable<
  Parameters<PostHog["captureException"]>[1]
>;

// A narrow seam over PostHog so the unconfigured path can swap in the no-op fake below.
export interface ServerAnalytics {
  capture(message: CaptureMessage): void;
  captureException(error: unknown, options?: CaptureExceptionOptions): void;
  flush(): Promise<void>;
}

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
    // Serverless has no long-lived process to drain a timer-based queue, so flush is disabled
    // here and driven explicitly from after() once events are queued.
    flushAt: 1,
    flushInterval: 0,
    // Country is attached from the edge geo header instead, so the raw IP never reaches PostHog.
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
