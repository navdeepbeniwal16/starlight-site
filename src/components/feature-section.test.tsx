import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FeatureSection as FeatureSectionContent } from "@/sanity/lib/types";

// MediaFrame owns the video/poster logic (covered in its own test); stub it so this
// test stays about the row — copy, and which side the media sits on.
vi.mock("./media-frame", () => ({
  MediaFrame: ({ media }: { media: FeatureSectionContent["featureMedia"] }) => (
    <div data-testid="media-frame">{media.image.alt}</div>
  ),
}));

import { FeatureSection } from "./feature-section";

const section: FeatureSectionContent = {
  eyebrow: "The plan",
  heading: "See your whole day at a glance",
  body: "Everything you meant to do, laid out as one calm, scrollable plan.",
  featureMedia: {
    image: { alt: "The plan screen" } as FeatureSectionContent["featureMedia"]["image"],
    videoUrl: null,
  },
};

describe("FeatureSection", () => {
  it("renders the eyebrow, heading, body and media", () => {
    render(<FeatureSection section={section} />);

    expect(screen.getByText("The plan")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: section.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText(section.body)).toBeInTheDocument();
    expect(screen.getByTestId("media-frame")).toHaveTextContent("The plan screen");
  });

  it("flips the media to the left on wide screens when asked", () => {
    const { rerender } = render(<FeatureSection section={section} flip={false} />);
    expect(screen.getByTestId("media-frame").parentElement).not.toHaveClass(
      "md:order-1",
    );

    rerender(<FeatureSection section={section} flip />);
    expect(screen.getByTestId("media-frame").parentElement).toHaveClass(
      "md:order-1",
    );
  });
});
