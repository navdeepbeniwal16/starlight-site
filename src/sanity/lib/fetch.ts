import { cacheLife, cacheTag } from "next/cache";
import { isSanityConfigured } from "../env";
import { client } from "./client";
import { landingPageQuery, siteSettingsQuery } from "./queries";
import type { LandingPage, SiteSettings } from "./types";

// One tag for the whole CMS: a two-singleton site has no reason to revalidate
// pieces separately, so the publish webhook invalidates everything at once.
export const SANITY_CACHE_TAG = "sanity:content";

async function fetchFromSanity<T>(query: string): Promise<T> {
  "use cache";
  cacheTag(SANITY_CACHE_TAG);
  // Content changes rarely and the webhook invalidates on publish, so keep it in
  // the static shell indefinitely rather than polling on a timer.
  cacheLife("max");
  return client.fetch<T>(query);
}

// Both return null when Sanity isn't configured (local/CI, or before the project
// is wired up), so callers fall back to static copy instead of failing.
export async function getLandingPage(): Promise<LandingPage | null> {
  if (!isSanityConfigured) return null;
  return fetchFromSanity<LandingPage | null>(landingPageQuery);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured) return null;
  return fetchFromSanity<SiteSettings | null>(siteSettingsQuery);
}
