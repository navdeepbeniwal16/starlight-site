import { isSanityConfigured } from "@/sanity/env";
import Studio from "./Studio";

// The Studio is a client-rendered SPA: the server emits a static shell and it
// hydrates in the browser. Under Cache Components that's the default, so no route
// segment config is needed (and `dynamic` isn't allowed alongside it).
export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  // Booting the Studio needs a projectId; without one (a plain local or CI build)
  // show a notice instead of crashing the prerender.
  if (!isSanityConfigured) {
    return (
      <main className="flex flex-1 items-center justify-center p-10 text-center">
        <div className="max-w-md">
          <h1 className="text-lg font-semibold">Sanity Studio isn’t configured</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and{" "}
            <code>NEXT_PUBLIC_SANITY_DATASET</code>) to load the editor.
          </p>
        </div>
      </main>
    );
  }
  return <Studio />;
}
