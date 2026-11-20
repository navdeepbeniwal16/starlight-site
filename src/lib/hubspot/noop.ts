import type { HubspotClient } from "./client";

export const noopHubspotClient: HubspotClient = {
  async upsertContact() {},
};
