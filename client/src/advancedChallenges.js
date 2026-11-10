export const advancedChallenges = {
  1: [
    {
      id: 101,
      topic: "JavaScript",
      question: "What will this code return? [1, 2, 3].map(x => x * 2)",
      options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "undefined"],
      answer: 1,
    },
    {
      id: 102,
      topic: "React",
      question: "What happens when a React component's state changes?",
      options: [
        "The component may re-render",
        "The browser restarts",
        "The component is deleted",
        "The database updates automatically",
      ],
      answer: 0,
    },
    {
      id: 103,
      topic: "CSS",
      question:
        "Which CSS property creates a stacking context when set to a value other than auto on a positioned element?",
      options: ["display", "z-index", "margin", "padding"],
      answer: 1,
    },
    {
      id: 104,
      topic: "HTML",
      question: "Which attribute connects a label to a form input?",
      options: ["name", "class", "for", "target"],
      answer: 2,
    },
  ],

  2: [
    {
      id: 201,
      topic: "JavaScript",
      question: "What is the output of typeof null in JavaScript?",
      options: ["null", "undefined", "object", "boolean"],
      answer: 2,
    },
    {
      id: 202,
      topic: "React",
      question: "Why should state updates based on previous state use a function?",
      options: [
        "To avoid CSS conflicts",
        "To receive the latest previous state",
        "To prevent component rendering",
        "To create a new component",
      ],
      answer: 1,
    },
    {
      id: 203,
      topic: "CSS",
      question: "Which Flexbox property aligns items along the main axis?",
      options: ["align-items", "justify-content", "flex-wrap", "align-content"],
      answer: 1,
    },
    {
      id: 204,
      topic: "HTML",
      question: "Which element is most appropriate for the main content of a webpage?",
      options: ["<aside>", "<footer>", "<main>", "<nav>"],
      answer: 2,
    },
  ],

  3: [
    {
      id: 301,
      topic: "JavaScript",
      question: "What does Promise.all() do if one promise rejects?",
      options: [
        "Waits for every promise and always resolves",
        "Rejects when one input promise rejects",
        "Ignores the rejected promise",
        "Converts every promise into a callback",
      ],
      answer: 1,
    },
    {
      id: 302,
      topic: "React",
      question: "What is the purpose of useMemo in React?",
      options: [
        "To memoize a calculated value",
        "To navigate between pages",
        "To update the DOM directly",
        "To create a new context",
      ],
      answer: 0,
    },
    {
      id: 303,
      topic: "CSS",
      question: "What does the CSS minmax() function do in Grid?",
      options: [
        "Sets a minimum and maximum track size",
        "Changes text alignment",
        "Creates a media query",
        "Controls animation speed",
      ],
      answer: 0,
    },
    {
      id: 304,
      topic: "HTML",
      question: "What is the purpose of the aria-label attribute?",
      options: [
        "To change an element's color",
        "To provide an accessible name",
        "To validate a form",
        "To load external scripts",
      ],
      answer: 1,
    },
  ],
};
