# LearnAI — Full-Stack Upgrade: Module-by-Module Build Instructions

> **Audience:** an AI coding agent (Antigravity) working inside the existing repo `https://github.com/Nuba743/CollegeProject`.
> **Goal:** turn the current localStorage-only React SPA into a full-stack app with a Node/Express API, MongoDB database, real authentication, server-side assessments, and real AI integration (tutor, explanations, question generation, study plans).

---

## 0. Rules for the agent (read first)

1. Work **one module at a time**, in order. Do not start module N+1 until every acceptance criterion of module N passes.
2. After each module: run lint and tests, write a short summary of what changed, list how to verify it manually, and make one git commit named `feat(Mx): <title>`.
3. **Keep the existing UI and design language**: Tailwind v4, violet primary, slate neutrals, rounded-2xl/3xl cards, lucide-react icons. Do not redesign pages. Move them, do not restyle them.
4. **Keep the existing logic.** The three engines (`adaptiveEngine.js`, `learningPathEngine.js`, `recommendationEngine.js`) and the question content are the source of truth. Port them exactly (specs are in Section 1.4), then add tests proving identical behavior.
5. Never expose secrets or correct answers to the browser. API keys, JWT secrets and DB URLs live only in server environment variables.
6. If something is ambiguous, pick the simplest option, and record the decision in `DECISIONS.md` (one line each).
7. Prefer small files (< 300 lines). Do not create new monoliths.
8. Validate every request body with **zod**. Return errors in one consistent shape: `{ "error": { "code": "STRING", "message": "Human readable", "details": [] } }`.

---

## 1. Starting point (existing app — do not lose any of this)

### 1.1 What exists today

LearnAI is a personalized adaptive learning SPA for web-dev students covering **HTML, CSS, JavaScript, React**.

| Layer    | Current                                                                    |
| -------- | -------------------------------------------------------------------------- |
| UI       | React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), lucide-react        |
| State/DB | Browser `localStorage` only                                                |
| Auth     | Client-side simulation (`demoUsers` in localStorage, plain-text passwords) |
| Routing  | Manual `activePage` state, no React Router                                 |
| AI       | None. `AITutor.jsx` is a keyword-matching rule engine                      |

Current files in `src/`: `main.jsx`, `App.jsx` (root shell + all pages, very large), `Auth.jsx`, `Assessment.jsx` (quiz engine, very large), `AITutor.jsx`, `adaptiveEngine.js`, `learningPathEngine.js`, `recommendationEngine.js`, `advancedChallenges.js`, plus `index.css`, `App.css`, `assets/`.

### 1.2 Pages (preserve all of them)

`Dashboard`, `My Courses` (course grid, click opens lesson checklist), `Assessment`, `AI Tutor`, `My Progress`, `Settings`, plus the `Auth` screen (login/register) and header features: notifications dropdown, search dropdown (opens a course directly), mobile sidebar.

### 1.3 Content to migrate into the database

**Courses and lessons** (5 lessons each):

- HTML Fundamentals: Introduction to HTML; HTML Elements and Tags; HTML Attributes; HTML Forms and Input Elements; HTML Tables and Semantic Elements
- CSS Fundamentals: Introduction to CSS; CSS Selectors; Colors and Backgrounds; Flexbox and Grid; Responsive Web Design
- JavaScript: Introduction to JavaScript; Variables and Data Types; Functions and Scope; DOM Manipulation; Events and Event Handling
- React Development: Introduction to React; Components and JSX; Props and State; React Hooks; React Router

Course card metadata (color, bg, icon, iconColor, category) currently lives in `App.jsx`; move it into the course document as a `ui` object.

**Questions:** 16 regular questions (4 per difficulty: Beginner IDs 1–8 = 2 per topic, Intermediate IDs 9–12 = 1 per topic, Advanced IDs 13–16 = 1 per topic) are hardcoded in `Assessment.jsx`. 12 challenge questions (3 stages × 4, IDs 101–104, 201–204, 301–304) are in `advancedChallenges.js`. The seed script must **read these from the existing files** (copy them into `server/seed/` as JSON first) so no question is retyped by hand.

### 1.4 Logic specs to port exactly

**Adaptive difficulty** — `calculateNextDifficulty(correct, total, currentLevel)` returns `{ level, message, mastered }`. If `total <= 0` return Beginner with "Start with beginner-level questions." Otherwise `accuracy = correct/total*100`:

