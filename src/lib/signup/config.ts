// Stubbed until #6 serves it from Sanity siteSettings.testFlightUrl. Kept in one
// place so both beta buttons (and the route handler) read a single source.
const STUB_TESTFLIGHT_URL = "https://testflight.apple.com/join/STUB";

export function testFlightUrl(): string {
  return process.env.TESTFLIGHT_URL ?? STUB_TESTFLIGHT_URL;
}
