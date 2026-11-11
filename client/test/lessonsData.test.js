import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getLessonData,
  getLessonDataById,
  getRecommendedLesson,
  lessonsData,
} from "../src/lessonsData.js";

test("video metadata covers every current course lesson", () => {
  assert.equal(lessonsData.length, 60);
  assert.equal(new Set(lessonsData.map((lesson) => lesson.id)).size, 60);
  assert.equal(new Set(lessonsData.map((lesson) => lesson.videoId)).size, 60);
  for (const lesson of lessonsData) {
    assert.ok(lesson.title);
    assert.ok(lesson.topic);
    assert.ok(lesson.courseSlug);
    assert.match(lesson.videoId, /^[\w-]{11}$/);
    assert.ok(lesson.channel);
    assert.equal(lesson.notes, "NOTES_PLACEHOLDER");
    assert.ok(lesson.keyPoints.length > 0);
  }
});

test("lesson lookups support course pages and topic recommendations", () => {
  const lesson = getLessonData("javascript", "Functions and Scope");
  assert.ok(lesson);
  assert.equal(getLessonDataById(lesson.id), lesson);
  assert.equal(getRecommendedLesson("React").title, "React Hooks");
});
