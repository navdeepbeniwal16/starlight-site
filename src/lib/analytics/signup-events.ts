import type { Segment } from "@/generated/prisma/enums";
import { ANALYTICS_EVENTS } from "./events";
import { analytics } from "./posthog-server";

// distinct_id is the normalized email for both events, matching the client identify, so they
// resolve to one person. Person processing is gated on consent; country is the only geo, set
// by the caller from the edge IP, never the raw IP.
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

export function trackSignupCommitted(ctx: ServerEventContext): void {
  send(ANALYTICS_EVENTS.signupCommitted, ctx);
}

export function trackTestflightRedirect(ctx: ServerEventContext): void {
  send(ANALYTICS_EVENTS.testflightRedirect, ctx);
}

// Personless: a failed write has no consented user to attach.
export function trackSignupError(
  error: unknown,
  ctx: Pick<ServerEventContext, "email" | "segment">,
): void {
  analytics.captureException(error, {
    distinctId: ctx.email,
    properties: { segment: ctx.segment, scope: "signup_write" },
    options: { process_person_profile: false },
  });
}

// Serverless has no background flush timer, so the route drains the queued events via after().
export function flushAnalytics(): Promise<void> {
  return analytics.flush();
}
