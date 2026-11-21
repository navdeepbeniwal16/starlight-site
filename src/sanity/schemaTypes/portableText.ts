import { defineArrayMember, defineField } from "sanity";

// A deliberately minimal Portable Text field — body copy only (no headings, images,
// or lists), so FAQ answers and the privacy blurb stay prose and can't grow into
// full pages. Used anywhere the content model calls for "minimal Portable Text".
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
          decorators: [
            { title: "Bold", value: "strong" },
            { title: "Italic", value: "em" },
          ],
          annotations: [
            defineArrayMember({
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
            }),
          ],
        },
      }),
    ],
  });
}
