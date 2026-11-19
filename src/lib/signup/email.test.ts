import { describe, expect, it } from "vitest";
import { isValidEmail, normalizeEmail } from "./email";

describe("isValidEmail", () => {
  const valid = [
    "a@b.co",
    "user@example.com",
    "first.last@example.co.uk",
    "user+tag@example.com",
    "user_name@sub.example.com",
    "u123@domain.io",
    "  trimmed@example.com  ", // surrounding whitespace is tolerated
  ];

  it.each(valid)("accepts %j", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  const invalid = [
    "",
    "   ",
    "plainaddress",
    "@no-local.com",
    "no-domain@",
    "two@@at.com",
    "user@.com", // empty domain label
    "user@domain", // no TLD
    "user@domain..com", // consecutive dots
    "user@domain.c", // one-char TLD
    "user@domain.123", // numeric TLD
    ".user@example.com", // leading dot in local part
    "user.@example.com", // trailing dot in local part
    "user name@example.com", // space in local part
    "user@exam ple.com", // space in domain
    "user@-domain.com", // label starts with a hyphen
  ];

  it.each(invalid)("rejects %j", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims surrounding whitespace and lowercases", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });
});
