import { useState } from "react";
import { Send, BrainCircuit, User, Sparkles, Trash2 } from "lucide-react";

// Temporary educational response engine

function generateTutorResponse(question, level = "Beginner") {
  const q = question.toLowerCase();

  const explanations = {
    closure: {
      Beginner: `JavaScript Closures

A closure happens when an inner function remembers variables from its outer function.

Example:

function outer() {
  let count = 0;

  return function inner() {
    count++;
    return count;
  };
}

const counter = outer();
console.log(counter()); // 1
console.log(counter()); // 2

Simple idea: The inner function remembers count even after outer() has finished.

Real-life example: A private counter that remembers its previous value.`,

      Intermediate: `JavaScript Closures

A closure is a combination of a function and its lexical environment.

The inner function retains access to variables in its outer scope even after the outer function returns.

Example:

function createCounter() {
  let count = 0;

  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2

Each call accesses and updates the same preserved variable.

Applications:
1. Data encapsulation
2. Function factories
3. Callbacks
4. Maintaining state.`,

      Advanced: `JavaScript Closures — Advanced

Closures are based on lexical scoping. A function retains access to its surrounding lexical environment through its internal environment reference.

Example:

function createAccount(initialBalance) {
  let balance = initialBalance;

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createAccount(1000);
account.deposit(500);
console.log(account.getBalance()); // 1500

The balance variable cannot be accessed directly from outside.

Advanced applications:
1. Data privacy and encapsulation
2. Memoization
3. Currying
4. Event handlers
5. Module patterns

Important: Closures retain references to variables, not simply frozen copies of their values.`,
    },

    usestate: {
      Beginner: `React useState Hook

useState helps a React component remember information.

Example:

const [count, setCount] = useState(0);

Here:
1. count stores the current value.
2. setCount changes the value.
3. 0 is the starting value.

When you click a button, the count can increase and React updates the screen.`,

      Intermediate: `React useState Hook

useState is a React Hook that adds local state to functional components.

Syntax:

const [count, setCount] = useState(0);

Example:

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Count: {count}
    </button>
  );
}

The setter schedules a state update and React renders the component again.

Use functional updates when the next state depends on the previous state.`,

      Advanced: `React useState — Advanced

useState is a state management Hook that schedules updates and triggers rendering when state changes.

Example:

const [user, setUser] = useState({
  name: "Alex",
  age: 20
});

function updateAge() {
  setUser(prev => ({
    ...prev,
    age: prev.age + 1
  }));
}

Important concepts:
1. State updates should be immutable.
2. Functional updates avoid stale state calculations.
3. React may batch multiple updates.
4. State is associated with a component's position in the render tree.
5. Hooks must be called at the top level of React components or custom Hooks.`,
    },

    flexbox: {
      Beginner: `CSS Flexbox

Flexbox helps arrange elements in a row or column.

Example:

.container {
  display: flex;
  gap: 10px;
}

Important properties:
1. display: flex
2. justify-content
3. align-items
4. flex-direction

Example use: Arranging navigation links horizontally.`,

      Intermediate: `CSS Flexbox

Flexbox is a one-dimensional CSS layout model.

Important properties:

1. display: flex — creates a flex container.
2. flex-direction — sets the main axis direction.
3. justify-content — distributes items along the main axis.
4. align-items — aligns items along the cross axis.
5. flex-wrap — controls wrapping.
6. gap — sets spacing.

Example:

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

Flexbox is useful for responsive navigation bars and card layouts.`,

      Advanced: `CSS Flexbox — Advanced

Flexbox uses a main axis and a cross axis to distribute available space.

Example:

.container {
  display: flex;
  flex: 1 1 250px;
  justify-content: space-evenly;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 24px;
}

Advanced concepts:
1. flex-grow controls how items expand.
2. flex-shrink controls how items shrink.
3. flex-basis defines the initial main size.
4. align-self overrides individual cross-axis alignment.
5. flex-wrap allows items to move onto additional lines.

Understanding the flex sizing algorithm helps build responsive interfaces without unnecessary fixed widths.`,
    },

    semantic: {
      Beginner: `HTML Semantic Elements

Semantic HTML tags describe the meaning of webpage content.

Examples:
1. header — top section.
2. nav — navigation links.
3. main — main content.
4. article — independent content.
5. section — related content.
6. footer — bottom section.

They help organize a webpage.`,

      Intermediate: `HTML Semantic Elements

Semantic elements communicate the structure and purpose of content to browsers and assistive technologies.

Example:

<header>
  <h1>My Website</h1>
</header>

<nav>
  <a href="/">Home</a>
</nav>

<main>
  <article>
    <h2>Learning HTML</h2>
    <p>Welcome to HTML.</p>
  </article>
</main>

<footer>Copyright information</footer>

Benefits include accessibility, maintainability and clearer document structure.`,

      Advanced: `HTML Semantic Elements — Advanced

Semantic HTML provides meaningful document structure and improves accessibility.

Important considerations:

1. Use landmarks such as header, nav, main and footer appropriately.
2. Use article for self-contained content.
3. Use section for thematic grouping, usually with a heading.
4. Preserve logical heading hierarchy.
5. Use native elements instead of recreating their behavior with generic div elements.

Semantic HTML improves compatibility with screen readers, keyboard navigation and accessibility tools.

It also makes document structure easier for developers and search engines to understand.`,
    },

    javascript: {
      Beginner: `JavaScript Fundamentals

JavaScript makes websites interactive.

Basic concepts:
1. Variables store information.
2. Functions perform tasks.
3. Arrays store lists.
4. Objects store related information.
5. Events respond to user actions.

Example:

const name = "Alex";

function greet() {
  return "Hello " + name;
}

console.log(greet());`,

      Intermediate: `JavaScript Fundamentals

JavaScript is a dynamically typed, multi-paradigm programming language.

Important concepts:
1. Scope and closures
2. Functions and callbacks
3. Arrays and objects
4. DOM manipulation
5. Event handling
6. Promises and asynchronous programming

Example:

const greet = (name) => {
  return \`Hello \${name}\`;
};

console.log(greet("Alex"));

Arrow functions provide concise function syntax.`,

      Advanced: `JavaScript — Advanced Concepts

JavaScript uses a single-threaded execution model with an event loop for coordinating asynchronous tasks.

Important concepts:
1. Execution contexts and lexical environments
2. Closures and scope chains
3. Prototypes and inheritance
4. Event loop and task queues
5. Promises and async/await
6. Memory management and garbage collection

Example:

async function fetchData() {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error("Request failed");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

Understanding asynchronous execution is essential for building complex applications.`,
    },

    react: {
      Beginner: `Introduction to React

React is a JavaScript library used to build user interfaces.

Important concepts:
1. Components are reusable parts.
2. JSX describes the interface.
3. Props pass information.
4. State stores changing information.
5. Hooks provide React features.

Example:

function Welcome() {
  return <h1>Hello Student!</h1>;
}`,

      Intermediate: `React — Intermediate Concepts

React uses a component-based architecture.

Important concepts:
1. Props and component communication
2. State management with useState
3. Side effects with useEffect
4. Conditional rendering
5. Lists and keys
6. Component composition

Example:

function Greeting({ name }) {
  return <h1>Welcome, {name}</h1>;
}

Props allow components to receive data from their parent components.`,

      Advanced: `React — Advanced Concepts

React uses a declarative rendering model and reconciles UI updates using its rendering architecture.

Advanced concepts:
1. Reconciliation and rendering
2. Component composition
3. Context API
4. Custom Hooks
5. Memoization with useMemo and useCallback
6. Lazy loading and code splitting
7. Error boundaries
8. Performance optimization

Example:

const MemoizedComponent = React.memo(function Component({ value }) {
  return <div>{value}</div>;
});

React.memo can skip rendering when props have not changed, subject to its comparison behavior.

Choose optimization techniques based on measured performance rather than using them everywhere.`,
    },
  };

  let topic = null;

  if (q.includes("closure")) topic = "closure";
  else if (q.includes("usestate") || q.includes("use state")) topic = "usestate";
  else if (q.includes("flexbox") || q.includes("flex box")) topic = "flexbox";
  else if (q.includes("semantic")) topic = "semantic";
  else if (q.includes("react")) topic = "react";
  else if (q.includes("javascript") || q.includes("js")) topic = "javascript";
  else if (q.includes("html")) topic = "semantic";
  else if (q.includes("css")) topic = "flexbox";

  if (topic) {
    return `${explanations[topic][level]}

Learning Level: ${level}`;
  }

  return `You asked: "${question}"

I can currently explain HTML, CSS, JavaScript and React topics.

Try asking about:
- JavaScript closures
- React useState
- CSS Flexbox
- Semantic HTML
- JavaScript fundamentals

Learning Level: ${level}

More flexible AI-generated answers will be added when backend integration is implemented.`;
}

