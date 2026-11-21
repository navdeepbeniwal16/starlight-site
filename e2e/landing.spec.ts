import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/lib/site";

// Structural, not copy-based: labels come from the CMS when it's configured and from
// static fallbacks otherwise, but the shape of the page is the same either way.
test("landing page renders the hero and a footer whose links resolve", async ({
  page,
}) => {
  await page.goto("/");

  const hero = page.locator("section").first();
  await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(hero.getByRole("button")).toHaveCount(2);

  // Footer link targets are wired in code, not the CMS, so they're safe to assert exactly.
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "/privacy",
  );
  await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute(
    "href",
    "/terms",
  );
  await expect(
    footer.getByRole("link", { name: /how this site was built/i }),
  ).toHaveAttribute("href", siteConfig.footer.builtUrl);
});
