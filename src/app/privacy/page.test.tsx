import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Legal } from "@/sanity/lib/types";

// Mock the typed fetch layer so the route renders known content without a live Sanity project.
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

  it("shows an unavailable message, not stale copy, when the CMS returns nothing", async () => {
    getLegal.mockResolvedValue(null);

    render(await PrivacyPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Privacy" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/isn't available right now/i)).toBeInTheDocument();
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
