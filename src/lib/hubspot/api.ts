import type { HubspotClient } from "./client";
import { listIdForSegment } from "./config";

const API_BASE = "https://api.hubapi.com";

// Deliberately untested: there's no HubSpot in CI, so the boundary is covered
// through the no-op fake instead.
export function createHubspotApiClient(token: string): HubspotClient {
  async function call(method: string, path: string, body: unknown): Promise<Response> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`HubSpot ${method} ${path} failed: ${res.status} ${await res.text()}`);
    }
    return res;
  }

  return {
    async upsertContact({ email, segment }) {
      const listId = listIdForSegment(segment);
      if (!listId) {
        throw new Error(`No HubSpot list configured for segment ${segment}`);
      }

      const upsert = await call("POST", "/crm/v3/objects/contacts/batch/upsert", {
        inputs: [{ idProperty: "email", id: email, properties: { email } }],
      });
      const { results } = (await upsert.json()) as { results?: { id: string }[] };
      const contactId = results?.[0]?.id;
      if (!contactId) {
        throw new Error(`HubSpot upsert returned no contact id for ${email}`);
      }

      await call("PUT", `/crm/v3/lists/${listId}/memberships/add`, [contactId]);
    },
  };
}
