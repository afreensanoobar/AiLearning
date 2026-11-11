import type { QuestionTopic } from "../models/question.js";
import type { LearningLevel } from "../models/user.js";

export interface CourseSeed {
  slug: string;
  title: string;
  category: string;
  order: number;
  ui: {
    color: string;
    bg: string;
    icon: string;
    iconColor: string;
  };
  lessons: string[];
}

export interface QuestionSeed {
  topic: QuestionTopic;
  difficulty: LearningLevel;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  challengeStage: number | null;
}

export const courses: CourseSeed[] = [
  {
    slug: "html-fundamentals",
    title: "HTML Fundamentals",
    category: "Web Fundamentals",
    order: 0,
    ui: {
      color: "bg-violet-500",
      bg: "bg-violet-100",
      icon: "HTML",
      iconColor: "text-violet-700",
    },
    lessons: [
      "Introduction to HTML",
      "HTML Elements and Tags",
      "HTML Attributes",
      "HTML Forms and Input Elements",
      "HTML Tables and Semantic Elements",
    ],
  },
  {
    slug: "css-fundamentals",
    title: "CSS Fundamentals",
    category: "Web Fundamentals",
    order: 1,
    ui: {
      color: "bg-blue-500",
      bg: "bg-blue-100",
      icon: "CSS",
      iconColor: "text-blue-700",
    },
    lessons: [
      "Introduction to CSS",
      "CSS Selectors",
      "Colors and Backgrounds",
      "Flexbox and Grid",
      "Responsive Web Design",
    ],
  },
  {
    slug: "javascript",
    title: "JavaScript",
    category: "Programming",
    order: 2,
    ui: {
      color: "bg-yellow-500",
      bg: "bg-yellow-100",
      icon: "JS",
      iconColor: "text-yellow-700",
    },
    lessons: [
      "Introduction to JavaScript",
      "Variables and Data Types",
      "Functions and Scope",
      "DOM Manipulation",
      "Events and Event Handling",
    ],
  },
  {
    slug: "react-development",
    title: "React Development",
    category: "Web Development",
    order: 3,
    ui: {
      color: "bg-emerald-500",
      bg: "bg-emerald-100",
      icon: "RE",
      iconColor: "text-emerald-700",
    },
    lessons: [
      "Introduction to React",
      "Components and JSX",
      "Props and State",
      "React Hooks",
      "React Router",
    ],
  },
];

