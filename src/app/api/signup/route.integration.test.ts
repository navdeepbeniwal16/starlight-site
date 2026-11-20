import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/db";

// Capture after() tasks instead of deferring them: calling the handler directly
// has no request scope, so the real after() would throw. The test drives the
// captured sync explicitly via flushScheduled().
const { scheduledTasks } = vi.hoisted(() => ({
  scheduledTasks: [] as Array<() => unknown>,
}));
vi.mock("next/server", () => ({
  after: (task: () => unknown) => {
    scheduledTasks.push(task);
  },
}));

async function flushScheduled(): Promise<void> {
  for (const task of scheduledTasks.splice(0)) await task();
}

const ENDPOINT = "http://localhost/api/signup";

function submit(fields: Record<string, string>): Promise<Response> {
  return POST(
    new Request(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields),
    }),
  );
}

function statusOf(res: Response): string | null {
  return new URL(res.headers.get("location")!).searchParams.get("status");
}

describe("POST /api/signup", () => {
  beforeEach(() => {
    scheduledTasks.length = 0;
    // Force the no-op HubSpot client regardless of the developer's environment.
    vi.stubEnv("HUBSPOT_ACCESS_TOKEN", "");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("writes exactly one row with the right segment and succeeds", async () => {
    const res = await submit({
      email: "a@example.com",
      segment: "launch_waitlist",
    });

    expect(res.status).toBe(303);
    expect(statusOf(res)).toBe("joined");

    const rows = await prisma.signup.findMany();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      email: "a@example.com",
      segment: "launch_waitlist",
    });
  });

  it("dedups the same (email, segment): one row, idempotent already-on-list", async () => {
    await submit({ email: "dup@example.com", segment: "launch_waitlist" });
    const res = await submit({
      email: "dup@example.com",
      segment: "launch_waitlist",
    });

    expect(res.status).toBe(303);
    expect(statusOf(res)).toBe("already");
    expect(await prisma.signup.count()).toBe(1);
  });

  it("keeps the same email on both segments as two distinct rows", async () => {
    await submit({ email: "both@example.com", segment: "launch_waitlist" });
    await submit({ email: "both@example.com", segment: "beta_tester" });

    const rows = await prisma.signup.findMany({
      where: { email: "both@example.com" },
    });
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.segment).sort()).toEqual([
      "beta_tester",
      "launch_waitlist",
    ]);
  });

  it("rejects an invalid email inline and writes no row", async () => {
    const res = await submit({
      email: "not-an-email",
      segment: "launch_waitlist",
    });

    expect(res.status).toBe(303);
    expect(statusOf(res)).toBe("invalid");
    expect(await prisma.signup.count()).toBe(0);
  });

  it("commits the beta row before the 303 to TestFlight", async () => {
    const res = await submit({
      email: "beta@example.com",
      segment: "beta_tester",
    });

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(process.env.TESTFLIGHT_URL);

    const rows = await prisma.signup.findMany({ where: { segment: "beta_tester" } });
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("beta@example.com");
  });

  it("stays idempotent on a repeat beta submit: one row, still 303 to TestFlight", async () => {
    await submit({ email: "beta@example.com", segment: "beta_tester" });
    const res = await submit({
      email: "beta@example.com",
      segment: "beta_tester",
    });

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(process.env.TESTFLIGHT_URL);
    expect(await prisma.signup.count()).toBe(1);
  });

  it("syncs to HubSpot off the response path, not before the redirect", async () => {
    await submit({ email: "sync@example.com", segment: "launch_waitlist" });

    // The row commits un-synced; only the deferred after() task stamps it.
    const before = await prisma.signup.findFirstOrThrow({
      where: { email: "sync@example.com" },
    });
    expect(before.syncedAt).toBeNull();

    await flushScheduled();

    const after = await prisma.signup.findFirstOrThrow({
      where: { email: "sync@example.com" },
    });
    expect(after.syncedAt).not.toBeNull();
  });
});
