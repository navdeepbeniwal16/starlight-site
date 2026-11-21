import {
  PortableText as PortableTextBase,
  type PortableTextComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";

// The content model (minimalPortableText) only emits normal blocks, bold/italic marks,
// and links, so those are the only cases that need styling here.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base leading-7 text-muted">{children}</p>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      // Editor links are arbitrary URLs, so treat them all as external and keep the tab.
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
