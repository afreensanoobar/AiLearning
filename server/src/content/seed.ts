import { Course } from "../models/course.js";
import { Lesson } from "../models/lesson.js";
import { Question } from "../models/question.js";
import { challengeQuestions, courses, regularQuestions } from "./seed-data.js";

function lessonContent(title: string, slug: string) {
  const snippets: Record<string, string> = {
    "html-fundamentals": "<main>\n  <h1>Welcome</h1>\n</main>",
    "css-fundamentals": ".example {\n  color: rebeccapurple;\n}",
    javascript: 'const message = "Hello, LearnAI";\nconsole.log(message);',
    "react-development": "function Example() {\n  return <h1>Welcome</h1>;\n}",
  };
  const language: Record<string, string> = {
    "html-fundamentals": "html",
    "css-fundamentals": "css",
    javascript: "js",
    "react-development": "jsx",
  };
  return `# ${title}\n\nThis lesson introduces ${title.toLowerCase()} and the core ideas used in this course.\n\n\`\`\`${language[slug]}\n${snippets[slug]}\n\`\`\``;
}

export async function seedContent() {
  for (const courseSeed of courses) {
    const { lessons: lessonTitles, ...courseFields } = courseSeed;
    const course = await Course.findOneAndUpdate(
      { slug: courseFields.slug },
      { $set: courseFields },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    for (const [index, title] of lessonTitles.entries()) {
      await Lesson.updateOne(
        { courseId: course._id, order: index + 1 },
        {
          $set: {
            courseId: course._id,
            title,
            order: index + 1,
            content: lessonContent(title, course.slug),
            estimatedMinutes: 10,
          },
        },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    }
  }

  const questions = [...regularQuestions, ...challengeQuestions];
  for (const question of questions) {
    await Question.updateOne(
      { text: question.text },
      {
        $set: {
          ...question,
          status: "active",
          source: "manual",
          createdBy: null,
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  return {
    courses: courses.length,
    lessons: courses.reduce((total, course) => total + course.lessons.length, 0),
    questions: questions.length,
  };
}
