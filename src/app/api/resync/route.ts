import { handleReconcile } from "@/lib/hubspot/reconcile-handler";

// Manual-recovery path: re-runs reconciliation on demand, protected by the same
// CRON_SECRET bearer token as the cron sweep.
export const POST = handleReconcile;
