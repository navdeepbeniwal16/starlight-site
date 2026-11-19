import { test, expect } from "@playwright/test";
import { siteConfig } from "../src/lib/site";

test("placeholder page renders the tagline and waitlist status", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: siteConfig.tagline }),
  ).toBeVisible();
  await expect(page.getByText(siteConfig.waitlistStatus)).toBeVisible();
});
