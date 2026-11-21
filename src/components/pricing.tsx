import { siteConfig } from "@/lib/site";
import type { Pricing as PricingContent } from "@/sanity/lib/types";
import { Section } from "./section";

export function Pricing({
  content,
  tone = "beige",
  rule = false,
}: {
  content: PricingContent | null;
  tone?: "paper" | "beige";
  rule?: boolean;
}) {
  const heading = content?.heading ?? siteConfig.pricing.heading;
  const body = content?.body ?? siteConfig.pricing.body;
  const note = content?.note ?? siteConfig.pricing.note;

  return (
    <Section tone={tone} rule={rule}>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
        <h2 className="font-display text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
          {heading}
        </h2>
        {/* The pricing document has no price field; this comes from code, not the CMS. */}
        <p className="font-display text-6xl text-gold-ink">
          {siteConfig.pricing.price}
          <span className="ml-3 align-middle text-base font-normal text-muted">
            during the beta
          </span>
        </p>
        <p className="text-lg leading-8 text-muted">{body}</p>
        {note ? <p className="text-sm text-muted">{note}</p> : null}
      </div>
    </Section>
  );
}
