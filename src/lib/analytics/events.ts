import type { Segment } from "@/generated/prisma/enums";

// Autocapture is off, so these five manual events are the entire analytics surface. The two
// PostHog funnels are built from them (see the README), so renaming one here means renaming
// it in the funnel definition too.
export const ANALYTICS_EVENTS = {
  // Fired by hand on each load — capture_pageview is off so PostHog won't emit it for us.
  pageview: "$pageview",
  // Client: a visitor clicked a signup CTA button.
  ctaClick: "cta_click",
  // Client: a signup form passed browser validation and is being submitted.
  signupSubmitted: "signup_submitted",
  // Server: a new signup row committed to Postgres (one per created row, so the per-segment
  // count matches the signup table).
  signupCommitted: "signup_committed",
  // Server: a beta signup is being 303'd to TestFlight.
  testflightRedirect: "testflight_redirect",
} as const;

export interface CtaClickProps {
  cta: Segment;
  location: string;
}

export interface SegmentProps {
  segment: Segment;
}
