import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";
import { siteConfig } from "@/lib/site";

// Home is an async Server Component; await it, then render the returned tree. The
// async SignupStatus and SignupToken suspend under jsdom, so only the static shell
// renders. Sanity is unconfigured in unit tests, so this exercises the fallback hero.
async function renderHome() {
  return render(
    await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) }),
  );
}

describe("Home page shell", () => {
  it("renders the fallback hero headline and the dual CTA", async () => {
    await renderHome();

    expect(
      screen.getByRole("heading", { level: 1, name: siteConfig.tagline }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: siteConfig.betaCta }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: siteConfig.waitlistCta }),
    ).toBeInTheDocument();
  });

  it("surfaces the logo lockup and the fallback eyebrow", async () => {
    await renderHome();

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
    expect(screen.getByText(siteConfig.eyebrow)).toBeInTheDocument();
  });
});
