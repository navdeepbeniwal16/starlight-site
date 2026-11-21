import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import { Footer } from "./footer";

describe("Footer", () => {
  it("resolves support, privacy, terms, and how-it-was-built links", () => {
    render(<Footer content={null} supportEmail="help@starlight.app" />);

    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href",
      "mailto:help@starlight.app",
    );
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      "/terms",
    );
    expect(
      screen.getByRole("link", { name: /how this site was built/i }),
    ).toHaveAttribute("href", siteConfig.footer.builtUrl);
  });

  it("falls back to the static support email and tagline", () => {
    render(<Footer content={null} />);

    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.footer.supportEmail}`,
    );
    expect(screen.getByText(siteConfig.footer.tagline)).toBeInTheDocument();
  });
});
