import posthog from "posthog-js";
import {
  isAnalyticsConfigured,
  POSTHOG_HOST,
  POSTHOG_KEY,
} from "@/lib/analytics/config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

// Cookieless by default: persistence 'memory' sets no cookies and no local/session storage,
// so an anonymous visitor's distinct_id lives only for this page load and never persists
// across sessions — which is why no consent banner is needed. Autocapture is off (the five
// manual events are the whole surface) and a person profile is created only when a consented
// submit calls identify().
if (isAnalyticsConfigured) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://eu.posthog.com",
    defaults: "2025-05-24",
    persistence: "memory",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    // No referrer, per the privacy spec; and mask ad-id params (gclid, fbclid, …) out of
    // captured URLs so they never leave the browser.
    property_denylist: [
      "$referrer",
      "$referring_domain",
      "$initial_referrer",
      "$initial_referring_domain",
    ],
    mask_personal_data_properties: true,
    // Runtime error tracking — autocaptures unhandled exceptions, satisfying the Ops
    // runtime-error monitoring requirement on the client side.
    capture_exceptions: true,
  });

  // capture_pageview is off, so emit the one pageview for this load by hand. Full-page
  // navigations (every form POST round-trips the server) re-run this file, so each load
  // emits exactly one.
  posthog.capture(ANALYTICS_EVENTS.pageview);
}

// Client-side route changes (e.g. to /privacy) don't re-run this file, so emit their
// pageview from the router hook instead.
export function onRouterTransitionStart(url: string): void {
  if (!isAnalyticsConfigured) return;
  posthog.capture(ANALYTICS_EVENTS.pageview, {
    $current_url: new URL(url, window.location.origin).href,
  });
}
