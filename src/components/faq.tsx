import { siteConfig } from "@/lib/site";
import type { Faq as FaqContent } from "@/sanity/lib/types";
import { PortableText } from "./portable-text";
import { Section } from "./section";

// CMS answers arrive as Portable Text; the static fallback answers are plain strings.
type Answer = FaqContent["items"][number]["answer"] | string;

export function Faq({
  content,
  tone = "paper",
  rule = false,
}: {
  content: FaqContent | null;
  tone?: "paper" | "beige";
  rule?: boolean;
}) {
  const heading = content?.heading ?? siteConfig.faq.heading;
  const items: readonly { question: string; answer: Answer }[] =
    content?.items ?? siteConfig.faq.items;

  return (
    <Section tone={tone} rule={rule}>
      <h2 className="font-display text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
        {heading}
      </h2>
      <div className="mt-10 divide-y divide-hairline border-t border-hairline">
        {items.map(({ question, answer }) => (
          // <details> gives an accessible, JS-free accordion the server can render whole.
          <details key={question} className="group py-5">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg text-ink marker:content-['']">
              {question}
              <span
                aria-hidden="true"
                className="text-gold-ink transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="mt-3">
              {typeof answer === "string" ? (
                <p className="text-base leading-7 text-muted">{answer}</p>
              ) : (
                <PortableText value={answer} />
              )}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
