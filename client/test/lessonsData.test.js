import assert from "node:assert/strict";
import { test } from "node:test";
import { getRecommendedLesson } from "../src/lessonsData.js";

test("recommendation mapping retains its target courses and lesson titles", () => {
  assert.deepEqual(getRecommendedLesson("HTML"), {
    courseSlug: "html-fundamentals",
    title: "HTML Elements and Tags",
  });
  assert.deepEqual(getRecommendedLesson("CSS"), {
    courseSlug: "css-fundamentals",
    title: "Flexbox and Grid",
  });
  assert.deepEqual(getRecommendedLesson("JavaScript"), {
    courseSlug: "javascript",
    title: "Functions and Scope",
  });
  assert.deepEqual(getRecommendedLesson("React"), {
    courseSlug: "react-development",
    title: "React Hooks",
  });
  assert.equal(getRecommendedLesson("Python"), undefined);
});
