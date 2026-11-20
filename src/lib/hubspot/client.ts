import { Segment } from "@/generated/prisma/enums";
import { createHubspotApiClient } from "./api";
import { hubspotAccessToken } from "./config";
import { noopHubspotClient } from "./noop";

export interface HubspotContact {
  email: string;
  segment: Segment;
}

export interface HubspotClient {
  /** Idempotent upsert-by-email into the list for the contact's segment. */
  upsertContact(contact: HubspotContact): Promise<void>;
}

// The real client only when a token is configured; everywhere else — local dev,
// CI, tests, unconfigured previews — a no-op, so nothing reaches HubSpot by
// accident. The seam lets tests swap in a fake without touching the network.
export function getHubspotClient(): HubspotClient {
  const token = hubspotAccessToken();
  return token ? createHubspotApiClient(token) : noopHubspotClient;
}