export const regularQuestions: QuestionSeed[] = [
  {
    topic: "HTML",
    difficulty: "Beginner",
    text: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
    ],
    correctIndex: 0,
    explanation:
      "HTML stands for HyperText Markup Language and structures content on the web.",
    challengeStage: null,
  },
  {
    topic: "HTML",
    difficulty: "Beginner",
    text: "Which tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    correctIndex: 1,
    explanation:
      "The <a> element creates a link, with its destination specified by href.",
    challengeStage: null,
  },
  {
    topic: "CSS",
    difficulty: "Beginner",
    text: "Which property changes text color?",
    options: ["font-style", "background", "color", "text-size"],
    correctIndex: 2,
    explanation: "The CSS color property sets the foreground color of an element's text.",
    challengeStage: null,
  },
  {
    topic: "CSS",
    difficulty: "Beginner",
    text: "Which CSS property controls element spacing inside its border?",
    options: ["margin", "padding", "border", "display"],
    correctIndex: 1,
    explanation: "Padding is the space between an element's content and its border.",
    challengeStage: null,
  },
  {
    topic: "JavaScript",
    difficulty: "Beginner",
    text: "Which keyword declares a block-scoped variable?",
    options: ["var", "let", "define", "static"],
    correctIndex: 1,
    explanation:
      "The let keyword declares a variable whose scope is limited to its block.",
    challengeStage: null,
  },
  {
    topic: "JavaScript",
    difficulty: "Beginner",
    text: "Which operator checks strict equality?",
    options: ["=", "==", "===", "!="],
    correctIndex: 2,
    explanation: "The === operator compares values without converting their types.",
    challengeStage: null,
  },
  {
    topic: "React",
    difficulty: "Beginner",
    text: "What is React primarily used for?",
    options: [
      "Database management",
      "Building user interfaces",
      "Operating systems",
      "Server hardware",
    ],
    correctIndex: 1,
    explanation:
      "React is a JavaScript library for building user interfaces from components.",
    challengeStage: null,
  },
  {
    topic: "React",
    difficulty: "Beginner",
    text: "Which React Hook manages component state?",
    options: ["useEffect", "useState", "useRef", "useMemo"],
    correctIndex: 1,
    explanation: "The useState Hook adds and updates state in a function component.",
    challengeStage: null,
  },
  {
    topic: "HTML",
    difficulty: "Intermediate",
    text: "Which HTML attribute is used to provide alternative text for an image?",
    options: ["title", "alt", "src", "href"],
    correctIndex: 1,
    explanation: "The alt attribute provides a text alternative for an image.",
    challengeStage: null,
  },
  {
    topic: "CSS",
    difficulty: "Intermediate",
    text: "Which CSS layout system is primarily designed for two-dimensional layouts?",
    options: ["Flexbox", "Grid", "Float", "Inline"],
    correctIndex: 1,
    explanation: "CSS Grid lays out items across rows and columns in two dimensions.",
    challengeStage: null,
  },
  {
    topic: "JavaScript",
    difficulty: "Intermediate",
    text: "What does the map() method return?",
    options: [
      "A new array",
      "A single number",
      "The original array only",
      "A boolean value",
    ],
    correctIndex: 0,
    explanation:
      "Array map() returns a new array containing the callback's result for each item.",
    challengeStage: null,
  },
  {
    topic: "React",
    difficulty: "Intermediate",
    text: "What is the purpose of the useEffect Hook?",
    options: [
      "To create CSS styles",
      "To handle side effects",
      "To create components",
      "To define routes",
    ],
    correctIndex: 1,
    explanation:
      "useEffect synchronizes a component with external systems after rendering.",
    challengeStage: null,
  },
  {
    topic: "HTML",
    difficulty: "Advanced",
    text: "Which attribute makes a form control mandatory before submission?",
    options: ["validate", "required", "mandatory", "checked"],
    correctIndex: 1,
    explanation:
      "The required attribute prevents form submission until the control has a value.",
    challengeStage: null,
  },
  {
    topic: "CSS",
    difficulty: "Advanced",
    text: "Which CSS property defines the stacking order of positioned elements?",
    options: ["position", "display", "z-index", "overflow"],
    correctIndex: 2,
    explanation:
      "The z-index property controls the stacking order of positioned elements.",
    challengeStage: null,
  },
  {
    topic: "JavaScript",
    difficulty: "Advanced",
    text: "What is a closure in JavaScript?",
    options: [
      "A function bundled with its lexical environment",
      "A method that closes a browser window",
      "A loop that never ends",
      "A CSS property",
    ],
    correctIndex: 0,
    explanation:
      "A closure retains access to its lexical scope even after the outer function returns.",
    challengeStage: null,
  },
  {
    topic: "React",
    difficulty: "Advanced",
    text: "Why are keys used when rendering lists in React?",
    options: [
      "To style list items",
      "To help React identify changed elements",
      "To create unique CSS classes",
      "To store component state",
    ],
    correctIndex: 1,
    explanation:
      "Stable keys help React match list items between renders and update them efficiently.",
    challengeStage: null,
  },
];

