// Placeholder until #6 serves the real URL from Sanity siteSettings.
const STUB_TESTFLIGHT_URL = "https://testflight.apple.com/join/STUB";

export function testFlightUrl(): string {
  return process.env.TESTFLIGHT_URL ?? STUB_TESTFLIGHT_URL;
}
