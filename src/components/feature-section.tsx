import type { FeatureSection as FeatureSectionContent } from "@/sanity/lib/types";
import { Eyebrow } from "./eyebrow";
import { MediaFrame } from "./media-frame";
import { Section } from "./section";

// One story beat: copy beside a device-framed clip or screenshot. `flip` moves the
// media to the left on wide screens so successive beats alternate sides; on mobile the
// copy always leads and the media stacks under it, keeping one idea per screen.
export function FeatureSection({
  section,
  flip = false,
  tone = "paper",
  rule = false,
}: {
  section: FeatureSectionContent;
  flip?: boolean;
  tone?: "paper" | "beige";
  rule?: boolean;
}) {
  return (
    <Section tone={tone} rule={rule}>
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div
          className={`flex flex-col items-start gap-5 ${flip ? "md:order-2" : ""}`}
        >
          {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
          <h2 className="font-display text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
            {section.heading}
          </h2>
          <p className="text-lg leading-8 text-muted">{section.body}</p>
        </div>

        <div
          className={`mx-auto w-full max-w-[18rem] md:max-w-[20rem] ${flip ? "md:order-1" : ""}`}
        >
          <MediaFrame media={section.featureMedia} />
        </div>
      </div>
    </Section>
  );
}
