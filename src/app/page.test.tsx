import { render, screen, within } from "@testing-library/react";
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

// The hero is always the first <section>; the beta band and final CTA repeat its CTA
// labels, so hero assertions scope here rather than querying the whole page.
function hero(container: HTMLElement) {
  return within(container.querySelector("section")!);
}

describe("Home page shell", () => {
  it("renders the fallback hero headline and the dual CTA", async () => {
    const { container } = await renderHome();

    expect(
      hero(container).getByRole("heading", { level: 1, name: siteConfig.tagline }),
    ).toBeInTheDocument();
    expect(
      hero(container).getByRole("button", { name: siteConfig.betaCta }),
    ).toBeInTheDocument();
    expect(
      hero(container).getByRole("button", { name: siteConfig.waitlistCta }),
    ).toBeInTheDocument();
  });

  it("surfaces the logo lockup and the fallback eyebrow", async () => {
    const { container } = await renderHome();

    // The lockup sits in both the header and the footer.
    expect(screen.getAllByText(siteConfig.name).length).toBeGreaterThan(0);
    expect(hero(container).getByText(siteConfig.eyebrow)).toBeInTheDocument();
  });
});
