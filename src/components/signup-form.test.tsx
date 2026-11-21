import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Segment } from "@/generated/prisma/enums";
import { HONEYPOT_FIELD } from "@/lib/signup/abuse";
import { SignupForm } from "./signup-form";

// SignupToken is an async server component (connection()) and can't render in jsdom;
// its signing is covered in abuse.test.ts.
vi.mock("./signup-token", () => ({ SignupToken: () => null }));

const DUAL = [
  { segment: Segment.beta_tester, label: "Get the iOS beta" },
  { segment: Segment.launch_waitlist, label: "Notify me at launch" },
];

describe("SignupForm", () => {
  it("posts to the signup handler with a segment-bearing submit per action", () => {
    render(<SignupForm id="hero" actions={DUAL} />);

    const form = screen
      .getByRole("button", { name: /ios beta/i })
      .closest("form")!;
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/api/signup");
    expect(form.querySelector('input[name="email"]')).toBeRequired();

    // The segment rides on the clicked button, not a hidden field.
    const beta = screen.getByRole("button", { name: /ios beta/i });
    const waitlist = screen.getByRole("button", { name: /notify me at launch/i });
    expect(beta).toHaveAttribute("name", "segment");
    expect(beta).toHaveAttribute("value", "beta_tester");
    expect(waitlist).toHaveAttribute("value", "launch_waitlist");
  });

  it("carries a source as a hidden field only when one is given", () => {
    const { rerender } = render(<SignupForm id="hero" actions={DUAL} />);
    let form = screen.getByRole("button", { name: /ios beta/i }).closest("form")!;
    expect(form.querySelector('input[name="source"]')).toBeNull();

    rerender(<SignupForm id="hero" actions={DUAL} source="beta" />);
    form = screen.getByRole("button", { name: /ios beta/i }).closest("form")!;
    expect(form.querySelector('input[name="source"]')).toHaveAttribute(
      "value",
      "beta",
    );
  });

  it("requires submit-time consent", () => {
    render(
      <SignupForm
        id="final"
        actions={[{ segment: Segment.launch_waitlist, label: "Notify me" }]}
      />,
    );

    const consent = screen.getByRole("checkbox", { name: /agree/i });
    expect(consent).toHaveAttribute("name", "consent");
    expect(consent).toBeRequired();
  });

  it("hides the honeypot from sighted and assistive-tech users without type=hidden", () => {
    render(
      <SignupForm
        id="final"
        actions={[{ segment: Segment.launch_waitlist, label: "Notify me" }]}
      />,
    );

    const form = screen
      .getByRole("button", { name: /notify me/i })
      .closest("form")!;
    const honeypot = form.querySelector(`input[name="${HONEYPOT_FIELD}"]`)!;

    expect(honeypot).toHaveAttribute("type", "text");
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(
      within(form).queryByRole("textbox", { name: /leave this field empty/i }),
    ).toBeNull();
  });
});
