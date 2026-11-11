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

const lessonMedia = {
  "html-fundamentals": {
    "Introduction to HTML": { videoId: "P0EGYTb1cBs", channel: "Dave Gray" },
    "HTML Elements and Tags": { videoId: "K_EVuLegRZ0", channel: "Kevin Powell" },
    "HTML Attributes": { videoId: "WDHK1rUsOL0", channel: "Code Step By Step" },
    "HTML Forms and Input Elements": { videoId: "YA1sGN-K6X8", channel: "Ankit Gupta" },
    "HTML Tables and Semantic Elements": {
      videoId: "S6f6DUNqNnk",
      channel: "Code Ki Pathshala",
    },
  },
  "css-fundamentals": {
    "Introduction to CSS": { videoId: "0W6qz0-aDaM", channel: "Dave Gray" },
    "CSS Selectors": { videoId: "a69OMEJXaJo", channel: "Kevin Powell" },
    "Colors and Backgrounds": { videoId: "crKYMOO49yQ", channel: "Envato" },
    "Flexbox and Grid": { videoId: "ieTHC78giGQ", channel: "freeCodeCamp.org" },
    "Responsive Web Design": { videoId: "x4u1yp3Msao", channel: "Kevin Powell" },
  },
  javascript: {
    "Introduction to JavaScript": {
      videoId: "W6NZfCO5SIk",
      channel: "Programming with Mosh",
    },
    "Variables and Data Types": { videoId: "C95cMXD-Fp8", channel: "Programiz" },
    "Functions and Scope": {
      videoId: "ROvh1l7X23M",
      channel: "LinkedIn Learning",
    },
    "DOM Manipulation": { videoId: "y17RuWkWdn8", channel: "Web Dev Simplified" },
    "Events and Event Handling": {
      videoId: "F3odgpghXzY",
      channel: "freeCodeCamp.org",
    },
  },
  "react-development": {
    "Introduction to React": {
      videoId: "SqcY0GlETPk",
      channel: "Programming with Mosh",
    },
    "Components and JSX": {
      videoId: "NQxm29NZsEw",
      channel: "Code Ki Pathshala",
    },
    "Props and State": { videoId: "IYvD9oBCuJI", channel: "Web Dev Simplified" },
    "React Hooks": { videoId: "TNhaISOUy6Q", channel: "Fireship" },
    "React Router": { videoId: "Ul3y1LXxzdU", channel: "Web Dev Simplified" },
  },
  "typescript-essentials": {
    "Why TypeScript": { videoId: "RnAxlDmJq-U", channel: "W3schools" },
    "Primitive and Union Types": { videoId: "2jeIzF_7sUg", channel: "Smartherd" },
    "Objects and Interfaces": { videoId: "vTy881CvEgM", channel: "DanCanCode" },
    "Typed Functions": { videoId: "34xpwykL4Uc", channel: "Net Ninja" },
    "Generics and Narrowing": {
      videoId: "LbFuwztw7MA",
      channel: "Muhammad Hasan",
    },
  },
  "node-express-apis": {
    "Node.js Runtime": { videoId: "L18RHG2DwwA", channel: "Codevolution" },
    "Express Routes": { videoId: "JA1fksbhp9s", channel: "CodeLucky" },
    "Request and Response": { videoId: "Bbgb82nQKac", channel: "CodeLucky" },
    "Middleware and Validation": {
      videoId: "lY6icfhap2o",
      channel: "Web Dev Simplified",
    },
    "Designing REST Endpoints": {
      videoId: "pKd0Rpw7O48",
      channel: "Programming with Mosh",
    },
  },
  "python-programming": {
    "Python Setup and Syntax": {
      videoId: "b093aqAZiPU",
      channel: "Kevin Stratvert",
    },
    "Variables and Data Types": {
      videoId: "KeA39II7AO8",
      channel: "Python Simplified",
    },
    "Conditions and Loops": { videoId: "iAO3VRt_rTo", channel: "NS lectures" },
    "Functions and Modules": {
      videoId: "Q7FH6OJBUuo",
      channel: "The SkillPedia",
    },
    "Lists and Dictionaries": { videoId: "fXRxHrDhQuI", channel: "Simplilearn" },
  },
  "sql-databases": {
    "Relational Database Basics": {
      videoId: "OqjJjpjDRLc",
      channel: "IBM Technology",
    },
    "Selecting and Filtering Data": {
      videoId: "eRWOdpludPM",
      channel: "Maven Analytics",
    },
    "Sorting and Aggregation": {
      videoId: "zgYqUP_PhQo",
      channel: "Alex The Analyst",
    },
    "Joining Tables": {
      videoId: "FjxtntY5sO0",
      channel: "Maven Analytics",
    },
    "Tables and Relationships": {
      videoId: "3_p6DfGUjIs",
      channel: "The Code Brat",
    },
  },
  "data-analytics-python": {
    "Working with Data": {
      videoId: "r-uOLxNrNk8",
      channel: "freeCodeCamp.org",
    },
    "Loading a Dataset": { videoId: "-0NwrcZOKhQ", channel: "codebasics" },
    "Cleaning Missing Values": {
      videoId: "KdmPHEnPJPs",
      channel: "Corey Schafer",
    },
    "Summaries and Grouping": {
      videoId: "rU_1Nb2F2zY",
      channel: "Dr Krunal Patel",
    },
    "Communicating Insights": {
      videoId: "So4_o3w0m1s",
      channel: "Value Driven Analytics",
    },
  },
  "generative-ai-foundations": {
    "What Generative AI Can Do": {
      videoId: "G2fqAlgmoPo",
      channel: "Google Cloud Tech",
    },
    "Models, Tokens, and Context": {
      videoId: "j6ev9WL8AoA",
      channel: "AI Decoded",
    },
    "Writing Clear Prompts": { videoId: "p09yRj47kNM", channel: "Tina Huang" },
    "Evaluating AI Responses": {
      videoId: "trfUBIDeI1Y",
      channel: "IBM Technology",
    },
    "Responsible AI Use": { videoId: "w_3L1Bf2P_g", channel: "Google Cloud" },
  },
  "git-github": {
    "Version Control Basics": {
      videoId: "Yc8sCSeMhi4",
      channel: "Simplilearn",
    },
    "Commits and Change History": {
      videoId: "7PQzEklsyNA",
      channel: "CodeLucky",
    },
    "Branches and Merging": {
      videoId: "e2IbNHi4uCI",
      channel: "freeCodeCamp.org",
    },
    "Working with GitHub": {
      videoId: "mAFoROnOfHs",
      channel: "freeCodeCamp.org",
    },
    "Pull Requests and Reviews": {
      videoId: "HZF3KUBBrSk",
      channel: "Max Rohowsky",
    },
  },
  "ui-ux-design": {
    "UX and UI Roles": { videoId: "ODpB9-MCa5s", channel: "Simplilearn" },
    "Understanding Users": { videoId: "7MTJrysCj8I", channel: "Design & UX" },
    "Mapping a User Journey": { videoId: "L4E1yupkISI", channel: "Figma" },
    "Wireframes and Hierarchy": {
      videoId: "c9Wg6Cb_YlU",
      channel: "freeCodeCamp.org",
    },
    "Usability and Iteration": { videoId: "EYUL0N1Fjhg", channel: "UX Tshili" },
  },
};

export const lessonsData = courseLessons.flatMap(
  ({ courseSlug, courseTitle, topic, titles }) =>
    titles.map((title, index) => {
      const media = lessonMedia[courseSlug]?.[title];
      return {
        id: `${courseSlug}-${String(index + 1).padStart(2, "0")}-${slugify(title)}`,
        courseSlug,
        courseTitle,
        title,
        topic,
        videoId: media?.videoId ?? "VIDEO_ID_PLACEHOLDER",
        channel: media?.channel ?? "CHANNEL_NAME_PLACEHOLDER",
        notes: "NOTES_PLACEHOLDER",
        keyPoints: [
          `Understand ${title.toLowerCase()} and its role in ${courseTitle}.`,
          `Practice applying ${topic} concepts with a small example.`,
        ],
      };
    })
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
