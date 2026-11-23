import { defineArrayMember, defineField, defineType } from "sanity";
import { legalPortableText, minimalPortableText } from "./portableText";

// Reused building blocks ------------------------------------------------------

export const cta = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({
      name: "label",
      type: "string",
      // Soft cap: the button has to hold this on one line across breakpoints.
      validation: (rule) =>
        rule
          .required()
          .max(24)
          .warning("Keep CTA labels short (~24 chars) so they don't wrap."),
    }),
    defineField({
      name: "kind",
      title: "Signup path",
      type: "string",
      description: "Which signup flow this CTA routes to.",
      options: {
        list: [
          { title: "Beta (TestFlight)", value: "beta" },
          { title: "Waitlist", value: "waitlist" },
        ],
        layout: "radio",
      },
      initialValue: "waitlist",
      validation: (rule) => rule.required(),
    }),
  ],
});

export const featureMedia = defineType({
  name: "featureMedia",
  title: "Media",
  type: "object",
  fields: [
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      description: "Doubles as the poster frame when a video is set.",
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) =>
            rule.required().error("Alt text is required for accessibility."),
        }),
      ],
    }),
    defineField({
      name: "video",
      title: "Video (optional)",
      type: "file",
      options: { accept: "video/*" },
    }),
  ],
});

export const featureSection = defineType({
  name: "featureSection",
  title: "Feature section",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      validation: (rule) => rule.max(40).warning("Keep the eyebrow short."),
    }),
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) =>
        rule.required().max(80).warning("Long headings wrap awkwardly."),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.required().max(240).warning("Trim the body so it fits the layout."),
    }),
    defineField({
      name: "featureMedia",
      title: "Media",
      type: "featureMedia",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow", media: "featureMedia.image" },
  },
});

export const step = defineType({
  name: "step",
  title: "Step",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(60).warning("Keep step titles short."),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(200).warning("Keep step copy tight."),
    }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});

// Sections --------------------------------------------------------------------

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      validation: (rule) => rule.max(40).warning("Keep the eyebrow short."),
    }),
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) =>
        rule.required().max(80).warning("Long headings wrap awkwardly."),
    }),
    defineField({
      name: "subheading",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(200).warning("Keep the subheading tight."),
    }),
    defineField({
      name: "devicePoster",
      title: "Device scene",
      type: "image",
      description:
        "Phone screenshot shown in the hero's device frame. Doubles as the poster if a clip is added here later.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) =>
            rule.required().error("Alt text is required for accessibility."),
        }),
      ],
    }),
    defineField({
      name: "cta",
      title: "Call to action buttons",
      description: "The dual CTA — one beta button and one waitlist button.",
      type: "array",
      of: [defineArrayMember({ type: "cta" })],
      validation: (rule) =>
        rule.max(2).warning("The hero shows two CTAs: one beta, one waitlist."),
    }),
    defineField({
      name: "ctaFootnote",
      title: "CTA footnote",
      type: "string",
      description: "Reassurance line under the buttons (e.g. free during beta).",
      validation: (rule) => rule.max(120).warning("Keep the footnote short."),
    }),
  ],
});

export const howItWorks = defineType({
  name: "howItWorks",
  title: "How it works",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().max(80).warning("Keep the heading short."),
    }),
    defineField({
      name: "steps",
      type: "array",
      of: [defineArrayMember({ type: "step" })],
      // The layout is built around three steps; 2–4 keeps it from breaking.
      validation: (rule) =>
        rule.required().min(2).max(4).error("How it works needs 2–4 steps."),
    }),
  ],
});

export const projects = defineType({
  name: "projects",
  title: "Projects",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().max(80).warning("Keep the heading short."),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(280).warning("Trim the intro copy."),
    }),
    defineField({
      name: "items",
      title: "Showcased projects",
      type: "array",
      of: [defineArrayMember({ type: "featureSection" })],
    }),
  ],
});

export const beta = defineType({
  name: "beta",
  title: "Beta",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().max(80).warning("Keep the heading short."),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(280).warning("Trim the copy."),
    }),
    defineField({ name: "cta", type: "cta" }),
  ],
});

export const pricing = defineType({
  name: "pricing",
  title: "Pricing",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().max(80).warning("Keep the heading short."),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(280).warning("Trim the copy."),
    }),
    defineField({
      name: "note",
      type: "string",
      description: "Fine print under the price.",
      validation: (rule) => rule.max(120).warning("Keep the note short."),
    }),
  ],
});

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ item",
  type: "object",
  fields: [
    defineField({
      name: "question",
      type: "string",
      validation: (rule) => rule.required().max(120).warning("Keep questions short."),
    }),
    minimalPortableText("answer", "Answer", { required: true }),
  ],
  preview: { select: { title: "question" } },
});

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().max(80).warning("Keep the heading short."),
    }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [defineArrayMember({ type: "faqItem" })],
      validation: (rule) => rule.required().min(1),
    }),
  ],
});

export const finalCta = defineType({
  name: "finalCta",
  title: "Final CTA",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required().max(80).warning("Keep the heading short."),
    }),
    defineField({
      name: "body",
      type: "text",
      rows: 2,
      validation: (rule) => rule.max(200).warning("Keep it tight."),
    }),
    defineField({ name: "cta", type: "cta", validation: (rule) => rule.required() }),
  ],
});

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "object",
  fields: [
    defineField({
      name: "tagline",
      type: "string",
      validation: (rule) => rule.max(120).warning("Keep the tagline short."),
    }),
  ],
});

// One shape for both the privacy note and the terms, used twice inside the `legal`
// singleton. `updatedAt` surfaces the "last updated" line the routes render.
export const legalDocument = defineType({
  name: "legalDocument",
  title: "Legal document",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required().max(60).warning("Keep the title short."),
    }),
    defineField({
      name: "updatedAt",
      title: "Last updated",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    legalPortableText("body", "Body", { required: true }),
  ],
  preview: { select: { title: "title", subtitle: "updatedAt" } },
});
