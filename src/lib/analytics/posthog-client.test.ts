import { beforeEach, describe, expect, it, vi } from "vitest";
import { Segment } from "@/generated/prisma/enums";

// posthog-js is a browser singleton; stub it so we can assert nothing is sent when the
// project key is unset (the no-op posture every unconfigured environment runs in).
const { posthogMock } = vi.hoisted(() => ({
  posthogMock: { capture: vi.fn(), identify: vi.fn() },
}));
vi.mock("posthog-js", () => ({ default: posthogMock }));

import {
  captureCtaClick,
  captureFirstTouchUtm,
  captureSignupSubmitted,
  identifySignup,
} from "./posthog-client";

describe("captureFirstTouchUtm", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("reads UTM from the URL and persists it for the session", () => {
    window.history.replaceState(
      {},
      "",
      "/?utm_source=newsletter&utm_campaign=launch",
    );
    expect(captureFirstTouchUtm()).toEqual({
      utm_source: "newsletter",
      utm_campaign: "launch",
    });
    expect(
      JSON.parse(window.sessionStorage.getItem("starlight.utm") ?? "null"),
    ).toEqual({ utm_source: "newsletter", utm_campaign: "launch" });
  });

  it("keeps the first touch even after the query string changes", () => {
    window.history.replaceState({}, "", "/?utm_source=first");
    captureFirstTouchUtm();
    window.history.replaceState({}, "", "/?utm_source=second");
    expect(captureFirstTouchUtm()).toEqual({ utm_source: "first" });
  });

  it("returns nothing and stores nothing for direct traffic", () => {
    expect(captureFirstTouchUtm()).toEqual({});
    expect(window.sessionStorage.getItem("starlight.utm")).toBeNull();
  });
});

describe("analytics helpers when PostHog is unconfigured", () => {
  beforeEach(() => vi.clearAllMocks());

  it("send nothing — no capture, no identify", () => {
    captureCtaClick(Segment.beta_tester, "hero");
    captureSignupSubmitted(Segment.launch_waitlist);
    identifySignup("jordan@example.com", Segment.launch_waitlist, {});
    expect(posthogMock.capture).not.toHaveBeenCalled();
    expect(posthogMock.identify).not.toHaveBeenCalled();
  });
});
