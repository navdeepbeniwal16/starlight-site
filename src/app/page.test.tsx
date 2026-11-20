import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { siteConfig } from "@/lib/site";

// Home is an async Server Component; await it, then render the returned tree. The
// async SignupStatus suspends under jsdom, so only the static shell renders.
async function renderHome() {
  return render(
    await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) }),
  );
}

describe("Home placeholder page", () => {
  it("renders the tagline as the page heading", async () => {
    await renderHome();

    expect(
      screen.getByRole("heading", { name: siteConfig.tagline }),
    ).toBeInTheDocument();
  });

  it("surfaces the brand name and waitlist status", async () => {
    await renderHome();

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.waitlistStatus)).toBeInTheDocument();
  });
});
