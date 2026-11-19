import { describe, expect, it } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/db";

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

    // The row is already durable at the moment the redirect is returned.
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
});
