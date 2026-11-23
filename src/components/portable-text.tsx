import {
  PortableText as PortableTextBase,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";

// Renders both Portable Text variants in the content model: the minimal one (FAQ
// answers — normal blocks, bold/italic, links) and the legal one (/privacy, /terms —
// adds section headings and lists). Paragraph spacing keys off `:not(:first-child)` so
// a single-paragraph FAQ answer stays flush while stacked legal copy gets its gaps.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-7 text-muted [&:not(:first-child)]:mt-4">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-10 font-display text-xl leading-snug text-ink first:mt-0 sm:text-2xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 font-display text-lg text-ink first:mt-0">{children}</h3>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-base leading-7 text-muted marker:text-gold-ink">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-base leading-7 text-muted marker:text-gold-ink">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-ink">{children}</strong>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        className="text-gold-ink underline underline-offset-2 hover:text-ink"
      >
        {children}
      </a>
    ),
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] }) {
  return <PortableTextBase value={value} components={components} />;
}
