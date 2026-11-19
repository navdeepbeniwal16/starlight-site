import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { siteConfig } from "@/lib/site";

// The async SignupStatus suspends under jsdom, so only the static shell renders.
function renderHome() {
  return render(
    <Home params={Promise.resolve({})} searchParams={Promise.resolve({})} />,
  );
}

describe("Home placeholder page", () => {
  it("renders the tagline as the page heading", () => {
    renderHome();

    expect(
      screen.getByRole("heading", { name: siteConfig.tagline }),
    ).toBeInTheDocument();
  });

  it("surfaces the brand name and waitlist status", () => {
    renderHome();

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.waitlistStatus)).toBeInTheDocument();
  });
});
