import createImageUrlBuilder, {
  type SanityImageSource,
} from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

// Build responsive image URLs from a Sanity image reference (set width/quality/etc.
// on the returned builder). Returns null for a missing image so callers can skip it.
export function urlForImage(source: SanityImageSource | null | undefined) {
  return source ? builder.image(source) : null;
}
