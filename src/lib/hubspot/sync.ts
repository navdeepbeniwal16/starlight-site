import { prisma } from "@/lib/db";
import {
  getHubspotClient,
  type HubspotClient,
  type HubspotContact,
} from "./client";
import { MAX_SYNC_ATTEMPTS } from "./config";

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

export interface ReconcileResult {
  processed: number;
  synced: number;
  failed: number;
}

// Sweep un-synced rows and re-upsert them: the recovery path for signups whose
// write-path sync failed. Stamps synced_at on success, increments sync_attempts on
// failure, and skips rows past the soft cap so a permanently broken row is left for
// manual inspection instead of being retried forever. Drives the cron and /api/resync.
export async function reconcile(
  client: HubspotClient = getHubspotClient(),
  maxAttempts: number = MAX_SYNC_ATTEMPTS,
): Promise<ReconcileResult> {
  const pending = await prisma.signup.findMany({
    where: { syncedAt: null, syncAttempts: { lt: maxAttempts } },
  });

  let synced = 0;
  for (const row of pending) {
    try {
      await client.upsertContact({ email: row.email, segment: row.segment });
      await prisma.signup.update({
        where: { id: row.id },
        data: { syncedAt: new Date() },
      });
      synced++;
    } catch (error) {
      console.error("hubspot reconcile failed", { id: row.id, error });
      await prisma.signup.update({
        where: { id: row.id },
        data: { syncAttempts: { increment: 1 } },
      });
    }
  }

  return { processed: pending.length, synced, failed: pending.length - synced };
}
