import type { StructureResolver } from "sanity/structure";

// The singletons pinned in the desk. Everything else in the model is an object nested
// inside these, so these are the only top-level documents an editor opens.
export const SINGLETONS = [
  { id: "siteSettings", title: "Site Settings", schemaType: "siteSettings" },
  { id: "landingPage", title: "Landing Page", schemaType: "landingPage" },
  { id: "legal", title: "Legal", schemaType: "legal" },
] as const;

export const singletonTypes = new Set<string>(SINGLETONS.map((s) => s.schemaType));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items(
      SINGLETONS.map((singleton) =>
        S.listItem()
          .title(singleton.title)
          .id(singleton.id)
          .child(
            S.document()
              .schemaType(singleton.schemaType)
              .documentId(singleton.id),
          ),
      ),
    );
