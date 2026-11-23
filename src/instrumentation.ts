import type { Instrumentation } from "next";
import { analytics } from "@/lib/analytics/posthog-server";

// Forwards server runtime errors (route handlers, RSC renders) to PostHog error tracking.
// Guarded to the Node runtime, where posthog-node runs.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  analytics.captureException(error, {
    // No end-user identity here; bucket under a stable server id and skip person processing.
    distinctId: "server",
    properties: {
      path: request.path,
      method: request.method,
      router_kind: context.routerKind,
      route_path: context.routePath,
      route_type: context.routeType,
    },
    options: { process_person_profile: false },
  });
  await analytics.flush();
};
