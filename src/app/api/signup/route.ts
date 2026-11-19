import { Segment } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { testFlightUrl } from "@/lib/signup/config";
import { isValidEmail, normalizeEmail } from "@/lib/signup/email";
import { parseSegment } from "@/lib/signup/segment";

// 303 forces the browser to GET the destination after the POST (Post/Redirect/Get),
// and is the exact status the beta path owes its acceptance criteria.
function redirect(location: string, base: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(location, base).toString() },
  });
}

// Durable-first capture: validate, commit to our Postgres system-of-record, then
// respond. The record is safe the instant it commits here; HubSpot sync (#3) is a
// downstream target, never a dependency of this success.
export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();

  const segment = parseSegment(form.get("segment"));
  if (!segment) {
    return new Response("Unknown signup segment", { status: 400 });
  }

  const rawEmail = String(form.get("email") ?? "");
  if (!isValidEmail(rawEmail)) {
    // No row is written; the page renders an inline error from ?status.
    return redirect("/?status=invalid", request.url);
  }

  const source = form.get("source");
  let created: boolean;
  try {
    // ON CONFLICT DO NOTHING on the unique (email, segment): one row, idempotent.
    // A repeat submit returns count 0 because the row is already durable.
    const { count } = await prisma.signup.createMany({
      data: [
        {
          email: normalizeEmail(rawEmail),
          segment,
          source: typeof source === "string" && source.length > 0 ? source : null,
        },
      ],
      skipDuplicates: true,
    });
    created = count === 1;
  } catch (error) {
    console.error("signup write failed", error);
    return redirect("/?status=error", request.url);
  }

  // Beta is durable now; send the browser to TestFlight whether this was the first
  // submit or a repeat (both leave exactly one committed row).
  if (segment === Segment.beta_tester) {
    return redirect(testFlightUrl(), request.url);
  }

  return redirect(created ? "/?status=joined" : "/?status=already", request.url);
}
