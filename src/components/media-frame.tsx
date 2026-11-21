import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import type { FeatureMedia } from "@/sanity/lib/types";
import { DeviceFrame } from "./device-frame";

// The media rule for every section: play the clip when one is set, otherwise show the
// still. The clip reuses the still as its `poster`, so a section can gain a video in
// Sanity with no code change and the poster keeps standing in until it loads.
export function MediaFrame({
  media,
  sizes = "(min-width: 768px) 20rem, 18rem",
  priority = false,
}: {
  media: FeatureMedia;
  sizes?: string;
  priority?: boolean;
}) {
  const posterUrl =
    urlForImage(media.image)?.width(720).auto("format").url() ?? null;

  return (
    <DeviceFrame>
      {media.videoUrl ? (
        <video
          className="h-full w-full object-cover"
          poster={posterUrl ?? undefined}
          // A muted, looping clip autoplays as decoration; the poster alt names the scene.
          aria-label={media.image.alt}
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={media.videoUrl} />
        </video>
      ) : posterUrl ? (
        <Image
          src={posterUrl}
          alt={media.image.alt}
          fill
          sizes={sizes}
          className="object-cover"
          priority={priority}
        />
      ) : (
        <div aria-hidden="true" className="h-full w-full bg-screen" />
      )}
    </DeviceFrame>
  );
}
