import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/lib/site";

test("landing page renders the hero headline and the dual CTA", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: siteConfig.tagline }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: siteConfig.betaCta }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: siteConfig.waitlistCta }),
  ).toBeVisible();
});
