import { after } from "next/server";
import { Segment } from "@/generated/prisma/enums";
import {
  flushAnalytics,
  trackSignupCommitted,
  trackTestflightRedirect,
} from "@/lib/analytics/signup-events";
import { readUtmFromForm } from "@/lib/analytics/utm";
import { prisma } from "@/lib/db";
import { syncSignup } from "@/lib/hubspot/sync";
import {
  HONEYPOT_FIELD,
  isBotSubmission,
  SIGNATURE_FIELD,
  TIMESTAMP_FIELD,
} from "@/lib/signup/abuse";
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

// The identical response a real signup and a tripped bot both get, so a bot can't tell
// it was dropped. `created` only splits joined/already on the launch path; beta always
// redirects to TestFlight.
async function signupSuccess(
  segment: Segment,
  created: boolean,
  base: string,
): Promise<Response> {
  if (segment === Segment.beta_tester) {
    return redirect(await testFlightUrl(), base);
  }
  return redirect(
    `/?status=${created ? SIGNUP_STATUS.joined : SIGNUP_STATUS.already}`,
    base,
  );
}

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();

  const segment = parseSegment(form.get("segment"));
  if (!segment) {
    return new Response("Unknown signup segment", { status: 400 });
  }

  // Guard before email validation: a tripped bot gets the silent fake-success, never
  // the inline "invalid email" response that would reveal the trap. It deliberately fires
  // no analytics, so bots never enter the funnel or inflate the signup_committed count.
  if (
    isBotSubmission({
      honeypot: String(form.get(HONEYPOT_FIELD) ?? ""),
      timestamp: String(form.get(TIMESTAMP_FIELD) ?? ""),
      signature: String(form.get(SIGNATURE_FIELD) ?? ""),
      now: Date.now(),
    })
  ) {
    return signupSuccess(segment, true, request.url);
  }

  const rawEmail = String(form.get("email") ?? "");
  if (!isValidEmail(rawEmail)) {
    return redirect(`/?status=${SIGNUP_STATUS.invalid}`, request.url);
  }

  const email = normalizeEmail(rawEmail);
  const source = form.get("source");
  // A ticked consent box is the lawful basis for identifying this person downstream;
  // unticked still stores the signup, just without that basis.
  const consentAt = form.get("consent") === "true" ? new Date() : null;
  const utm = readUtmFromForm(form);
  // Country-level geo only: Vercel resolves the edge IP to an ISO code upstream, so we read
  // just the country and never touch — or store — the raw IP.
  const country = request.headers.get("x-vercel-ip-country") ?? undefined;
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
          consentAt,
          utmSource: utm.utm_source ?? null,
          utmMedium: utm.utm_medium ?? null,
          utmCampaign: utm.utm_campaign ?? null,
          utmTerm: utm.utm_term ?? null,
          utmContent: utm.utm_content ?? null,
        },
      ],
      skipDuplicates: true,
    });
    created = count === 1;
  } catch (error) {
    console.error("signup write failed", error);
    return redirect(`/?status=${SIGNUP_STATUS.error}`, request.url);
  }

  const consented = consentAt !== null;
  // Only a newly-created row fires signup_committed, so its per-segment count tracks the
  // table exactly; a repeat submit (already on the list) doesn't double-count.
  if (created) {
    trackSignupCommitted({ email, segment, consented, country });
  }
  // The beta path always 303s to TestFlight, so mark that funnel step for every real beta
  // submit — first-time or repeat.
  if (segment === Segment.beta_tester) {
    trackTestflightRedirect({ email, segment, consented, country });
  }

  // Unconditional, including an already-existing row, so a repeat submit can recover
  // a previously failed sync.
  after(() => syncSignup({ email, segment }));
  // Drain the queued analytics past the response — serverless has no background flush.
  after(() => flushAnalytics());

  return signupSuccess(segment, created, request.url);
}
