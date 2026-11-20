import { reconcile } from "./sync";

// Vercel sends `Authorization: Bearer <CRON_SECRET>` on cron invocations; the same
// secret guards /api/resync. Fail closed when it's unset.
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return (
    secret !== undefined &&
    request.headers.get("authorization") === `Bearer ${secret}`
  );
}

export async function handleReconcile(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await reconcile());
}
