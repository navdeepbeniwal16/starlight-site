import { Suspense } from "react";
import type { Segment } from "@/generated/prisma/enums";
import { HONEYPOT_FIELD } from "@/lib/signup/abuse";
import { SignupToken } from "./signup-token";

export type SignupAction = {
  segment: Segment;
  label: string;
  variant?: "primary" | "secondary";
};

function buttonClass(
  variant: "primary" | "secondary",
  onDark: boolean,
): string {
  const base =
    "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-colors sm:w-auto";
  // Gold fills the primary button with ink text for AA contrast; it's never the text colour.
  if (variant === "primary") {
    return `${base} bg-gold text-ink hover:bg-gold-ink hover:text-paper`;
  }
  return onDark
    ? `${base} border border-paper/50 text-paper hover:bg-paper hover:text-ink`
    : `${base} border border-ink/70 text-ink hover:bg-ink hover:text-paper`;
}

// SignupForm gives each submit button its own segment name/value, so one form drives a
// single CTA or the hero's dual CTA — the server reads whichever button was pressed.
export function SignupForm({
  id,
  actions,
  source,
  onDark = false,
  consentLabel = "I agree to be contacted about Starlight and accept the privacy note.",
}: {
  id: string;
  actions: SignupAction[];
  // Stored verbatim by the signup route as the signup's source column.
  source?: string;
  onDark?: boolean;
  consentLabel?: string;
}) {
  const emailId = `${id}-email`;
  const consentId = `${id}-consent`;
  const honeypotId = `${id}-${HONEYPOT_FIELD}`;
  return (
    <form method="post" action="/api/signup" className="flex w-full flex-col gap-3">
      {source ? <input type="hidden" name="source" value={source} /> : null}
      {/* Honeypot: a decoy the markup hides from humans and assistive tech but a bot
          fills. Deliberately a real text input — type=hidden would tip off the bot. */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor={honeypotId}>Leave this field empty</label>
        <input
          id={honeypotId}
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label htmlFor={emailId} className="sr-only">
        Email address
      </label>
      <input
        id={emailId}
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="jordan.rivera@gmail.com"
        className="w-full rounded-full border border-hairline bg-paper px-5 py-3 text-ink placeholder:text-muted focus:border-gold-ink focus:outline-none"
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        {actions.map((action) => (
          <button
            key={action.segment}
            type="submit"
            name="segment"
            value={action.segment}
            className={buttonClass(action.variant ?? "primary", onDark)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <label
        htmlFor={consentId}
        className={`flex items-start gap-2 text-sm ${onDark ? "text-paper/70" : "text-muted"}`}
      >
        <input
          id={consentId}
          type="checkbox"
          name="consent"
          value="true"
          required
          className="mt-1 accent-gold-ink"
        />
        <span>{consentLabel}</span>
      </label>

      <Suspense fallback={null}>
        <SignupToken />
      </Suspense>
    </form>
  );
}
