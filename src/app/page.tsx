import { Suspense } from "react";
import { Beta } from "@/components/beta";
import { Faq } from "@/components/faq";
import { FeatureSection } from "@/components/feature-section";
import { FinalCta } from "@/components/final-cta";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Logo } from "@/components/logo";
import { Pricing } from "@/components/pricing";
import { Projects } from "@/components/projects";
import { getLandingPage, getSiteSettings } from "@/sanity/lib/fetch";
import { SignupStatus } from "./signup-status";

export default async function Home({ searchParams }: PageProps<"/">) {
  // Both are cached singleton fetches, so resolve them together.
  const [page, settings] = await Promise.all([
    getLandingPage(),
    getSiteSettings(),
  ]);
  const hero = page?.hero ?? null;
  const featureSections = page?.featureSections ?? [];
  const howItWorks = page?.howItWorks ?? null;
  const projects = page?.projects ?? null;

  // Flattening the sections into one list keeps the paper↔beige rhythm continuous from
  // the hero even when an editor leaves a section empty; fixed per-section tones would
  // double a band whenever one is missing.
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
          // Hero is paper, so the bands below alternate starting from beige.
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

        {/* The conversion run always renders (it's the page's reason for existing), so
            it falls back to static copy rather than disappearing when the CMS is empty.
            The dark beta band resets the rhythm, so the rest restarts from paper. */}
        <Beta content={page?.beta ?? null} />
        <Pricing content={page?.pricing ?? null} tone="paper" rule />
        <Faq content={page?.faq ?? null} tone="beige" rule />
        <FinalCta
          content={page?.finalCta ?? null}
          tone="paper"
          rule
          status={
            <Suspense fallback={null}>
              <SignupStatus searchParams={searchParams} />
            </Suspense>
          }
        />
      </main>
      <Footer content={page?.footer ?? null} supportEmail={settings?.supportEmail} />
    </>
  );
}
