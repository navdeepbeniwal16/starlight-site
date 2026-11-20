import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { singletonTypes, structure } from "./src/sanity/structure";

// Config for the embedded Studio at /studio. The CLI (`sanity.cli.ts`) reuses the
// same projectId/dataset so `sanity` commands and the app stay in sync.
export default defineConfig({
  name: "default",
  title: "Starlight",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
    // Singletons can't be spawned from the global "Create new" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // Singletons are edited in place: no create/delete/duplicate, only publish-flow
    // actions, so there's always exactly one of each.
    actions: (input, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? input.filter(
            ({ action }) =>
              !!action && ["publish", "discardChanges", "restore"].includes(action),
          )
        : input,
  },
});