function AITutor() {
  const [input, setInput] = useState("");
  const [learningLevel, setLearningLevel] = useState("Beginner");

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Tutor. Ask me anything about HTML, CSS, JavaScript, or React. I'll help you understand concepts step by step.",
    },
  ]);

  const suggestions = [
    "Explain JavaScript closures",
    "What is React useState?",
    "Explain CSS Flexbox",
    "What are semantic HTML tags?",
  ];

  const handleSend = (text = input) => {
    const question = text.trim();

    if (!question) return;

    const response = generateTutorResponse(question, learningLevel);

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
      { role: "assistant", content: response },
    ]);

    setInput("");
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm your AI Tutor. Ask me anything about HTML, CSS, JavaScript, or React.",
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">AI Learning Assistant</h2>
        <p className="mt-1 text-slate-500">Ask questions and learn at your own pace.</p>
      </div>

      <section className="flex min-h-[550px] flex-col overflow-hidden rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <BrainCircuit className="text-violet-600" size={24} />
            </div>

            <div>
              <h3 className="font-bold">LearnAI Tutor</h3>
              <select
                value={learningLevel}
                onChange={(e) => setLearningLevel(e.target.value)}
                className="mt-2 rounded-lg border p-2 text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <p className="text-xs text-emerald-600">Learning assistant</p>
            </div>
          </div>

          <button
            onClick={clearChat}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
            Clear Chat
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100">
                  <Sparkles size={18} className="text-violet-600" />
                </div>
              )}

              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {message.content}
              </div>

              {message.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <User size={18} className="text-blue-600" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t p-5">
          <p className="mb-3 text-xs font-semibold text-slate-500">TRY ASKING</p>

          <div className="mb-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="rounded-full border px-3 py-2 text-xs text-slate-600 hover:border-violet-300 hover:bg-violet-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex gap-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask your question..."
              className="min-w-0 flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500"
            />

            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-violet-600 px-5 text-white hover:bg-violet-700 disabled:opacity-40"
            >
              <Send size={19} />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default AITutor;
