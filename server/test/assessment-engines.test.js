import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateNextDifficulty, generateRecommendations, } from "../src/assessments/engines.js";
test("adaptive difficulty follows every level threshold", () => {
    assert.equal(calculateNextDifficulty(0, 0, "Advanced").level, "Beginner");
    assert.deepEqual(calculateNextDifficulty(4, 5, "Beginner"), {
        level: "Intermediate",
        message: "Excellent! You have unlocked Intermediate level!",
        mastered: false,
    });
    assert.equal(calculateNextDifficulty(1, 2, "Beginner").level, "Beginner");
    assert.match(calculateNextDifficulty(0, 2, "Beginner").message, /basics/);
    assert.equal(calculateNextDifficulty(4, 5, "Intermediate").level, "Advanced");
    assert.equal(calculateNextDifficulty(1, 2, "Intermediate").level, "Intermediate");
    assert.equal(calculateNextDifficulty(0, 2, "Intermediate").level, "Beginner");
    assert.deepEqual(calculateNextDifficulty(2, 2, "Advanced"), {
        level: "Advanced",
        message: "Outstanding! You have mastered the Advanced level!",
        mastered: true,
    });
    assert.equal(calculateNextDifficulty(1, 2, "Advanced").level, "Advanced");
    assert.equal(calculateNextDifficulty(0, 2, "Advanced").level, "Intermediate");
});
test("recommendations use guarded percentages, priorities, and ascending order", () => {
    const recommendations = generateRecommendations([
        { topic: "React", correct: 7, total: 10, percentage: 70 },
        { topic: "HTML", correct: 0, total: 0, percentage: 0 },
        { topic: "CSS", correct: 3, total: 5, percentage: 60 },
        { topic: "JavaScript", correct: 2, total: 5, percentage: 40 },
    ]);
    assert.deepEqual(recommendations.map(({ topic, percentage, priority }) => ({
        topic,
        percentage,
        priority,
    })), [
        { topic: "HTML", percentage: 0, priority: "High" },
        { topic: "JavaScript", percentage: 40, priority: "High" },
        { topic: "CSS", percentage: 60, priority: "Medium" },
        { topic: "React", percentage: 70, priority: "Low" },
    ]);
});
