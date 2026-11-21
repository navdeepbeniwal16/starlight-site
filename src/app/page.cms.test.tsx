import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/lib/site";
import type { LandingPage } from "@/sanity/lib/types";

// Mock the typed fetch layer so this test proves the page renders content pulled
// through getLandingPage() — the smoke render the ticket asks for — without a live
// Sanity project.
const { getLandingPage, getSiteSettings } = vi.hoisted(() => ({
  getLandingPage: vi.fn(),
  getSiteSettings: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/sanity/lib/fetch", () => ({ getLandingPage, getSiteSettings }));

import Home from "./page";

const hero = {
  eyebrow: "Private beta",
  heading: "Map the night sky from your pocket",
  subheading: "Starlight turns your phone into a telescope finder.",
  devicePoster: null,
  cta: [
    { label: "Get the iOS beta", kind: "beta" as const },
    { label: "Notify me at launch", kind: "waitlist" as const },
  ],
  ctaFootnote: "Free during the beta.",
};

const landingPage: LandingPage = {
  hero,
  featureSections: null,
  howItWorks: null,
  projects: null,
  beta: null,
  pricing: null,
  faq: null,
  finalCta: null,
  footer: null,
  privacyBlurb: null,
};

async function renderHome() {
  return render(
    await Home({ params: Promise.resolve({}), searchParams: Promise.resolve({}) }),
  );
}

describe("Home with CMS content", () => {
  beforeEach(() => getLandingPage.mockReset());

  it("renders hero copy and the dual CTA fetched through the typed layer", async () => {
    getLandingPage.mockResolvedValue(landingPage);

    const { container } = await renderHome();
    // The CTA labels and eyebrow also appear in the beta/final bands, so scope to the
    // hero section.
    const inHero = within(container.querySelector("section")!);

    expect(
      inHero.getByRole("heading", { level: 1, name: hero.heading }),
    ).toBeInTheDocument();
    expect(inHero.getByText(hero.subheading)).toBeInTheDocument();
    expect(inHero.getByText(hero.eyebrow)).toBeInTheDocument();
    expect(
      inHero.getByRole("button", { name: hero.cta[0].label }),
    ).toBeInTheDocument();
    expect(
      inHero.getByRole("button", { name: hero.cta[1].label }),
    ).toBeInTheDocument();
  });

  it("falls back to static copy when the CMS returns nothing", async () => {
    getLandingPage.mockResolvedValue(null);

    await renderHome();

    expect(
      screen.getByRole("heading", { name: siteConfig.tagline }),
    ).toBeInTheDocument();
    // The lockup sits in both the header and the footer.
    expect(screen.getAllByText(siteConfig.name).length).toBeGreaterThan(0);
  });
});