- Beginner: `>=80` → Intermediate ("Excellent! You have unlocked Intermediate level!"); `>=50` → Beginner ("Good effort! Keep practising Beginner-level questions."); else Beginner ("Keep practising your basics. You can do it!")
- Intermediate: `>=80` → Advanced ("Great performance! You have unlocked Advanced level."); `>=50` → Intermediate ("Good effort! Keep improving at this level."); else Beginner ("Let's strengthen your fundamentals.")
- Advanced: `===100` → Advanced, `mastered: true` ("Outstanding! You have mastered the Advanced level!"); `>=50` → Advanced ("Excellent work! Try more challenging Advanced questions."); else Intermediate ("Let's revise Intermediate topics before trying Advanced again.")

**Recommendations** — per topic result `{topic, correct, total}`: `percentage = total>0 ? round(correct/total*100) : 0`. `<50` High "You need more practice in this topic."; `<70` Medium "Revise this topic and solve more questions."; else Low "Good performance! Try advanced questions." `suggestion` comes from this map, fallback `Revise {topic} and practise more questions.`:

- HTML: "Revise HTML tags, forms, semantic elements, and page structure."
- CSS: "Practice selectors, box model, Flexbox, Grid, and responsive design."
- JavaScript: "Revise variables, functions, arrays, objects, and DOM manipulation."
- React: "Practice components, props, state, hooks, and event handling."

Sort ascending by percentage.

**Learning path** — filter out `total === 0`; same thresholds; High → "Revise fundamentals and practise beginner questions." 45 minutes; Medium → "Review concepts and solve intermediate questions." 30 minutes; Low → "Attempt advanced questions to improve mastery." 20 minutes; sort ascending by percentage; assign `step` from 1.

**Dashboard stats:** Enrolled Courses = number of courses; Completed Lessons = total across courses; Average Score = mean of attempt percentages; Learning Streak = consecutive days with activity; Daily Study Goal = assessments completed today vs goal of 3.

**Advanced Challenge rules:** a challenge can start only when the student is at Advanced and has a 100% result on an Advanced assessment. Stage 1 → 2 → 3 each require 100% on the previous stage. Completing stage 3 with 100% marks the final challenge complete.

### 1.5 Known issues this upgrade must fix

1. `topicResults` can divide by zero when a topic has no questions → guard it.
2. `Assessment` should report completion so the app refreshes immediately (handled by React Query invalidation).
3. Plain-text passwords and client-side auth → real auth (M2).
4. Answers are visible in the browser → server-side grading (M5).
5. AI Tutor is not AI → real LLM (M7–M8).
6. `App.jsx`/`Assessment.jsx` monoliths → split (M10–M11).
7. Boilerplate README → real docs (M15).

---

## 2. Target architecture

```
learnai/
├── client/                  # existing Vite React app, moved here
│   └── src/
│       ├── api/             # fetch client, endpoint functions
│       ├── context/         # AuthContext
│       ├── hooks/           # React Query hooks
│       ├── components/      # shared UI (ProgressBar, CourseCard, ...)
│       ├── pages/           # Dashboard, Courses, Assessment, Tutor, Progress, Settings, Auth, admin/*
│       ├── layout/          # Shell: sidebar, header, notifications, search
│       └── lib/             # pure helpers
├── server/
│   ├── src/
│   │   ├── config/          # env parsing (zod), db connection
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # one file per area
│   │   ├── controllers/
│   │   ├── services/        # business logic, engines, ai/
│   │   ├── middleware/      # auth, validate, errors, rateLimit
│   │   ├── utils/
│   │   └── app.ts / server.ts
│   ├── seed/                # JSON + seed script
│   └── tests/
├── DECISIONS.md
├── README.md
└── package.json             # npm workspaces: client, server
```

**Stack:** Server in TypeScript — Node 20+, Express, Mongoose, zod, bcrypt, jsonwebtoken, helmet, cors, cookie-parser, express-rate-limit, express-mongo-sanitize (or equivalent), pino for logs. Client stays Vite + React (JSX is fine; TypeScript optional later). Data fetching with TanStack Query and React Router.

**Environment variables (server `.env`, with a committed `.env.example`):**

```
NODE_ENV=development
PORT=4000
MONGODB_URI=
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
AI_PROVIDER=gemini
AI_API_KEY=
AI_MODEL=
AI_TIMEOUT_MS=20000
```

Client: `VITE_API_URL=http://localhost:4000/api`.

---

## 3. Modules

### M0 — Repo restructure and tooling

**Goal:** monorepo skeleton without breaking the existing app.

**Tasks**

- Create npm workspaces: move the existing app into `client/`; create empty `server/`.
- Root scripts: `dev` (runs client and server together), `lint`, `test`, `build`.
- Add Prettier, ESLint for the server, `.gitignore`, `.env.example`, `DECISIONS.md`.

**Acceptance**

- `npm run dev` at the root still serves the existing app unchanged at `localhost:5173`.
- Lint passes in both workspaces.
