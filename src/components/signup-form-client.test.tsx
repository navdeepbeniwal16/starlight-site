import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Segment } from "@/generated/prisma/enums";

// Stub the posthog-client helpers so the test asserts what the form fires. captureFirstTouchUtm
// feeds the identify UTM arg.
const { helpers } = vi.hoisted(() => ({
  helpers: {
    captureCtaClick: vi.fn(),
    captureSignupSubmitted: vi.fn(),
    identifySignup: vi.fn(),
    captureFirstTouchUtm: vi.fn(() => ({ utm_source: "newsletter" })),
  },
}));
vi.mock("@/lib/analytics/posthog-client", () => helpers);

import { SignupFormClient } from "./signup-form-client";

const WAITLIST = [{ segment: Segment.launch_waitlist, label: "Notify me" }];

function renderForm(actions = WAITLIST, source = "final") {
  render(
    <SignupFormClient id={source} source={source} actions={actions}>
      {null}
    </SignupFormClient>,
  );
  return screen.getByRole("button").closest("form") as HTMLFormElement;
}

describe("SignupFormClient analytics", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fires cta_click with the clicked button's segment and the form location", () => {
    render(
      <SignupFormClient
        id="hero"
        source="hero"
        actions={[
          { segment: Segment.beta_tester, label: "Get the iOS beta" },
          { segment: Segment.launch_waitlist, label: "Notify me at launch" },
        ]}
      >
        {null}
      </SignupFormClient>,
    );
    fireEvent.click(screen.getByRole("button", { name: /ios beta/i }));
    expect(helpers.captureCtaClick).toHaveBeenCalledWith(
      Segment.beta_tester,
      "hero",
    );
  });

  it("fires signup_submitted and identifies with first-touch UTM on a consented submit", () => {
    const form = renderForm();
    (form.elements.namedItem("email") as HTMLInputElement).value =
      "jordan@example.com";
    (form.elements.namedItem("consent") as HTMLInputElement).checked = true;

    fireEvent.submit(form);

    expect(helpers.captureSignupSubmitted).toHaveBeenCalledWith(
      Segment.launch_waitlist,
    );
    expect(helpers.identifySignup).toHaveBeenCalledWith(
      "jordan@example.com",
      Segment.launch_waitlist,
      { utm_source: "newsletter" },
    );
  });

  it("submits without identifying when consent is unticked", () => {
    const form = renderForm();
    (form.elements.namedItem("email") as HTMLInputElement).value =
      "jordan@example.com";

    fireEvent.submit(form);

    expect(helpers.captureSignupSubmitted).toHaveBeenCalled();
    expect(helpers.identifySignup).not.toHaveBeenCalled();
  });
});
