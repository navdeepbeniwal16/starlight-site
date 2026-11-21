import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";
import type { FeatureMedia } from "@/sanity/lib/types";
import { DeviceFrame } from "./device-frame";

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
