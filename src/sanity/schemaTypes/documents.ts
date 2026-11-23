import { defineArrayMember, defineField, defineType } from "sanity";
import { minimalPortableText } from "./portableText";

// The landing page is a structured singleton, not a page builder: code owns which
// sections exist and their order, Sanity owns the copy and media inside each.
export const landingPage = defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    defineField({ name: "hero", type: "hero", validation: (rule) => rule.required() }),
    defineField({
      name: "featureSections",
      title: "Feature sections",
      type: "array",
      of: [defineArrayMember({ type: "featureSection" })],
    }),
    defineField({ name: "howItWorks", type: "howItWorks" }),
    defineField({ name: "projects", type: "projects" }),
    defineField({ name: "beta", type: "beta" }),
    defineField({ name: "pricing", type: "pricing" }),
    defineField({ name: "faq", type: "faq" }),
    defineField({ name: "finalCta", type: "finalCta" }),
    defineField({ name: "footer", type: "footer" }),
    // Words land with the privacy route (a later ticket owns the copy); this ticket
    // just reserves the slot.
    minimalPortableText("privacyBlurb", "Privacy blurb"),
  ],
  preview: { prepare: () => ({ title: "Landing Page" }) },
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteTitle",
      type: "string",
      validation: (rule) => rule.required().max(60).warning("Keep the title short."),
    }),
    defineField({
      name: "metaDescription",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule
          .required()
          .max(160)
          .warning("Descriptions over ~160 chars get truncated in search results."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "socialHandle",
      type: "string",
      description: "e.g. @starlight",
    }),
    defineField({
      name: "supportEmail",
      type: "string",
      validation: (rule) => rule.email().error("Enter a valid email address."),
    }),
    defineField({
      name: "testFlightUrl",
      title: "TestFlight URL",
      type: "url",
      description: "The single source of truth for the beta invite link.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});

// The legal carve-out to the one-page site: /privacy and /terms each render one of these.
export const legal = defineType({
  name: "legal",
  title: "Legal",
  type: "document",
  fields: [
    defineField({
      name: "privacy",
      title: "Privacy",
      type: "legalDocument",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "terms",
      title: "Terms",
      type: "legalDocument",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { prepare: () => ({ title: "Legal" }) },
});
