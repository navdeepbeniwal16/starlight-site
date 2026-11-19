import { Segment } from "@/generated/prisma/enums";

// Minimal, intentionally unstyled forms that exercise both signup segments.
// Native POST + Post/Redirect/Get (no client JS): the launch form returns to the
// page with an inline status; the beta form follows the handler's 303 to
// TestFlight. Warm Editorial styling lands with the real UI ticket (#2 / #10).
export function SignupForms() {
  return (
    <div className="flex w-full flex-col gap-8 border-t border-black/10 pt-8 text-left dark:border-white/15">
      <SignupForm
        id="waitlist"
        segment={Segment.launch_waitlist}
        label="Notify me at launch"
        cta="Join the launch waitlist"
      />
      <SignupForm
        id="beta"
        segment={Segment.beta_tester}
        label="Get the iOS beta — 6 months free"
        cta="Join the beta"
      />
    </div>
  );
}

function SignupForm({
  id,
  segment,
  label,
  cta,
}: {
  id: string;
  segment: Segment;
  label: string;
  cta: string;
}) {
  const emailId = `${id}-email`;
  return (
    <form method="post" action="/api/signup" className="flex flex-col gap-2">
      <input type="hidden" name="segment" value={segment} />
      <label htmlFor={emailId}>{label}</label>
      <input
        id={emailId}
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        className="border px-2 py-1"
      />
      <button type="submit" className="border px-2 py-1">
        {cta}
      </button>
    </form>
  );
}
