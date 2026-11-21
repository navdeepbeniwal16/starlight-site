import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/lib/site";

// Sanity unconfigured, so the conversion run renders from static fallbacks — the shape
// CI deploys and the one this test pins.
const { getLandingPage, getSiteSettings } = vi.hoisted(() => ({
  getLandingPage: vi.fn().mockResolvedValue(null),
  getSiteSettings: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/sanity/lib/fetch", () => ({ getLandingPage, getSiteSettings }));

import Home from "./page";

async function renderHome() {
  return render(
    await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) }),
  );
}

describe("Home conversion run", () => {
  beforeEach(() => {
    getLandingPage.mockResolvedValue(null);
    getSiteSettings.mockResolvedValue(null);
  });

  it("always renders beta, pricing, FAQ and final CTA from fallbacks", async () => {
    await renderHome();

    for (const name of [
      siteConfig.beta.heading,
      siteConfig.pricing.heading,
      siteConfig.faq.heading,
      siteConfig.finalCta.heading,
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("makes the beta band the single dark spotlight", async () => {
    const { container } = await renderHome();

    const darkBands = Array.from(container.querySelectorAll("section")).filter(
      (node) => node.classList.contains("bg-ink"),
    );
    expect(darkBands).toHaveLength(1);
    expect(
      within(darkBands[0]).getByRole("button", { name: siteConfig.beta.cta }),
    ).toHaveAttribute("value", "beta_tester");
  });

  it("closes with a footer whose links resolve", async () => {
    const { container } = await renderHome();
    const footer = within(container.querySelector("footer")!);

    expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(footer.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.footer.supportEmail}`,
    );
  });
});
