import { Suspense } from "react";
import { siteConfig } from "@/lib/site";
import { SignupForms } from "./signup-forms";
import { SignupStatus } from "./signup-status";

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="flex max-w-xl flex-col items-center gap-6 text-center">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:border-white/15 dark:text-zinc-400">
          {siteConfig.name}
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          {siteConfig.tagline}
        </h1>
        <p className="text-balance text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          {siteConfig.description}
        </p>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
          {siteConfig.waitlistStatus}
        </p>
        {/* Streams in at request time so the static shell still prerenders
            under Cache Components (searchParams is a runtime API). */}
        <Suspense fallback={null}>
          <SignupStatus searchParams={searchParams} />
        </Suspense>
        <SignupForms />
      </div>
    </main>
  );
}
