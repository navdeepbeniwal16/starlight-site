import { getSiteSettings } from "@/sanity/lib/fetch";

const STUB_TESTFLIGHT_URL = "https://testflight.apple.com/join/STUB";

// siteSettings is the single source of truth for the beta invite link. Fall back to
// the env var (local/CI, where Sanity isn't configured) and finally the stub, so the
// beta redirect always resolves to something.
export async function testFlightUrl(): Promise<string> {
  const settings = await getSiteSettings();
  return settings?.testFlightUrl ?? process.env.TESTFLIGHT_URL ?? STUB_TESTFLIGHT_URL;
}
