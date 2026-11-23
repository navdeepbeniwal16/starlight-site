import { test, expect, type Locator } from "@playwright/test";

// The bot trap rejects anything submitted within 2s of the form rendering, so a real
// submission has to wait past that fill floor before clicking.
const FILL_FLOOR_MS = 2_100;

// The per-request token streams in after load, so wait for it before starting the
// fill-floor clock.
async function fillSignup(section: Locator, email: string): Promise<void> {
  await section.locator('input[name="email"]').fill(email);
  await section.getByRole("checkbox").check();
  await section.locator('input[name="sig"]').waitFor({ state: "attached" });
  await section.page().waitForTimeout(FILL_FLOOR_MS);
}

test("waitlist signup succeeds, and a repeat shows already-on-list", async ({
  page,
}) => {
  // Unique per run so a persistent database doesn't carry state between runs.
  const email = `waitlist-${Date.now()}@example.com`;
  await page.goto("/");

  const notify = page.locator("#notify");
  await notify.scrollIntoViewIfNeeded();
  await fillSignup(notify, email);
  await notify.getByRole("button", { name: /notify me/i }).click();

  await expect(page).toHaveURL(/status=joined/);
  await expect(
    page.locator("#notify").getByText(/you're in/i),
  ).toBeVisible();

  const repeat = page.locator("#notify");
  await fillSignup(repeat, email);
  await repeat.getByRole("button", { name: /notify me/i }).click();

  await expect(page).toHaveURL(/status=already/);
  await expect(
    page.locator("#notify").getByText(/you're already in/i),
  ).toBeVisible();
});

test("beta signup commits and redirects to TestFlight", async ({ page }) => {
  // Neutralise the external TestFlight hop so the redirect is assertable offline.
  await page.route(/testflight\.apple\.com/, (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "stub" }),
  );

  await page.goto("/");
  const beta = page.locator("#beta");
  await beta.scrollIntoViewIfNeeded();
  await fillSignup(beta, `beta-${Date.now()}@example.com`);
  await beta.getByRole("button", { name: /ios beta/i }).click();

  await page.waitForURL(/testflight\.apple\.com/);
  expect(page.url()).toContain("testflight.apple.com");
});
