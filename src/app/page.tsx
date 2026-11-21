import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { Logo } from "@/components/logo";
import { getLandingPage } from "@/sanity/lib/fetch";
import { SignupStatus } from "./signup-status";

export default async function Home({ searchParams }: PageProps<"/">) {
  const hero = (await getLandingPage())?.hero ?? null;

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
      </main>
    </>
  );
}
