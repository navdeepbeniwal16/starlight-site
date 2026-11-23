import { describe, expect, it } from "vitest";
import { readUtm, readUtmFromForm } from "./utm";

describe("readUtm", () => {
  it("picks the known UTM params and ignores everything else", () => {
    const params = new URLSearchParams(
      "utm_source=newsletter&utm_medium=email&utm_campaign=launch&utm_term=beta&utm_content=hero&status=joined",
    );
    expect(readUtm(params)).toEqual({
      utm_source: "newsletter",
      utm_medium: "email",
      utm_campaign: "launch",
      utm_term: "beta",
      utm_content: "hero",
    });
  });

  it("trims values and drops blank ones", () => {
    const params = new URLSearchParams("utm_source=%20news%20&utm_medium=%20%20");
    expect(readUtm(params)).toEqual({ utm_source: "news" });
  });

  it("returns an empty object for direct traffic", () => {
    expect(readUtm(new URLSearchParams(""))).toEqual({});
  });
});

describe("readUtmFromForm", () => {
  it("reads the same keys off a posted form", () => {
    const form = new FormData();
    form.set("utm_source", "newsletter");
    form.set("utm_campaign", "  launch  ");
    form.set("utm_medium", "   ");
    form.set("email", "a@example.com");
    expect(readUtmFromForm(form)).toEqual({
      utm_source: "newsletter",
      utm_campaign: "launch",
    });
  });
});
