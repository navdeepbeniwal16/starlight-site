import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import type { Pricing as PricingContent } from "@/sanity/lib/types";
import { Pricing } from "./pricing";

describe("Pricing", () => {
  it("shows the free-in-beta price alongside CMS copy", () => {
    const content: PricingContent = {
      heading: "What it costs",
      body: "Nothing while we're testing.",
      note: "Cancel anytime.",
    };
    render(<Pricing content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "What it costs" }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.pricing.price)).toBeInTheDocument();
    expect(screen.getByText("Nothing while we're testing.")).toBeInTheDocument();
    expect(screen.getByText("Cancel anytime.")).toBeInTheDocument();
  });

  it("falls back to static pricing copy when the CMS has none", () => {
    render(<Pricing content={null} />);

    expect(
      screen.getByRole("heading", { level: 2, name: siteConfig.pricing.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.pricing.body)).toBeInTheDocument();
  });
});
