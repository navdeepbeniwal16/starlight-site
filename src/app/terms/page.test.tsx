import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Legal } from "@/sanity/lib/types";

const { getLegal, getSiteSettings } = vi.hoisted(() => ({
  getLegal: vi.fn(),
  getSiteSettings: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/sanity/lib/fetch", () => ({ getLegal, getSiteSettings }));

import TermsPage from "./page";

const sanityLegal: Legal = {
  privacy: { title: "Privacy", updatedAt: "2026-01-15", body: [] },
  terms: {
    title: "Terms of use",
    updatedAt: "2026-02-01",
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
};

describe("Terms page", () => {
  beforeEach(() => getLegal.mockReset());

  it("renders the terms document fetched through the typed layer", async () => {
    getLegal.mockResolvedValue(sanityLegal);

    render(await TermsPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Terms of use" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Edited in Sanity.")).toBeInTheDocument();
    expect(screen.getByText(/Last updated 1 February 2026/)).toBeInTheDocument();
  });

  it("shows an unavailable message, not stale copy, when the CMS returns nothing", async () => {
    getLegal.mockResolvedValue(null);

    render(await TermsPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Terms" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/isn't available right now/i)).toBeInTheDocument();
  });
});
