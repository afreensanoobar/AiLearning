import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateStreak } from "../src/progress/streak.js";

test("streak handles no activity, today, gaps, and consecutive days", () => {
  const now = new Date("2026-11-11T12:00:00.000Z");
  assert.equal(calculateStreak([], "UTC", now), 0);
  assert.equal(calculateStreak([new Date("2026-11-11T08:00:00.000Z")], "UTC", now), 1);
  assert.equal(
    calculateStreak(
      [new Date("2026-11-11T08:00:00.000Z"), new Date("2026-11-09T08:00:00.000Z")],
      "UTC",
      now
    ),
    1
  );
  assert.equal(
    calculateStreak(
      [
        new Date("2026-11-10T08:00:00.000Z"),
        new Date("2026-11-09T08:00:00.000Z"),
        new Date("2026-11-08T08:00:00.000Z"),
      ],
      "UTC",
      now
    ),
    3
  );
});

test("streak uses local dates across timezone boundaries", () => {
  const now = new Date("2026-11-11T01:00:00.000Z");
  const activities = [
    new Date("2026-11-11T00:30:00.000Z"),
    new Date("2026-11-10T07:30:00.000Z"),
  ];
  assert.equal(calculateStreak(activities, "America/Los_Angeles", now), 2);
});
