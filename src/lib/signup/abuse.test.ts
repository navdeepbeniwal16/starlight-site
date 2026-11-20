import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isBotSubmission,
  issueFormToken,
  signTimestamp,
  verifyTimestamp,
} from "./abuse";

beforeEach(() => {
  vi.stubEnv("SIGNUP_FORM_SECRET", "test-secret");
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("signTimestamp / verifyTimestamp", () => {
  const ts = 1_700_000_000_000;

  it("round-trips a signature it produced", () => {
    expect(verifyTimestamp(ts, signTimestamp(ts))).toBe(true);
  });

  it("rejects a signature bound to a different timestamp", () => {
    expect(verifyTimestamp(ts + 1, signTimestamp(ts))).toBe(false);
  });

  it("rejects a signature made under a different secret", () => {
    const signature = signTimestamp(ts);
    vi.stubEnv("SIGNUP_FORM_SECRET", "other-secret");
    expect(verifyTimestamp(ts, signature)).toBe(false);
  });

  it("rejects a malformed signature without throwing", () => {
    expect(verifyTimestamp(ts, "not-a-real-signature")).toBe(false);
  });
});

describe("isBotSubmission", () => {
  const now = 1_700_000_100_000;

  // A genuine, unhurried submission: empty honeypot, token minted well before now.
  function genuine() {
    const { timestamp, signature } = issueFormToken(now - 10_000);
    return { honeypot: "", timestamp: String(timestamp), signature, now };
  }

  it("passes a genuine submission", () => {
    expect(isBotSubmission(genuine())).toBe(false);
  });

  it("trips on a filled honeypot", () => {
    expect(isBotSubmission({ ...genuine(), honeypot: "http://spam.example" })).toBe(
      true,
    );
  });

  it("trips on a submission faster than the fill floor", () => {
    const { timestamp, signature } = issueFormToken(now - 500);
    expect(
      isBotSubmission({ honeypot: "", timestamp: String(timestamp), signature, now }),
    ).toBe(true);
  });

  it("trips on an expired token", () => {
    const { timestamp, signature } = issueFormToken(now - 3 * 60 * 60 * 1000);
    expect(
      isBotSubmission({ honeypot: "", timestamp: String(timestamp), signature, now }),
    ).toBe(true);
  });

  it("trips on a tampered timestamp its signature no longer covers", () => {
    const g = genuine();
    expect(
      isBotSubmission({ ...g, timestamp: String(Number(g.timestamp) + 1) }),
    ).toBe(true);
  });

  it("trips on a missing or non-numeric timestamp", () => {
    const g = genuine();
    expect(isBotSubmission({ ...g, timestamp: "" })).toBe(true);
    expect(isBotSubmission({ ...g, timestamp: "abc" })).toBe(true);
  });
});
