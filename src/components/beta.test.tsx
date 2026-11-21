import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/lib/site";
import type { Beta as BetaContent } from "@/sanity/lib/types";
import { Beta } from "./beta";

// SignupToken is an async server component (connection()) and can't render in jsdom.
vi.mock("./signup-token", () => ({ SignupToken: () => null }));

describe("Beta", () => {
  it("renders the beta CTA bound to the beta segment on a dark band", () => {
    const content: BetaContent = {
      heading: "Join the beta",
      body: "Help us test it.",
      cta: { label: "Join on TestFlight", kind: "beta" },
    };
    const { container } = render(<Beta content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Join the beta" }),
    ).toBeInTheDocument();

    const button = screen.getByRole("button", { name: "Join on TestFlight" });
    expect(button).toHaveAttribute("value", "beta_tester");
    // The spotlight band is the one dark section.
    expect(container.querySelector("section")).toHaveClass("bg-ink");
  });

  it("falls back to static beta copy when the CMS has none", () => {
    render(<Beta content={null} />);

    expect(
      screen.getByRole("heading", { level: 2, name: siteConfig.beta.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: siteConfig.beta.cta }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.beta.footnote)).toBeInTheDocument();
  });
});
