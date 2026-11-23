import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { prisma } from "@/lib/db";
import {
  HONEYPOT_FIELD,
  issueFormToken,
  SIGNATURE_FIELD,
  TIMESTAMP_FIELD,
} from "@/lib/signup/abuse";

// after() has no request scope when the handler is called directly; collect the tasks
// instead of running them (the server events are captured synchronously, before after()).
const { scheduledTasks, analyticsMock } = vi.hoisted(() => ({
  scheduledTasks: [] as Array<() => unknown>,
  analyticsMock: {
    capture: vi.fn(),
    captureException: vi.fn(),
    flush: vi.fn(async () => {}),
  },
}));
vi.mock("next/server", () => ({
  after: (task: () => unknown) => {
    scheduledTasks.push(task);
  },
}));
// Mock the transport, not the event logic: signup-events still runs for real, so these tests
// cover the distinct_id, person-processing gating, and per-segment counting.
vi.mock("@/lib/analytics/posthog-server", () => ({ analytics: analyticsMock }));

import { POST } from "./route";

const ENDPOINT = "http://localhost/api/signup";

function post(fields: Record<string, string>): Promise<Response> {
  return POST(
    new Request(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields),
    }),
  );
}

// A genuine submission: empty honeypot and a token aged past the 2s fill floor.
function submit(fields: Record<string, string>): Promise<Response> {
  const { timestamp, signature } = issueFormToken(Date.now() - 5_000);
  return post({
    [TIMESTAMP_FIELD]: String(timestamp),
    [SIGNATURE_FIELD]: String(signature),
    ...fields,
  });
}

interface CapturedMessage {
  event: string;
  distinctId?: string;
  properties?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

function captured(event: string): CapturedMessage[] {
  return analyticsMock.capture.mock.calls
    .map(([message]) => message as CapturedMessage)
    .filter((message) => message.event === event);
}

describe("POST /api/signup analytics", () => {
  beforeEach(() => {
    scheduledTasks.length = 0;
    vi.clearAllMocks();
    vi.stubEnv("HUBSPOT_ACCESS_TOKEN", "");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("fires signup_committed once for a new launch signup, keyed by the normalized email", async () => {
    await submit({
      email: "New@Example.com",
      segment: "launch_waitlist",
      consent: "true",
    });

    const events = captured(ANALYTICS_EVENTS.signupCommitted);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      distinctId: "new@example.com",
      properties: { segment: "launch_waitlist" },
      options: { process_person_profile: true },
    });
    expect(captured(ANALYTICS_EVENTS.testflightRedirect)).toHaveLength(0);
  });

  it("marks person processing off when consent is unticked", async () => {
    await submit({ email: "silent@example.com", segment: "launch_waitlist" });

    expect(captured(ANALYTICS_EVENTS.signupCommitted)[0].options).toEqual({
      process_person_profile: false,
    });
  });

  it("does not re-fire signup_committed for a duplicate submit", async () => {
    await submit({ email: "dup@example.com", segment: "launch_waitlist" });
    analyticsMock.capture.mockClear();
    await submit({ email: "dup@example.com", segment: "launch_waitlist" });

    expect(captured(ANALYTICS_EVENTS.signupCommitted)).toHaveLength(0);
  });

  it("fires both signup_committed and testflight_redirect for a new beta signup", async () => {
    await submit({ email: "beta@example.com", segment: "beta_tester" });

    expect(captured(ANALYTICS_EVENTS.signupCommitted)).toHaveLength(1);
    expect(captured(ANALYTICS_EVENTS.testflightRedirect)).toHaveLength(1);
  });

  it("keeps testflight_redirect on a repeat beta submit but drops signup_committed", async () => {
    await submit({ email: "beta@example.com", segment: "beta_tester" });
    analyticsMock.capture.mockClear();
    await submit({ email: "beta@example.com", segment: "beta_tester" });

    expect(captured(ANALYTICS_EVENTS.signupCommitted)).toHaveLength(0);
    expect(captured(ANALYTICS_EVENTS.testflightRedirect)).toHaveLength(1);
  });

  it("fires no analytics for a tripped bot", async () => {
    const { timestamp, signature } = issueFormToken(Date.now() - 5_000);
    await post({
      email: "bot@example.com",
      segment: "launch_waitlist",
      [TIMESTAMP_FIELD]: String(timestamp),
      [SIGNATURE_FIELD]: String(signature),
      [HONEYPOT_FIELD]: "http://spam.example",
    });

    expect(analyticsMock.capture).not.toHaveBeenCalled();
  });

  it("persists first-touch UTM from the form to the signup row", async () => {
    await submit({
      email: "utm@example.com",
      segment: "launch_waitlist",
      utm_source: "newsletter",
      utm_campaign: "launch",
    });

    const row = await prisma.signup.findFirstOrThrow({
      where: { email: "utm@example.com" },
    });
    expect(row.utmSource).toBe("newsletter");
    expect(row.utmCampaign).toBe("launch");
    expect(row.utmMedium).toBeNull();
  });
});
