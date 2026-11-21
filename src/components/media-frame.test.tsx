import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FeatureMedia } from "@/sanity/lib/types";

// next/image needs the Next runtime; a plain img (built without JSX to dodge the
// no-img-element lint rule) is enough to assert the poster branch renders.
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    createElement("img", { src, alt }),
}));

// urlForImage needs a Sanity projectId that unit tests don't set; stub the builder.
vi.mock("@/sanity/lib/image", () => {
  const builder = {
    width: () => builder,
    auto: () => builder,
    url: () => "https://cdn.sanity.io/images/poster.jpg",
  };
  return { urlForImage: () => builder };
});

import { MediaFrame } from "./media-frame";

const image = {
  _type: "image",
  asset: { _ref: "image-abc", _type: "reference" },
  alt: "A planned day in Starlight",
} as unknown as FeatureMedia["image"];

describe("MediaFrame", () => {
  it("plays the clip and reuses the still as its poster when a video is set", () => {
    const media: FeatureMedia = {
      image,
      videoUrl: "https://cdn.sanity.io/files/clip.mp4",
    };
    const { container } = render(<MediaFrame media={media} />);

    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute(
      "poster",
      "https://cdn.sanity.io/images/poster.jpg",
    );
    expect(video?.querySelector("source")).toHaveAttribute("src", media.videoUrl);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("falls back to the poster still when no video is set", () => {
    const media: FeatureMedia = { image, videoUrl: null };
    const { container } = render(<MediaFrame media={media} />);

    expect(
      screen.getByRole("img", { name: "A planned day in Starlight" }),
    ).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
  });
});
