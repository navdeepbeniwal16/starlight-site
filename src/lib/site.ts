// Static fallbacks used wherever the CMS hasn't been filled in (local/CI, or before
// an editor publishes). Sanity content overrides every one of these at runtime.
export const siteConfig = {
  name: "Starlight",
  eyebrow: "Now in private beta",
  tagline: "Turn an endless to-do list into a focused day.",
  description:
    "Starlight turns the scramble of everything you have to do into one calm, focused plan for the day.",
  betaCta: "Get the iOS beta",
  waitlistCta: "Notify me at launch",
  ctaFootnote: "Free during the beta — no credit card, unsubscribe anytime.",
} as const;
