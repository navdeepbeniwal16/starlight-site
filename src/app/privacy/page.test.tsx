import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { legalFallback } from "@/lib/legal";
import type { Legal } from "@/sanity/lib/types";

// Mock the typed fetch layer so the route is exercised against known content without a
// live Sanity project, mirroring the home-page CMS test.
const { getLegal, getSiteSettings } = vi.hoisted(() => ({
  getLegal: vi.fn(),
  getSiteSettings: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/sanity/lib/fetch", () => ({ getLegal, getSiteSettings }));

import PrivacyPage from "./page";

const sanityLegal: Legal = {
  privacy: {
    title: "Privacy notice",
    updatedAt: "2026-01-15",
    body: [
      {
        _type: "block",
        _key: "a",
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: "a1", text: "Edited in Sanity.", marks: [] }],
      },
    ],
  },
  terms: { title: "Terms", updatedAt: "2026-01-15", body: [] },
};

describe("Privacy page", () => {
  beforeEach(() => getLegal.mockReset());

  it("renders the privacy document fetched through the typed layer", async () => {
    getLegal.mockResolvedValue(sanityLegal);

    render(await PrivacyPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy notice" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Edited in Sanity.")).toBeInTheDocument();
    expect(screen.getByText(/Last updated 15 January 2026/)).toBeInTheDocument();
  });

  it("falls back to static copy disclosing the processors, consent, TestFlight, rights, and retention", async () => {
    getLegal.mockResolvedValue(null);

    const { container } = render(await PrivacyPage());
    const text = container.textContent ?? "";

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: legalFallback.privacy.title,
      }),
    ).toBeInTheDocument();
    // The four processors the ticket requires the note to disclose.
    for (const processor of ["Neon", "HubSpot", "PostHog", "Vercel"]) {
      expect(text).toContain(processor);
    }
    expect(text).toContain("consent");
    expect(text).toContain("TestFlight");
    expect(text.toLowerCase()).toContain("unsubscribe");
    expect(text).toContain("sell your data");
    expect(text).toContain("How long we keep it");
  });

  it("links the footer to the legal routes", async () => {
    getLegal.mockResolvedValue(null);

    render(await PrivacyPage());
    const footer = screen.getByRole("contentinfo");

    expect(
      within(footer).getByRole("link", { name: "Privacy" }),
    ).toHaveAttribute("href", "/privacy");
    expect(within(footer).getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });
});
