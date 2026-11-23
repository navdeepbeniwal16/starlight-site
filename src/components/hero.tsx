import Image from "next/image";
import type { ReactNode } from "react";
import { Segment } from "@/generated/prisma/enums";
import { siteConfig } from "@/lib/site";
import { urlForImage } from "@/sanity/lib/image";
import type { CtaKind, Hero as HeroContent } from "@/sanity/lib/types";
import { DeviceFrame } from "./device-frame";
import { Eyebrow } from "./eyebrow";
import { Section } from "./section";
import { SignupForm, type SignupAction } from "./signup-form";

// The CMS speaks in CTA kinds; the signup route and store speak in segments.
const KIND_TO_SEGMENT: Record<CtaKind, Segment> = {
  beta: Segment.beta_tester,
  waitlist: Segment.launch_waitlist,
};

// Rendered when Sanity has no hero CTAs (local/CI, or before an editor publishes).
const DEFAULT_ACTIONS: SignupAction[] = [
  { segment: Segment.beta_tester, label: siteConfig.betaCta, variant: "primary" },
  {
    segment: Segment.launch_waitlist,
    label: siteConfig.waitlistCta,
    variant: "secondary",
  },
];

function toActions(cta: HeroContent["cta"]): SignupAction[] {
  if (!cta || cta.length === 0) return DEFAULT_ACTIONS;
  return cta.map((entry, index) => ({
    segment: KIND_TO_SEGMENT[entry.kind],
    label: entry.label,
    variant: index === 0 ? "primary" : "secondary",
  }));
}

export function Hero({
  hero,
  status,
}: {
  hero: HeroContent | null;
  status?: ReactNode;
}) {
  const eyebrow = hero?.eyebrow ?? siteConfig.eyebrow;
  const heading = hero?.heading ?? siteConfig.tagline;
  const subheading = hero?.subheading ?? siteConfig.description;
  const actions = toActions(hero?.cta ?? null);

  const poster = hero?.devicePoster ?? null;
  const posterUrl = poster
    ? (urlForImage(poster)?.width(720).auto("format").url() ?? null)
    : null;

  return (
    <Section tone="paper">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col items-start gap-6">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-display text-balance text-5xl leading-[1.05] tracking-[-0.01em] text-ink sm:text-6xl">
            {heading}
          </h1>
          <p className="text-lg leading-8 text-pretty text-muted">{subheading}</p>

          <div className="flex w-full flex-col gap-3 pt-2">
            <SignupForm id="hero" actions={actions} source="hero" />
            {status}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[18rem] md:max-w-[20rem]">
          <DeviceFrame>
            {poster && posterUrl ? (
              <Image
                src={posterUrl}
                alt={poster.alt}
                fill
                sizes="(min-width: 768px) 20rem, 18rem"
                className="object-cover"
                priority
              />
            ) : (
              <div aria-hidden="true" className="h-full w-full bg-screen" />
            )}
          </DeviceFrame>
        </div>
      </div>
    </Section>
  );
}
