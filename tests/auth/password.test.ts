import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  validatePassword,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "../../lib/password";

describe("password handling", () => {
  const password = "Vault demo password 123!";

  it("accepts a password within the allowed length", () => {
    expect(validatePassword(password)).toBeNull();
  });

  it("rejects passwords that are too short or too long", () => {
    expect(
      validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))
    ).not.toBeNull();

    expect(
      validatePassword("a".repeat(MAX_PASSWORD_LENGTH + 1))
    ).not.toBeNull();
  });

  it("creates a versioned hash rather than storing the password", async () => {
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(
      /^scrypt-v1:[0-9a-f]{32}:[0-9a-f]{128}$/
    );
  });

  it("uses a different random salt for each hash", async () => {
    const first = await hashPassword(password);
    const second = await hashPassword(password);

    expect(first).not.toBe(second);
  });

  it("accepts the correct password and rejects an incorrect one", async () => {
    const hash = await hashPassword(password);

    await expect(verifyPassword(password, hash)).resolves.toBe(true);

    await expect(
      verifyPassword("Wrong demo password 456!", hash)
    ).resolves.toBe(false);
  });

  it("does not silently trim passwords", async () => {
    const hash = await hashPassword(password);

    await expect(
      verifyPassword(` ${password}`, hash)
    ).resolves.toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    await expect(
      verifyPassword(password, "not-a-valid-hash")
    ).resolves.toBe(false);

    await expect(
      verifyPassword(password, "scrypt-v1:zz:zz")
    ).resolves.toBe(false);
  });

  it("refuses to hash a password outside the allowed length", async () => {
    await expect(hashPassword("short")).rejects.toThrow();
  });
});