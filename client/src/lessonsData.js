const courseLessons = [
  {
    courseSlug: "html-fundamentals",
    courseTitle: "HTML Fundamentals",
    topic: "HTML",
    titles: [
      "Introduction to HTML",
      "HTML Elements and Tags",
      "HTML Attributes",
      "HTML Forms and Input Elements",
      "HTML Tables and Semantic Elements",
    ],
  },
  {
    courseSlug: "css-fundamentals",
    courseTitle: "CSS Fundamentals",
    topic: "CSS",
    titles: [
      "Introduction to CSS",
      "CSS Selectors",
      "Colors and Backgrounds",
      "Flexbox and Grid",
      "Responsive Web Design",
    ],
  },
  {
    courseSlug: "javascript",
    courseTitle: "JavaScript",
    topic: "JavaScript",
    titles: [
      "Introduction to JavaScript",
      "Variables and Data Types",
      "Functions and Scope",
      "DOM Manipulation",
      "Events and Event Handling",
    ],
  },
  {
    courseSlug: "react-development",
    courseTitle: "React Development",
    topic: "React",
    titles: [
      "Introduction to React",
      "Components and JSX",
      "Props and State",
      "React Hooks",
      "React Router",
    ],
  },
  {
    courseSlug: "typescript-essentials",
    courseTitle: "TypeScript Essentials",
    topic: "TypeScript",
    titles: [
      "Why TypeScript",
      "Primitive and Union Types",
      "Objects and Interfaces",
      "Typed Functions",
      "Generics and Narrowing",
    ],
  },
  {
    courseSlug: "node-express-apis",
    courseTitle: "Node.js & Express APIs",
    topic: "Node.js & Express",
    titles: [
      "Node.js Runtime",
      "Express Routes",
      "Request and Response",
      "Middleware and Validation",
      "Designing REST Endpoints",
    ],
  },
  {
    courseSlug: "python-programming",
    courseTitle: "Python Programming",
    topic: "Python",
    titles: [
      "Python Setup and Syntax",
      "Variables and Data Types",
      "Conditions and Loops",
      "Functions and Modules",
      "Lists and Dictionaries",
    ],
  },
  {
    courseSlug: "sql-databases",
    courseTitle: "SQL & Databases",
    topic: "SQL",
    titles: [
      "Relational Database Basics",
      "Selecting and Filtering Data",
      "Sorting and Aggregation",
      "Joining Tables",
      "Tables and Relationships",
    ],
  },
  {
    courseSlug: "data-analytics-python",
    courseTitle: "Data Analytics with Python",
    topic: "Data Analytics",
    titles: [
      "Working with Data",
      "Loading a Dataset",
      "Cleaning Missing Values",
      "Summaries and Grouping",
      "Communicating Insights",
    ],
  },
  {
    courseSlug: "generative-ai-foundations",
    courseTitle: "Generative AI Foundations",
    topic: "Generative AI",
    titles: [
      "What Generative AI Can Do",
      "Models, Tokens, and Context",
      "Writing Clear Prompts",
      "Evaluating AI Responses",
      "Responsible AI Use",
    ],
  },
  {
    courseSlug: "git-github",
    courseTitle: "Git & GitHub",
    topic: "Git",
    titles: [
      "Version Control Basics",
      "Commits and Change History",
      "Branches and Merging",
      "Working with GitHub",
      "Pull Requests and Reviews",
    ],
  },
  {
    courseSlug: "ui-ux-design",
    courseTitle: "UI/UX Design Foundations",
    topic: "UI/UX Design",
    titles: [
      "UX and UI Roles",
      "Understanding Users",
      "Mapping a User Journey",
      "Wireframes and Hierarchy",
      "Usability and Iteration",
    ],
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const lessonsData = courseLessons.flatMap(
  ({ courseSlug, courseTitle, topic, titles }) =>
    titles.map((title, index) => ({
      id: `${courseSlug}-${String(index + 1).padStart(2, "0")}-${slugify(title)}`,
      courseSlug,
      courseTitle,
      title,
      topic,
      videoId: "VIDEO_ID_PLACEHOLDER",
      channel: "CHANNEL_NAME_PLACEHOLDER",
      notes: "NOTES_PLACEHOLDER",
      keyPoints: [
        `Understand ${title.toLowerCase()} and its role in ${courseTitle}.`,
        `Practice applying ${topic} concepts with a small example.`,
      ],
    }))
);

export function getLessonData(courseSlug, title) {
  return lessonsData.find(
    (lesson) => lesson.courseSlug === courseSlug && lesson.title === title
  );
}

export function getLessonDataById(id) {
  return lessonsData.find((lesson) => lesson.id === id);
}

const recommendationTargets = {
  HTML: ["html-fundamentals", "HTML Elements and Tags"],
  CSS: ["css-fundamentals", "Flexbox and Grid"],
  JavaScript: ["javascript", "Functions and Scope"],
  React: ["react-development", "React Hooks"],
};

export function getRecommendedLesson(topic) {
  const target = recommendationTargets[topic];
  return target ? getLessonData(...target) : undefined;
}
