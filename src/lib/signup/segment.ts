import { Segment } from "@/generated/prisma/enums";

const SEGMENTS = new Set<string>(Object.values(Segment));

/**
 * Narrow untrusted form input to a known {@link Segment}, or null. Pure enums
 * import (not the client) so this stays usable in any runtime.
 */
export function parseSegment(value: unknown): Segment | null {
  return typeof value === "string" && SEGMENTS.has(value)
    ? (value as Segment)
    : null;
}
