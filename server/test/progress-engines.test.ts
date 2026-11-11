import assert from "node:assert/strict";
import { test } from "node:test";
import { generateLearningPath } from "../src/progress/engines.js";

test("learning path skips untested topics and assigns ordered priority steps", () => {
  const path = generateLearningPath([
    { topic: "HTML", correct: 0, total: 0, percentage: 0 },
    { topic: "CSS", correct: 2, total: 5, percentage: 40 },
    { topic: "JavaScript", correct: 3, total: 5, percentage: 60 },
    { topic: "React", correct: 4, total: 5, percentage: 80 },
  ]);
  assert.deepEqual(
    path.map(({ topic, priority, estimatedTime, step }) => ({
      topic,
      priority,
      estimatedTime,
      step,
    })),
    [
      { topic: "CSS", priority: "High", estimatedTime: "45 minutes", step: 1 },
      {
        topic: "JavaScript",
        priority: "Medium",
        estimatedTime: "30 minutes",
        step: 2,
      },
      { topic: "React", priority: "Low", estimatedTime: "20 minutes", step: 3 },
    ]
  );
});