export const challengeQuestions: QuestionSeed[] = [
  {
    topic: "JavaScript",
    difficulty: "Advanced",
    text: "What will this code return? [1, 2, 3].map(x => x * 2)",
    options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "undefined"],
    correctIndex: 1,
    explanation: "map() multiplies each array item by two and returns [2, 4, 6].",
    challengeStage: 1,
  },
  {
    topic: "React",
    difficulty: "Advanced",
    text: "What happens when a React component's state changes?",
    options: [
      "The component may re-render",
      "The browser restarts",
      "The component is deleted",
      "The database updates automatically",
    ],
    correctIndex: 0,
    explanation:
      "A state update schedules a re-render so React can display the updated state.",
    challengeStage: 1,
  },
  {
    topic: "CSS",
    difficulty: "Advanced",
    text: "Which CSS property creates a stacking context when set to a value other than auto on a positioned element?",
    options: ["display", "z-index", "margin", "padding"],
    correctIndex: 1,
    explanation:
      "A positioned element with a z-index other than auto establishes a stacking context.",
    challengeStage: 1,
  },
  {
    topic: "HTML",
    difficulty: "Advanced",
    text: "Which attribute connects a label to a form input?",
    options: ["name", "class", "for", "target"],
    correctIndex: 2,
    explanation: "A label's for attribute associates it with the matching input id.",
    challengeStage: 1,
  },
  {
    topic: "JavaScript",
    difficulty: "Advanced",
    text: "What is the output of typeof null in JavaScript?",
    options: ["null", "undefined", "object", "boolean"],
    correctIndex: 2,
    explanation: "For historical reasons, JavaScript reports typeof null as object.",
    challengeStage: 2,
  },
  {
    topic: "React",
    difficulty: "Advanced",
    text: "Why should state updates based on previous state use a function?",
    options: [
      "To avoid CSS conflicts",
      "To receive the latest previous state",
      "To prevent component rendering",
      "To create a new component",
    ],
    correctIndex: 1,
    explanation:
      "A functional state update receives the latest prior state even when updates are queued.",
    challengeStage: 2,
  },
  {
    topic: "CSS",
    difficulty: "Advanced",
    text: "Which Flexbox property aligns items along the main axis?",
    options: ["align-items", "justify-content", "flex-wrap", "align-content"],
    correctIndex: 1,
    explanation:
      "justify-content distributes flex items along the container's main axis.",
    challengeStage: 2,
  },
  {
    topic: "HTML",
    difficulty: "Advanced",
    text: "Which element is most appropriate for the main content of a webpage?",
    options: ["<aside>", "<footer>", "<main>", "<nav>"],
    correctIndex: 2,
    explanation: "The main element identifies the document's dominant, unique content.",
    challengeStage: 2,
  },
  {
    topic: "JavaScript",
    difficulty: "Advanced",
    text: "What does Promise.all() do if one promise rejects?",
    options: [
      "Waits for every promise and always resolves",
      "Rejects when one input promise rejects",
      "Ignores the rejected promise",
      "Converts every promise into a callback",
    ],
    correctIndex: 1,
    explanation: "Promise.all() rejects as soon as one of its input promises rejects.",
    challengeStage: 3,
  },
  {
    topic: "React",
    difficulty: "Advanced",
    text: "What is the purpose of useMemo in React?",
    options: [
      "To memoize a calculated value",
      "To navigate between pages",
      "To update the DOM directly",
      "To create a new context",
    ],
    correctIndex: 0,
    explanation:
      "useMemo caches a calculation result until one of its dependencies changes.",
    challengeStage: 3,
  },
  {
    topic: "CSS",
    difficulty: "Advanced",
    text: "What does the CSS minmax() function do in Grid?",
    options: [
      "Sets a minimum and maximum track size",
      "Changes text alignment",
      "Creates a media query",
      "Controls animation speed",
    ],
    correctIndex: 0,
    explanation: "minmax() defines a lower and upper size bound for a CSS Grid track.",
    challengeStage: 3,
  },
  {
    topic: "HTML",
    difficulty: "Advanced",
    text: "What is the purpose of the aria-label attribute?",
    options: [
      "To change an element's color",
      "To provide an accessible name",
      "To validate a form",
      "To load external scripts",
    ],
    correctIndex: 1,
    explanation:
      "aria-label supplies an accessible name when visible text is not available.",
    challengeStage: 3,
  },
];
