import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SignupForms } from "./signup-forms";

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
});
