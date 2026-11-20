import { prisma } from "@/lib/db";
import {
  getHubspotClient,
  type HubspotClient,
  type HubspotContact,
} from "./client";
import { MAX_SYNC_ATTEMPTS } from "./config";

// Runs in after(), past the sent response, so never rethrow: a failure just leaves
// synced_at = null for the cron sweep to reconcile.
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

// Recovery sweep for signups whose write-path sync failed. The soft cap bounds the
// retries: rows at or past it are skipped, not retried forever.
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
