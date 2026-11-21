import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/lib/site";
import type { LandingPage } from "@/sanity/lib/types";

// Mock the typed fetch layer so this test proves the page renders content pulled
// through getLandingPage() — the smoke render the ticket asks for — without a live
// Sanity project.
const { getLandingPage } = vi.hoisted(() => ({ getLandingPage: vi.fn() }));
vi.mock("@/sanity/lib/fetch", () => ({ getLandingPage }));

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

  it("renders hero copy fetched through the typed layer", async () => {
    getLandingPage.mockResolvedValue(landingPage);

    await renderHome();

    expect(
      screen.getByRole("heading", { name: hero.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText(hero.subheading)).toBeInTheDocument();
    expect(screen.getByText(hero.eyebrow)).toBeInTheDocument();
  });

  it("falls back to static copy when the CMS returns nothing", async () => {
    getLandingPage.mockResolvedValue(null);

    await renderHome();

    expect(
      screen.getByRole("heading", { name: siteConfig.tagline }),
    ).toBeInTheDocument();
    expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
  });
});
