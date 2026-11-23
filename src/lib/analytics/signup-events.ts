import type { Segment } from "@/generated/prisma/enums";
import { ANALYTICS_EVENTS } from "./events";
import { analytics } from "./posthog-server";

// The normalized email is the distinct_id for both server events, so they join the person
// the client identified on a consented submit. A non-consented signup still counts, just
// without a person profile (process_person_profile gated on consent). Country is the only
// geo attached — resolved from the edge IP by the caller, never the raw IP.
export interface ServerEventContext {
  email: string;
  segment: Segment;
  consented: boolean;
  country?: string;
}

function send(event: string, ctx: ServerEventContext): void {
  analytics.capture({
    distinctId: ctx.email,
    event,
    properties: {
      segment: ctx.segment,
      ...(ctx.country ? { country: ctx.country } : {}),
    },
    options: { process_person_profile: ctx.consented },
  });
}

// Fired once per newly-committed signup row, so its per-segment total equals the signup
// table — a duplicate submit (already on the list) doesn't fire it.
export function trackSignupCommitted(ctx: ServerEventContext): void {
  send(ANALYTICS_EVENTS.signupCommitted, ctx);
}

// Fired when a real (non-bot) beta signup is 303'd to TestFlight — the beta funnel's last
// step.
export function trackTestflightRedirect(ctx: ServerEventContext): void {
  send(ANALYTICS_EVENTS.testflightRedirect, ctx);
}

// Serverless has no background flush timer (see posthog-server), so the route drains the
// queued events in after(), past the sent response.
export function flushAnalytics(): Promise<void> {
  return analytics.flush();
}
