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
    "typescript-essentials":
      'type Learner = { name: string; progress: number };\nconst learner: Learner = { name: "Sam", progress: 0 };',
    "node-express-apis":
      'app.get("/api/health", (_req, res) => {\n  res.json({ status: "ok" });\n});',
    "python-programming": 'def greet(name):\n    return f"Hello, {name}"',
    "sql-databases":
      "SELECT title, category\nFROM courses\nWHERE category = 'Programming'\nORDER BY title;",
    "data-analytics-python":
      'import pandas as pd\n\ndata = pd.read_csv("learners.csv")\nprint(data["score"].mean())',
    "generative-ai-foundations":
      "Goal: Explain [concept]\nContext: [learner level]\nFormat: Steps, then one example",
    "git-github": 'git status\ngit add .\ngit commit -m "Add course catalog"',
    "ui-ux-design":
      ".course-card {\n  display: grid;\n  gap: 1rem;\n  border-radius: 1rem;\n}",
  };
  const language: Record<string, string> = {
    "html-fundamentals": "html",
    "css-fundamentals": "css",
    javascript: "js",
    "react-development": "jsx",
    "typescript-essentials": "ts",
    "node-express-apis": "js",
    "python-programming": "python",
    "sql-databases": "sql",
    "data-analytics-python": "python",
    "generative-ai-foundations": "text",
    "git-github": "bash",
    "ui-ux-design": "css",
  };
  return `# ${title}\n\nThis lesson introduces ${title.toLowerCase()} and the core ideas used in this course.\n\n\`\`\`${language[slug]}\n${snippets[slug]}\n\`\`\``;
}

export async function seedContent() {
  for (const courseSeed of courses) {
    const { lessons: lessonTitles, ...courseFields } = courseSeed;
    const course = await Course.findOneAndUpdate(
      { slug: courseFields.slug },
      { $set: courseFields, $unset: { lessonCount: 1, durationMinutes: 1 } },
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
