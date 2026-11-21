import type { PortableTextBlock } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";

// Hand-written to match the GROQ projections in `queries.ts`. Keep the two in sync:
// a field added to a projection should gain a property here (and vice versa).

export type CtaKind = "beta" | "waitlist";

export interface Cta {
  label: string;
  kind: CtaKind;
}

// A Sanity image projected with its (required) alt text. It stays a valid
// `SanityImageSource`, so it can be passed straight to `urlForImage`.
export type ImageWithAlt = SanityImageSource & { alt: string };

export interface FeatureMedia {
  image: ImageWithAlt;
  videoUrl: string | null;
}

export interface FeatureSection {
  eyebrow: string | null;
  heading: string;
  body: string;
  featureMedia: FeatureMedia;
}

export interface Hero {
  eyebrow: string | null;
  heading: string;
  subheading: string | null;
  devicePoster: ImageWithAlt | null;
  cta: Cta[] | null;
  ctaFootnote: string | null;
}

export interface Step {
  title: string;
  body: string;
}

export interface HowItWorks {
  heading: string;
  steps: Step[];
}

export interface Projects {
  heading: string;
  body: string | null;
  items: FeatureSection[] | null;
}

export interface Beta {
  heading: string;
  body: string | null;
  cta: Cta | null;
}

export interface Pricing {
  heading: string;
  body: string | null;
  note: string | null;
}

export interface FaqItem {
  question: string;
  answer: PortableTextBlock[];
}

export interface Faq {
  heading: string;
  items: FaqItem[];
}

export interface FinalCta {
  heading: string;
  body: string | null;
  cta: Cta;
}

export interface Footer {
  tagline: string | null;
}

export interface LandingPage {
  hero: Hero;
  featureSections: FeatureSection[] | null;
  howItWorks: HowItWorks | null;
  projects: Projects | null;
  beta: Beta | null;
  pricing: Pricing | null;
  faq: Faq | null;
  finalCta: FinalCta | null;
  footer: Footer | null;
  privacyBlurb: PortableTextBlock[] | null;
}

export interface SiteSettings {
  siteTitle: string;
  metaDescription: string;
  ogImage: ImageWithAlt | null;
  socialHandle: string | null;
  supportEmail: string | null;
  testFlightUrl: string | null;
}
