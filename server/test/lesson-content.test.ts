import assert from "node:assert/strict";
import { test } from "node:test";
import { lessonContent, lessonContentKey } from "../src/content/lesson-content.js";
import { courses } from "../src/content/seed-data.js";

test("lesson notes cover every seeded lesson with complete beginner material", () => {
  const expectedKeys = courses.flatMap((course) =>
    course.lessons.map((title) => lessonContentKey(course.slug, title))
  );
  assert.equal(Object.keys(lessonContent).length, expectedKeys.length);

  for (const key of expectedKeys) {
    const material = lessonContent[key];
    assert.ok(material, `Missing lesson content for ${key}`);
    const words = material.content.match(/[\p{L}\p{N}_'-]+/gu) ?? [];
    assert.ok(
      words.length >= 150 && words.length <= 250,
      `${key}: ${words.length} words`
    );
    assert.match(material.content, /```[\s\S]+```/, `${key}: missing code example`);
    assert.ok(material.keyPoints.length >= 3 && material.keyPoints.length <= 4);
    assert.equal(material.videoId, "");
    assert.equal(material.channel, "");
  }
});
