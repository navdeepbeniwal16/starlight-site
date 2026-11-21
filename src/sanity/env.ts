// Public Sanity connection values. An empty projectId means "no CMS wired up yet":
// the fetch layer short-circuits to null and the site falls back to static copy,
// mirroring how the HubSpot client no-ops when its token is unset.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

// One dataset for the whole site; published content is read through the CDN.
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

// Pin the API version so query result shapes can't shift under us; bump deliberately.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-02-19";

export const isSanityConfigured = projectId.length > 0;
