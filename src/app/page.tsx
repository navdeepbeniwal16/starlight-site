import { Suspense } from "react";
import { FeatureSection } from "@/components/feature-section";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Logo } from "@/components/logo";
import { Projects } from "@/components/projects";
import { getLandingPage } from "@/sanity/lib/fetch";
import { SignupStatus } from "./signup-status";

export default async function Home({ searchParams }: PageProps<"/">) {
  const page = await getLandingPage();
  const hero = page?.hero ?? null;
  const featureSections = page?.featureSections ?? [];
  const howItWorks = page?.howItWorks ?? null;
  const projects = page?.projects ?? null;

  // The story reads top-to-bottom from Sanity: the feature beats, then the steps, then
  // the showcase. Assembling them as one ordered list lets the band tone alternate
  // continuously from the paper hero regardless of which sections an editor filled in.
  const sections = [
    ...featureSections.map((section, index) => ({
      kind: "feature" as const,
      key: `feature-${index}`,
      section,
      flip: index % 2 === 0,
    })),
    ...(howItWorks
      ? [{ kind: "howItWorks" as const, key: "how-it-works", content: howItWorks }]
      : []),
    ...(projects
      ? [{ kind: "projects" as const, key: "projects", content: projects }]
      : []),
  ];

  return (
    <>
      <header className="px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <Logo />
        </div>
      </header>
      <main className="flex-1">
        <Hero
          hero={hero}
          status={
            // searchParams is a runtime API; Cache Components requires the read to
            // sit inside a Suspense boundary.
            <Suspense fallback={null}>
              <SignupStatus searchParams={searchParams} />
            </Suspense>
          }
        />
        {sections.map((entry, index) => {
          // Hero is paper, so the first band below it is beige; a hairline rules each.
          const tone = index % 2 === 0 ? "beige" : "paper";
          switch (entry.kind) {
            case "feature":
              return (
                <FeatureSection
                  key={entry.key}
                  section={entry.section}
                  flip={entry.flip}
                  tone={tone}
                  rule
                />
              );
            case "howItWorks":
              return (
                <HowItWorks key={entry.key} content={entry.content} tone={tone} rule />
              );
            case "projects":
              return (
                <Projects key={entry.key} content={entry.content} tone={tone} rule />
              );
          }
        })}
      </main>
    </>
  );
}
