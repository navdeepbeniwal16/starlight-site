import type { ReactNode } from "react";
import type { FeatureSection as FeatureSectionContent } from "@/sanity/lib/types";
import { Eyebrow } from "./eyebrow";
import { MediaFrame } from "./media-frame";
import { Section } from "./section";

export function FeatureSection({
  section,
  flip = false,
  tone = "paper",
  media,
}: {
  section: FeatureSectionContent;
  flip?: boolean;
  tone?: "paper" | "beige";
  media?: ReactNode;
}) {
  return (
    <Section tone={tone}>
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div
          className={`flex flex-col items-start gap-5 ${flip ? "md:order-2" : ""}`}
        >
          {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
          <h2 className="font-display text-balance text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
            {section.heading}
          </h2>
          <p className="text-lg leading-8 text-pretty text-muted">{section.body}</p>
        </div>

        <div
          className={`mx-auto w-full ${media ? "max-w-[20rem] md:max-w-[22rem]" : "max-w-[18rem] md:max-w-[20rem]"} ${flip ? "md:order-1" : ""}`}
        >
          {media ?? <MediaFrame media={section.featureMedia} />}
        </div>
      </div>
    </Section>
  );
}
