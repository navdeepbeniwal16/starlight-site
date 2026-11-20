import { Suspense } from "react";
import { siteConfig } from "@/lib/site";
import { getLandingPage } from "@/sanity/lib/fetch";
import { SignupForms } from "./signup-forms";
import { SignupStatus } from "./signup-status";

export default async function Home({ searchParams }: PageProps<"/">) {
  // Published hero copy from Sanity; falls back to the static shell until the CMS
  // is wired up (or an editor fills it in).
  const hero = (await getLandingPage())?.hero;
  const eyebrow = hero?.eyebrow ?? siteConfig.name;
  const heading = hero?.heading ?? siteConfig.tagline;
  const subheading = hero?.subheading ?? siteConfig.description;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:border-white/15 dark:text-zinc-400">
          {eyebrow}
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {heading}
        </h1>
        <p className="text-balance text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {subheading}
        </p>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
          {siteConfig.waitlistStatus}
        </p>
        {/* searchParams is a runtime API; Cache Components requires the read to
            sit inside a Suspense boundary. */}
        <Suspense fallback={null}>
          <SignupStatus searchParams={searchParams} />
        </Suspense>
        <SignupForms />
      </div>
    </main>
  );
}
