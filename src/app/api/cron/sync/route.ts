import { handleReconcile } from "@/lib/hubspot/reconcile-handler";

// Scheduled in vercel.json; Vercel Cron invokes it via GET.
export const GET = handleReconcile;
