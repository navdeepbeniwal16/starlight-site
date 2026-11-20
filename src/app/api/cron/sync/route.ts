import { handleReconcile } from "@/lib/hubspot/reconcile-handler";

// Vercel Cron (see vercel.json) hits this every ~15 min to reconcile un-synced
// signups. Cron invocations are GET and carry the CRON_SECRET bearer token.
export const GET = handleReconcile;
