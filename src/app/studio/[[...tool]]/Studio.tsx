"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

// Keep the config import inside a client component: `sanity` is browser-only, and
// importing it from the server page would drag it into the RSC graph (where `swr`
// resolves to its `react-server` build and breaks the build).
export default function Studio() {
  return <NextStudio config={config} />;
}
