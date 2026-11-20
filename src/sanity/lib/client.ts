import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// `useCdn` reads published content from Sanity's CDN — what the public site serves;
// the publish webhook revalidates the cache when editors publish. The `placeholder`
// projectId keeps `createClient` from throwing when the CMS is unconfigured; the
// fetch layer never actually calls this client in that state.
export const client = createClient({
  projectId: projectId || "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
