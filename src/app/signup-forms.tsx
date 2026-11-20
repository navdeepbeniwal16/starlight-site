import { Suspense } from "react";
import { Segment } from "@/generated/prisma/enums";
import { HONEYPOT_FIELD } from "@/lib/signup/abuse";
import { SignupToken } from "./signup-token";

// Intentionally minimal and unstyled; the Warm Editorial UI lands in #2 / #10.
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
  const honeypotId = `${id}-${HONEYPOT_FIELD}`;
  return (
    <form method="post" action="/api/signup" className="flex flex-col gap-2">
      <input type="hidden" name="segment" value={segment} />
      {/* Honeypot: a decoy the markup hides from humans and assistive tech but a bot
          fills. Deliberately a real text input — type=hidden would tip off the bot. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={honeypotId}>Leave this field empty</label>
        <input
          id={honeypotId}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
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
      <Suspense fallback={null}>
        <SignupToken />
      </Suspense>
      <button type="submit" className="border px-2 py-1">
        {cta}
      </button>
    </form>
  );
}
