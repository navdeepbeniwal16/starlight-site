import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HONEYPOT_FIELD } from "@/lib/signup/abuse";
import { SignupForms } from "./signup-forms";

// SignupToken is an async server component (it awaits connection()); stub it so the
// jsdom client render doesn't choke on it. Its signing is covered in abuse.test.ts.
vi.mock("./signup-token", () => ({ SignupToken: () => null }));

describe("SignupForms", () => {
  it("exposes a form for each segment that posts to the signup handler", () => {
    render(<SignupForms />);

    const waitlist = screen
      .getByRole("button", { name: /launch waitlist/i })
      .closest("form")!;
    const beta = screen
      .getByRole("button", { name: /join the beta/i })
      .closest("form")!;

    for (const form of [waitlist, beta]) {
      expect(form).toHaveAttribute("method", "post");
      expect(form).toHaveAttribute("action", "/api/signup");
      expect(form.querySelector('input[name="email"]')).toBeRequired();
    }

    expect(waitlist.querySelector('input[name="segment"]')).toHaveValue(
      "launch_waitlist",
    );
    expect(beta.querySelector('input[name="segment"]')).toHaveValue(
      "beta_tester",
    );
  });

  it("hides the honeypot from sighted and assistive-tech users without using type=hidden", () => {
    render(<SignupForms />);

    const form = screen
      .getByRole("button", { name: /launch waitlist/i })
      .closest("form")!;
    const honeypot = form.querySelector(`input[name="${HONEYPOT_FIELD}"]`)!;

    // A text input (never type=hidden) that a naive bot fills.
    expect(honeypot).toHaveAttribute("type", "text");
    // Removed from the layout and the keyboard order, and from the a11y tree, so a
    // real user — including one on a screen reader — can't land in it.
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(
      within(form).queryByRole("textbox", { name: /leave this field empty/i }),
    ).toBeNull();
  });
});
