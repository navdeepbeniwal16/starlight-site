import type { HowItWorks as HowItWorksContent } from "@/sanity/lib/types";
import { Section } from "./section";

export function HowItWorks({
  content,
  tone = "beige",
  rule = false,
}: {
  content: HowItWorksContent;
  tone?: "paper" | "beige";
  rule?: boolean;
}) {
  return (
    <Section tone={tone} rule={rule}>
      <h2 className="font-display text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
        {content.heading}
      </h2>
      <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {content.steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3">
            <span className="font-display text-2xl text-gold-ink">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-xl text-ink">{step.title}</h3>
            <p className="text-base leading-7 text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
