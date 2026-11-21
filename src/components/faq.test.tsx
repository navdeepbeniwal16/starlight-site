import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/lib/site";
import type { Faq as FaqContent } from "@/sanity/lib/types";
import { Faq } from "./faq";

const block = (text: string): FaqContent["items"][number]["answer"] => [
  {
    _type: "block",
    _key: "k",
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: "s", text, marks: [] }],
  },
];

describe("Faq", () => {
  it("renders Portable Text answers from the CMS", () => {
    const content: FaqContent = {
      heading: "Questions",
      items: [{ question: "Is it free?", answer: block("Yes, during the beta.") }],
    };
    render(<Faq content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Questions" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Is it free?")).toBeInTheDocument();
    expect(screen.getByText("Yes, during the beta.")).toBeInTheDocument();
  });

  it("falls back to static FAQ copy when the CMS has none", () => {
    render(<Faq content={null} />);

    expect(
      screen.getByRole("heading", { level: 2, name: siteConfig.faq.heading }),
    ).toBeInTheDocument();
    for (const { question } of siteConfig.faq.items) {
      expect(screen.getByText(question)).toBeInTheDocument();
    }
  });
});
