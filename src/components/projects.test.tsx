import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type {
  FeatureSection,
  ImageWithAlt,
  Projects as ProjectsContent,
} from "@/sanity/lib/types";

// MediaFrame is tested on its own; stub it so this test stays about the projects grid.
vi.mock("./media-frame", () => ({
  MediaFrame: ({ media }: { media: { image: { alt: string } } }) => (
    <div data-testid="media-frame">{media.image.alt}</div>
  ),
}));

import { Projects } from "./projects";

const item = (heading: string, alt: string): FeatureSection => ({
  eyebrow: null,
  heading,
  body: `${heading} body copy.`,
  featureMedia: { image: { alt } as ImageWithAlt, videoUrl: null },
});

const content: ProjectsContent = {
  heading: "Built in public",
  body: "A few things we are shaping next.",
  items: [
    item("Shared plans", "Shared plan screen"),
    item("Weekly review", "Weekly review screen"),
  ],
};

describe("Projects", () => {
  it("renders the intro and one framed card per showcased project", () => {
    render(<Projects content={content} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Built in public" }),
    ).toBeInTheDocument();
    expect(screen.getByText(content.body!)).toBeInTheDocument();

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.getByRole("heading", { level: 3, name: "Shared plans" }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("media-frame")).toHaveLength(2);
  });

  it("renders the intro alone when there are no items", () => {
    render(<Projects content={{ ...content, items: null }} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Built in public" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});
