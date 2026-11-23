import { Segment } from "@/generated/prisma/enums";
import { siteConfig } from "@/lib/site";
import type { Beta as BetaContent } from "@/sanity/lib/types";
import { Eyebrow } from "./eyebrow";
import { Section } from "./section";
import { SignupForm } from "./signup-form";

export function Beta({ content }: { content: BetaContent | null }) {
  const heading = content?.heading ?? siteConfig.beta.heading;
  const body = content?.body ?? siteConfig.beta.body;
  const label = content?.cta?.label ?? siteConfig.beta.cta;

  return (
    <Section tone="ink" id="beta">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <Eyebrow>{siteConfig.beta.eyebrow}</Eyebrow>
        <h2 className="font-display text-balance text-3xl leading-tight tracking-[-0.01em] text-paper sm:text-4xl">
          {heading}
        </h2>
        <p className="text-lg leading-8 text-pretty text-paper/80">{body}</p>
        <div className="flex w-full max-w-md flex-col gap-3 pt-2">
          <SignupForm
            id="beta"
            source="beta"
            onDark
            centerActions
            actions={[{ segment: Segment.beta_tester, label }]}
          />
          <p className="text-sm text-paper/70">{siteConfig.beta.footnote}</p>
        </div>
      </div>
    </Section>
  );
}
