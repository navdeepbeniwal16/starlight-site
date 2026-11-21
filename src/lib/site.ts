// siteConfig holds the static fallbacks used until the CMS is filled in (local/CI, or
// before an editor publishes); Sanity content overrides every field at runtime.
export const siteConfig = {
  name: "Starlight",
  eyebrow: "Now in private beta",
  tagline: "Turn an endless to-do list into a focused day.",
  description:
    "Starlight turns the scramble of everything you have to do into one calm, focused plan for the day.",
  betaCta: "Get the iOS beta",
  waitlistCta: "Notify me at launch",
  ctaFootnote: "Free during the beta — no credit card, unsubscribe anytime.",
  beta: {
    eyebrow: "Private beta",
    heading: "Become a beta tester",
    body: "Join the private iOS beta, help shape Starlight, and get a head start before launch.",
    cta: "Get the iOS beta",
    footnote: "Beta testers keep six months free at launch — no credit card.",
  },
  footer: {
    tagline: "Turn an endless to-do list into a focused day.",
    supportEmail: "hello@starlight.app",
    builtUrl: "https://github.com/navdeepbeniwal16/starlight-site",
  },
  finalCta: {
    heading: "Be first to know at launch",
    body: "Drop your email and we'll tell you the moment Starlight is ready for you.",
    cta: "Notify me at launch",
  },
  pricing: {
    heading: "Pricing",
    price: "Free",
    body: "Starlight is free for everyone while we're in beta. Testers keep six months free when we launch.",
    note: "No credit card, no catch — just help us make it great.",
  },
  faq: {
    heading: "Before you ask",
    items: [
      {
        question: "Is it really free during the beta?",
        answer:
          "Yes — the beta is completely free, and testers keep six months free when Starlight launches.",
      },
      {
        question: "Which devices are supported?",
        answer:
          "Starlight is iOS-only for now. Join the waitlist and we'll tell you the moment Android lands.",
      },
      {
        question: "How do I get a beta invite?",
        answer:
          "Tap “Get the iOS beta”, drop your email, and we'll send you straight to a TestFlight invite.",
      },
      {
        question: "What happens to my data?",
        answer:
          "Your plans are yours. We never sell your data, and you can delete your account whenever you like.",
      },
    ],
  },
} as const;
