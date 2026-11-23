import type { Projects as ProjectsContent } from "@/sanity/lib/types";
import { Eyebrow } from "./eyebrow";
import { MediaFrame } from "./media-frame";
import { Section } from "./section";

export function Projects({
  content,
  tone = "paper",
}: {
  content: ProjectsContent;
  tone?: "paper" | "beige";
}) {
  const items = content.items ?? [];

  return (
    <Section tone={tone}>
      <div className="flex max-w-2xl flex-col gap-5">
        <h2 className="font-display text-balance text-3xl leading-tight tracking-[-0.01em] text-ink sm:text-4xl">
          {content.heading}
        </h2>
        {content.body ? (
          <p className="text-lg leading-8 text-pretty text-muted">{content.body}</p>
        ) : null}
      </div>

      {items.length > 0 ? (
        <ul className="mt-12 grid gap-12 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.heading} className="flex flex-col gap-5">
              <div className="mx-auto w-full max-w-[16rem]">
                <MediaFrame
                  media={item.featureMedia}
                  sizes="(min-width: 640px) 16rem, 18rem"
                />
              </div>
              <div className="flex flex-col gap-2">
                {item.eyebrow ? <Eyebrow>{item.eyebrow}</Eyebrow> : null}
                <h3 className="font-display text-xl text-ink">{item.heading}</h3>
                <p className="text-base leading-7 text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
