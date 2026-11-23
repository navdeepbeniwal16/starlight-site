"use client";

import { type ReactNode, useEffect, useState } from "react";
import type { Segment } from "@/generated/prisma/enums";
import {
  captureCtaClick,
  captureFirstTouchUtm,
  captureSignupSubmitted,
  identifySignup,
} from "@/lib/analytics/posthog-client";
import { UTM_KEYS, type Utm } from "@/lib/analytics/utm";
import { HONEYPOT_FIELD } from "@/lib/signup/abuse";

export type SignupAction = {
  segment: Segment;
  label: string;
  variant?: "primary" | "secondary";
};

export type SignupFormProps = {
  id: string;
  actions: SignupAction[];
  // Stored verbatim by the signup route as the signup's source column, and used as the
  // cta_click `location`.
  source?: string;
  onDark?: boolean;
  centerActions?: boolean;
  consentLabel?: string;
};

function buttonClass(
  variant: "primary" | "secondary",
  onDark: boolean,
): string {
  const base =
    "inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition-[color,background-color,scale] active:scale-[0.96] sm:w-auto";
  // Gold fills the primary button with ink text for AA contrast; it's never the text colour.
  if (variant === "primary") {
    return `${base} bg-gold text-ink hover:bg-gold-ink hover:text-paper`;
  }
  return onDark
    ? `${base} border border-paper/50 text-paper hover:bg-paper hover:text-ink`
    : `${base} border border-ink/70 text-ink hover:bg-ink hover:text-paper`;
}

// The interactive half of the signup form: it keeps the native POST (so a no-JS visitor can
// still sign up) and layers the client analytics on top — cta_click per button, then
// signup_submitted + a consented identify once the browser's own validation passes. The
// per-request bot-trap token renders on the server and arrives as `children`.
export function SignupFormClient({
  id,
  actions,
  source,
  onDark = false,
  centerActions = false,
  consentLabel = "I agree to be contacted about Starlight and accept the privacy note.",
  children,
}: SignupFormProps & { children: ReactNode }) {
  const emailId = `${id}-email`;
  const consentId = `${id}-consent`;
  const honeypotId = `${id}-${HONEYPOT_FIELD}`;
  const location = source ?? id;

  // Resolved once on mount (sessionStorage/URL) rather than during render, so the hidden
  // fields match between the server shell and first client render — then fill in afterwards.
  const [utm, setUtm] = useState<Utm>({});
  useEffect(() => {
    setUtm(captureFirstTouchUtm());
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    // The segment rides on the clicked button; Enter-to-submit falls back to the first.
    const segment = (submitter?.value ?? actions[0]?.segment) as Segment;
    captureSignupSubmitted(segment);

    const consent = form.elements.namedItem("consent");
    const email = form.elements.namedItem("email");
    const consented = consent instanceof HTMLInputElement && consent.checked;
    const value = email instanceof HTMLInputElement ? email.value : "";
    if (consented && value) {
      identifySignup(value, segment, utm);
    }
    // Native POST proceeds; PostHog drains the queued events on pagehide via sendBeacon.
  }

  return (
    <form
      method="post"
      action="/api/signup"
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3"
    >
      {source ? <input type="hidden" name="source" value={source} /> : null}
      {UTM_KEYS.map((key) =>
        utm[key] ? (
          <input key={key} type="hidden" name={key} value={utm[key]} />
        ) : null,
      )}
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

      <label
        htmlFor={consentId}
        className={`flex items-start gap-1.5 text-sm ${onDark ? "text-paper/70" : "text-muted"}`}
      >
        <input
          id={consentId}
          type="checkbox"
          name="consent"
          value="true"
          required
          className="mt-1 shrink-0 accent-gold-ink"
        />
        <span>{consentLabel}</span>
      </label>

      <div
        className={`flex flex-col gap-2 sm:flex-row ${centerActions ? "sm:justify-center" : ""}`}
      >
        {actions.map((action) => (
          <button
            key={action.segment}
            type="submit"
            name="segment"
            value={action.segment}
            onClick={() => captureCtaClick(action.segment, location)}
            className={buttonClass(action.variant ?? "primary", onDark)}
          >
            {action.label}
          </button>
        ))}
      </div>

      {children}
    </form>
  );
}
