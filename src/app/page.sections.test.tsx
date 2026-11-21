import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/lib/site";
import type {
  FeatureSection,
  ImageWithAlt,
  LandingPage,
} from "@/sanity/lib/types";

// Drive the page from the typed fetch layer, with next/image and the Sanity image
// builder stubbed so the device-framed media renders under jsdom.
const { getLandingPage, getSiteSettings } = vi.hoisted(() => ({
  getLandingPage: vi.fn(),
  getSiteSettings: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/sanity/lib/fetch", () => ({ getLandingPage, getSiteSettings }));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    createElement("img", { src, alt }),
}));
vi.mock("@/sanity/lib/image", () => {
  const builder = {
    width: () => builder,
    height: () => builder,
    fit: () => builder,
    auto: () => builder,
    url: () => "https://cdn.sanity.io/images/poster.jpg",
  };
  return { urlForImage: () => builder };
});

import Home from "./page";

const feature = (
  heading: string,
  alt: string,
  videoUrl: string | null,
): FeatureSection => ({
  eyebrow: null,
  heading,
  body: `${heading} body copy.`,
  featureMedia: { image: { alt } as ImageWithAlt, videoUrl },
});

const landingPage: LandingPage = {
  hero: {
    eyebrow: "Private beta",
    heading: "Turn a long list into a day",
    subheading: null,
    devicePoster: null,
    cta: null,
    ctaFootnote: null,
  },
  featureSections: [
    feature("The plan", "The plan clip", "https://cdn.sanity.io/files/plan.mp4"),
    feature("Bring your backlog", "Backlog clip", "https://cdn.sanity.io/files/backlog.mp4"),
    feature("Shape your day", "Shape clip", "https://cdn.sanity.io/files/shape.mp4"),
    feature("Work your day", "Work your day screenshot", null),
  ],
  howItWorks: {
    heading: "How it works",
    steps: [
      { title: "Dump", body: "Empty your head." },
      { title: "Shape", body: "Pick what matters." },
      { title: "Plan", body: "Make a doable day." },
    ],
  },
  projects: {
    heading: "Built in public",
    body: "What we are shaping next.",
    items: [feature("Shared plans", "Shared plans screenshot", null)],
  },
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

describe("Home story & feature sections", () => {
  beforeEach(() => getLandingPage.mockReset());

  it("renders all six story sections in source order below the hero", async () => {
    getLandingPage.mockResolvedValue(landingPage);
    await renderHome();

    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((node) => node.textContent);

    // The always-on conversion run (beta, pricing, FAQ, final CTA) trails these.
    expect(headings.slice(0, 6)).toEqual([
      "The plan",
      "Bring your backlog",
      "Shape your day",
      "Work your day",
      "How it works",
      "Built in public",
    ]);
  });

  it("plays a clip where present and shows the still otherwise", async () => {
    getLandingPage.mockResolvedValue(landingPage);
    const { container } = await renderHome();

    expect(container.querySelectorAll("video")).toHaveLength(3);
    expect(
      screen.getByRole("img", { name: "Work your day screenshot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Shared plans screenshot" }),
    ).toBeInTheDocument();
  });

  it("alternates band tone from the paper hero down the story sections", async () => {
    getLandingPage.mockResolvedValue(landingPage);
    const { container } = await renderHome();

    const sections = Array.from(container.querySelectorAll("section"));
    const tone = (node: Element) =>
      node.classList.contains("bg-ink")
        ? "ink"
        : node.classList.contains("bg-beige")
          ? "beige"
          : "paper";

    // Hero plus the six story sections alternate paper↔beige.
    expect(sections.slice(0, 7).map(tone)).toEqual([
      "paper",
      "beige",
      "paper",
      "beige",
      "paper",
      "beige",
      "paper",
    ]);
    expect(sections.filter((node) => tone(node) === "ink")).toHaveLength(1);
  });

  it("drops the story sections but keeps the conversion run when the CMS has none", async () => {
    getLandingPage.mockResolvedValue({
      ...landingPage,
      featureSections: null,
      howItWorks: null,
      projects: null,
    });
    await renderHome();

    expect(screen.queryByRole("heading", { name: "The plan" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Built in public" })).toBeNull();
    expect(
      screen.getByRole("heading", { level: 1, name: landingPage.hero.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: siteConfig.beta.heading }),
    ).toBeInTheDocument();
  });
});
