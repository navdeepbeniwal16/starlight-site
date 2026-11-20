import { prisma } from "@/lib/db";
import {
  getHubspotClient,
  type HubspotClient,
  type HubspotContact,
} from "./client";

// Best-effort CRM sync, run off the response path via after(). A failure just
// leaves synced_at = null for the cron sweep to reconcile; the signup already
// committed, so never rethrow — this runs after the response is sent.
export async function syncSignup(
  contact: HubspotContact,
  client: HubspotClient = getHubspotClient(),
): Promise<void> {
  try {
    await client.upsertContact(contact);
    await prisma.signup.update({
      where: { email_segment: { email: contact.email, segment: contact.segment } },
      data: { syncedAt: new Date() },
    });
  } catch (error) {
    console.error("hubspot sync failed", {
      email: contact.email,
      segment: contact.segment,
      error,
    });
  }
}
