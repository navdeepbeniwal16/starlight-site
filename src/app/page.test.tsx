import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { siteConfig } from "@/lib/site";

describe("Home placeholder page", () => {
  it("renders the tagline as the page heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: siteConfig.tagline }),
    ).toBeInTheDocument();
  });

  it("surfaces the brand name and waitlist status", () => {
    render(<Home />);

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.waitlistStatus)).toBeInTheDocument();
  });
});
