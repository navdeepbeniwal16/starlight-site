import { Segment } from "@/generated/prisma/enums";

const SEGMENTS = new Set<string>(Object.values(Segment));

export function parseSegment(value: unknown): Segment | null {
  return typeof value === "string" && SEGMENTS.has(value)
    ? (value as Segment)
    : null;
}
