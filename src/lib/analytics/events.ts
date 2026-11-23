// The PostHog funnels (defined in the UI — see the README) are built from these names, so a
// rename here is a rename there.
export const ANALYTICS_EVENTS = {
  pageview: "$pageview",
  ctaClick: "cta_click",
  signupSubmitted: "signup_submitted",
  signupCommitted: "signup_committed",
  testflightRedirect: "testflight_redirect",
} as const;
