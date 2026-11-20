import { describe, expect, it } from "vitest";
import { Segment } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { HubspotClient, HubspotContact } from "./client";
import { syncSignup } from "./sync";

// A controllable fake standing in for HubSpot: records every upsert and, when
// asked, throws to exercise the failure paths.
function fakeClient(opts: { fail?: boolean } = {}): HubspotClient & {
  calls: HubspotContact[];
} {
  const calls: HubspotContact[] = [];
  return {
    calls,
    async upsertContact(contact) {
      calls.push(contact);
      if (opts.fail) throw new Error("hubspot unavailable");
    },
  };
}

describe("syncSignup", () => {
  it("upserts the contact and stamps synced_at on success", async () => {
    await prisma.signup.create({
      data: { email: "ok@example.com", segment: Segment.launch_waitlist },
    });
    const client = fakeClient();

    await syncSignup(
      { email: "ok@example.com", segment: Segment.launch_waitlist },
      client,
    );

    expect(client.calls).toEqual([
      { email: "ok@example.com", segment: Segment.launch_waitlist },
    ]);
    const row = await prisma.signup.findFirstOrThrow({
      where: { email: "ok@example.com" },
    });
    expect(row.syncedAt).not.toBeNull();
  });

  it("leaves synced_at null and never throws when HubSpot fails", async () => {
    await prisma.signup.create({
      data: { email: "down@example.com", segment: Segment.launch_waitlist },
    });

    await expect(
      syncSignup(
        { email: "down@example.com", segment: Segment.launch_waitlist },
        fakeClient({ fail: true }),
      ),
    ).resolves.toBeUndefined();

    const row = await prisma.signup.findFirstOrThrow({
      where: { email: "down@example.com" },
    });
    expect(row.syncedAt).toBeNull();
  });
});
