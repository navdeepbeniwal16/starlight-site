import { describe, expect, it } from "vitest";
import { Segment } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import type { HubspotClient, HubspotContact } from "./client";
import { reconcile, syncSignup } from "./sync";

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

describe("reconcile", () => {
  it("syncs un-synced rows and reports the counts", async () => {
    await prisma.signup.createMany({
      data: [
        { email: "a@example.com", segment: Segment.launch_waitlist },
        { email: "b@example.com", segment: Segment.beta_tester },
      ],
    });
    const client = fakeClient();

    const result = await reconcile(client);

    expect(result).toEqual({ processed: 2, synced: 2, failed: 0 });
    expect(client.calls).toHaveLength(2);
    const unsynced = await prisma.signup.count({ where: { syncedAt: null } });
    expect(unsynced).toBe(0);
  });

  it("increments sync_attempts and leaves synced_at null on failure", async () => {
    await prisma.signup.create({
      data: { email: "x@example.com", segment: Segment.launch_waitlist },
    });

    const result = await reconcile(fakeClient({ fail: true }));

    expect(result).toEqual({ processed: 1, synced: 0, failed: 1 });
    const row = await prisma.signup.findFirstOrThrow({
      where: { email: "x@example.com" },
    });
    expect(row.syncedAt).toBeNull();
    expect(row.syncAttempts).toBe(1);
  });

  it("skips rows that have hit the soft retry cap", async () => {
    await prisma.signup.create({
      data: {
        email: "capped@example.com",
        segment: Segment.launch_waitlist,
        syncAttempts: 3,
      },
    });
    const client = fakeClient();

    const result = await reconcile(client, 3);

    expect(result).toEqual({ processed: 0, synced: 0, failed: 0 });
    expect(client.calls).toHaveLength(0);
  });

  it("ignores rows that are already synced", async () => {
    await prisma.signup.create({
      data: {
        email: "done@example.com",
        segment: Segment.launch_waitlist,
        syncedAt: new Date(),
      },
    });
    const client = fakeClient();

    const result = await reconcile(client);

    expect(result).toEqual({ processed: 0, synced: 0, failed: 0 });
    expect(client.calls).toHaveLength(0);
  });
});
