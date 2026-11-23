import type { Instrumentation } from "next";
import { analytics } from "@/lib/analytics/posthog-server";

// Forwards server runtime errors — route handlers (notably the signup API) and RSC renders —
// to PostHog error tracking, the server half of the Ops runtime-error monitoring. No-ops when
// analytics is unconfigured, and stays on the Node runtime where posthog-node lives.
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  analytics.captureException(error, {
    // No end-user identity at this layer, so bucket under a stable server id rather than
    // minting a throwaway profile per error.
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
