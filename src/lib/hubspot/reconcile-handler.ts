import { reconcile } from "./sync";

// Vercel sets `Authorization: Bearer <CRON_SECRET>` on cron invocations; the same
// secret guards the manual /api/resync path. Fail closed when it's unset, so an
// unconfigured deploy never exposes an open reconciliation trigger.
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return (
    secret !== undefined &&
    request.headers.get("authorization") === `Bearer ${secret}`
  );
}

/** Shared handler behind the Vercel Cron sweep and /api/resync. */
export async function handleReconcile(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await reconcile());
}
