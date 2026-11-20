import type { HubspotClient } from "./client";

// Stands in for HubSpot when it's unconfigured and in tests: accepts every upsert
// and does nothing, so the sync path runs end to end without a network call.
export const noopHubspotClient: HubspotClient = {
  async upsertContact() {},
};
