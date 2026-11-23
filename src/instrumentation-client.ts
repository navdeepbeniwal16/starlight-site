import posthog from "posthog-js";
import {
  isAnalyticsConfigured,
  POSTHOG_HOST,
  POSTHOG_KEY,
} from "@/lib/analytics/config";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";

// Cookieless: persistence 'memory' holds identity in memory for the page load only — no
// cookies, no storage — so no consent banner is needed. Autocapture stays off and a profile is
// created only by a consented identify().
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
    // No referrer (privacy spec); mask ad-id params (gclid, fbclid, …) from captured URLs.
    property_denylist: [
      "$referrer",
      "$referring_domain",
      "$initial_referrer",
      "$initial_referring_domain",
    ],
    mask_personal_data_properties: true,
    capture_exceptions: true,
  });

  // capture_pageview is off, so fire this load's pageview by hand. Full-page navigations re-run
  // this file, so each load emits exactly one.
  posthog.capture(ANALYTICS_EVENTS.pageview);
}

// Client-side route changes don't re-run this file, so emit their pageview from the router hook.
export function onRouterTransitionStart(url: string): void {
  if (!isAnalyticsConfigured) return;
  posthog.capture(ANALYTICS_EVENTS.pageview, {
    $current_url: new URL(url, window.location.origin).href,
  });
}
