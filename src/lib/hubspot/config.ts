import { Segment } from "@/generated/prisma/enums";

const DEFAULT_MAX_SYNC_ATTEMPTS = 5;

// Soft retry cap: once a row has failed this many times, the cron sweep stops
// auto-retrying it and leaves it for manual inspection via /api/resync.
export const MAX_SYNC_ATTEMPTS = resolveMaxAttempts();

/** Each signup path maps to exactly one HubSpot list ("segment"). */
export function listIdForSegment(segment: Segment): string | undefined {
  switch (segment) {
    case Segment.launch_waitlist:
      return process.env.HUBSPOT_LAUNCH_WAITLIST_LIST_ID;
    case Segment.beta_tester:
      return process.env.HUBSPOT_BETA_TESTER_LIST_ID;
  }
}

function resolveMaxAttempts(): number {
  const parsed = Number(process.env.HUBSPOT_SYNC_MAX_ATTEMPTS);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_SYNC_ATTEMPTS;
}
