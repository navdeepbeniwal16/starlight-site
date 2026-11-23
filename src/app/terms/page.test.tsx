import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { legalFallback } from "@/lib/legal";
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

  it("falls back to static copy covering the beta, TestFlight, and no-warranty stance", async () => {
    getLegal.mockResolvedValue(null);

    const { container } = render(await TermsPage());
    const text = container.textContent ?? "";

    expect(
      screen.getByRole("heading", { level: 1, name: legalFallback.terms.title }),
    ).toBeInTheDocument();
    expect(text).toContain("TestFlight");
    expect(text).toContain("beta");
    expect(text).toContain("as they are");
  });
});
