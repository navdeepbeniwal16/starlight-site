import { describe, expect, it } from "vitest";
import { Segment } from "@/generated/prisma/enums";
import { parseSegment } from "./segment";

describe("parseSegment", () => {
  it("accepts the launch_waitlist value", () => {
    expect(parseSegment("launch_waitlist")).toBe(Segment.launch_waitlist);
  });

  it("accepts the beta_tester value", () => {
    expect(parseSegment("beta_tester")).toBe(Segment.beta_tester);
  });

  it.each([null, undefined, "", "BETA_TESTER", "admin", 42])(
    "rejects %j",
    (value) => {
      expect(parseSegment(value)).toBeNull();
    },
  );
});
