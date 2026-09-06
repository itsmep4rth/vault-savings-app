import { afterEach, describe, expect, it, vi } from "vitest";
import { validateGoalDeadline } from "@/server/goals/validateGoalDeadline";

describe("validateGoalDeadline", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts exactly 1 month from today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-05T12:00:00"));

    expect(() =>
      validateGoalDeadline(new Date("2026-10-05T00:00:00"))
    ).not.toThrow();
  });

  it("accepts exactly 4 months from today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-05T12:00:00"));

    expect(() =>
      validateGoalDeadline(new Date("2027-01-05T00:00:00"))
    ).not.toThrow();
  });

  it("rejects a deadline less than 1 month away", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-05T12:00:00"));

    expect(() =>
      validateGoalDeadline(new Date("2026-10-04T00:00:00"))
    ).toThrow("Deadline must be between 1 and 4 months from today.");
  });

  it("rejects a deadline more than 4 months away", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-05T12:00:00"));

    expect(() =>
      validateGoalDeadline(new Date("2027-01-06T00:00:00"))
    ).toThrow("Deadline must be between 1 and 4 months from today.");
  });

  it("rejects an invalid date", () => {
    expect(() =>
      validateGoalDeadline(new Date("invalid"))
    ).toThrow("Invalid deadline.");
  });
});