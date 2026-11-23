import { defineArrayMember, defineField } from "sanity";

const linkAnnotation = defineArrayMember({
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    defineField({
      name: "href",
      type: "url",
      title: "URL",
      validation: (rule) => rule.required(),
    }),
  ],
});

const emphasisDecorators = [
  { title: "Bold", value: "strong" },
  { title: "Italic", value: "em" },
];

// A deliberately minimal Portable Text field — body copy only (no headings, images,
// or lists), so FAQ answers stay prose and can't grow into full pages. Used anywhere
// the content model calls for "minimal Portable Text".
export function minimalPortableText(
  name: string,
  title: string,
  { required = false }: { required?: boolean } = {},
) {
  return defineField({
    name,
    title,
    type: "array",
    validation: (rule) => (required ? rule.required() : rule),
    of: [
      defineArrayMember({
        type: "block",
        styles: [{ title: "Normal", value: "normal" }],
        lists: [],
        marks: {
          decorators: emphasisDecorators,
          annotations: [linkAnnotation],
        },
      }),
    ],
  });
}

// The privacy/terms carve-out needs more structure than a blurb: legal copy is long
// enough to want section headings and the odd list. Still no images — these are
// prose documents, not page builders.
export function legalPortableText(
  name: string,
  title: string,
  { required = false }: { required?: boolean } = {},
) {
  return defineField({
    name,
    title,
    type: "array",
    validation: (rule) => (required ? rule.required() : rule),
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Normal", value: "normal" },
          { title: "Section heading", value: "h2" },
          { title: "Subheading", value: "h3" },
        ],
        lists: [
          { title: "Bulleted", value: "bullet" },
          { title: "Numbered", value: "number" },
        ],
        marks: {
          decorators: emphasisDecorators,
          annotations: [linkAnnotation],
        },
      }),
    ],
  });
}
