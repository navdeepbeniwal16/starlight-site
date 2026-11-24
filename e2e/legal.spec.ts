import { test, expect } from "@playwright/test";

// Structural, like landing.spec: the copy comes from the CMS or the static fallback,
// but both legal routes resolve from the footer and render a heading either way.
test("footer privacy and terms links resolve to their routes", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("contentinfo").getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.getByRole("contentinfo").getByRole("link", { name: "Terms" }).click();
  await expect(page).toHaveURL(/\/terms$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
