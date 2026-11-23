import type { ReactNode } from "react";
import { Segment } from "@/generated/prisma/enums";
import { siteConfig } from "@/lib/site";
import type { FinalCta as FinalCtaContent } from "@/sanity/lib/types";
import { Section } from "./section";
import { SignupForm } from "./signup-form";

export function FinalCta({
  content,
  status,
  tone = "paper",
}: {
  content: FinalCtaContent | null;
  status?: ReactNode;
  tone?: "paper" | "beige";
}) {
  const heading = content?.heading ?? siteConfig.finalCta.heading;
  const body = content?.body ?? siteConfig.finalCta.body;
  const label = content?.cta?.label ?? siteConfig.finalCta.cta;

  return (
    <Section tone={tone} id="notify">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
        <h2 className="font-display text-balance text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
          {heading}
        </h2>
        <p className="text-lg leading-8 text-pretty text-muted">{body}</p>
        <div className="flex w-full max-w-md flex-col gap-3 pt-2">
          <SignupForm
            id="final"
            source="final"
            centerActions
            actions={[{ segment: Segment.launch_waitlist, label }]}
          />
          {status}
        </div>
      </div>
    </Section>
  );
}
