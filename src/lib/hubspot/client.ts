import { Segment } from "@/generated/prisma/enums";
import { createHubspotApiClient } from "./api";
import { noopHubspotClient } from "./noop";

export interface HubspotContact {
  email: string;
  segment: Segment;
}

export interface HubspotClient {
  /** Idempotent upsert-by-email into the list for the contact's segment. */
  upsertContact(contact: HubspotContact): Promise<void>;
}

export function getHubspotClient(): HubspotClient {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  return token ? createHubspotApiClient(token) : noopHubspotClient;
}
