import { after } from "next/server";
import { Segment } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { syncSignup } from "@/lib/hubspot/sync";
import { testFlightUrl } from "@/lib/signup/config";
import { isValidEmail, normalizeEmail } from "@/lib/signup/email";
import { parseSegment } from "@/lib/signup/segment";
import { SIGNUP_STATUS } from "@/lib/signup/status";

// 303 forces the browser to GET the target after the POST (Post/Redirect/Get).
function redirect(location: string, base: string): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: new URL(location, base).toString() },
  });
}

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();

  const segment = parseSegment(form.get("segment"));
  if (!segment) {
    return new Response("Unknown signup segment", { status: 400 });
  }

  const rawEmail = String(form.get("email") ?? "");
  if (!isValidEmail(rawEmail)) {
    return redirect(`/?status=${SIGNUP_STATUS.invalid}`, request.url);
  }

  const email = normalizeEmail(rawEmail);
  const source = form.get("source");
  let created: boolean;
  try {
    // skipDuplicates compiles to ON CONFLICT DO NOTHING; count is 0 when the
    // (email, segment) row already exists.
    const { count } = await prisma.signup.createMany({
      data: [
        {
          email,
          segment,
          source: typeof source === "string" && source.length > 0 ? source : null,
        },
      ],
      skipDuplicates: true,
    });
    created = count === 1;
  } catch (error) {
    console.error("signup write failed", error);
    return redirect(`/?status=${SIGNUP_STATUS.error}`, request.url);
  }

  // Sync to HubSpot after the response is sent: a failure leaves synced_at = null
  // for the cron sweep and never costs the user their signup. Re-run on an existing
  // row too, so a repeat submit can recover a previously failed sync.
  after(() => syncSignup({ email, segment }));

  // Beta redirects to TestFlight whether the row was just created or already there.
  if (segment === Segment.beta_tester) {
    return redirect(testFlightUrl(), request.url);
  }

  return redirect(
    `/?status=${created ? SIGNUP_STATUS.joined : SIGNUP_STATUS.already}`,
    request.url,
  );
}
