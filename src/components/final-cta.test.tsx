import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/lib/site";
import type { FinalCta as FinalCtaContent } from "@/sanity/lib/types";
import { FinalCta } from "./final-cta";

vi.mock("./signup-token", () => ({ SignupToken: () => null }));

describe("FinalCta", () => {
  it("captures a waitlist signup and shows the success state passed in", () => {
    const content: FinalCtaContent = {
      heading: "Tell me at launch",
      body: "We'll email you once.",
      cta: { label: "Keep me posted", kind: "waitlist" },
    };
    render(
      <FinalCta
        content={content}
        status={<p role="status">{"You're on the list."}</p>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Tell me at launch" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep me posted" })).toHaveAttribute(
      "value",
      "launch_waitlist",
    );
    expect(screen.getByRole("status")).toHaveTextContent("You're on the list.");
  });

  it("falls back to static copy when the CMS has none", () => {
    render(<FinalCta content={null} />);

    expect(
      screen.getByRole("heading", { level: 2, name: siteConfig.finalCta.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: siteConfig.finalCta.cta }),
    ).toBeInTheDocument();
  });
});
