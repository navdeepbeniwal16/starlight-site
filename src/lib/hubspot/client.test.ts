import { afterEach, describe, expect, it, vi } from "vitest";
import { getHubspotClient } from "./client";
import { noopHubspotClient } from "./noop";

describe("getHubspotClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the no-op client when no access token is set", () => {
    vi.stubEnv("HUBSPOT_ACCESS_TOKEN", "");
    expect(getHubspotClient()).toBe(noopHubspotClient);
  });

  it("returns a real client when an access token is set", () => {
    vi.stubEnv("HUBSPOT_ACCESS_TOKEN", "pat-test-token");
    expect(getHubspotClient()).not.toBe(noopHubspotClient);
  });
});
