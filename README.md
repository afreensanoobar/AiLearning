# LearnAI – Personalized Adaptive Learning Platform

A college project built with **React + Vite + Tailwind CSS** that provides an adaptive, personalized learning experience for web development students.

---

## Features

- **Adaptive Assessments** – Quiz difficulty auto-adjusts (Beginner → Intermediate → Advanced) based on performance
- **Advanced Challenges** – 3 unlockable challenge stages after mastering the Advanced level
- **AI Tutor** – Interactive chatbot explaining HTML, CSS, JavaScript, and React concepts at your level
- **My Courses** – Track lesson-by-lesson progress across 4 courses with live checkboxes
- **My Progress** – Topic-wise performance charts, personalized learning path, and full assessment history
- **AI Recommendations** – Personalized study suggestions based on weak topics
- **Learning Streak** – Consecutive-day activity tracker
- **Auth** – Client-side register/login system (demo purposes)

The backend auth API is now available at `/api/auth` and `/api/users/me` (register, login, logout, current user, profile and password endpoints). It uses one signed JWT in an httpOnly cookie; there is no refresh-token flow. Logging out or changing a password clears the browser cookie, but a copied JWT remains valid until it expires. The current React screen still uses demo localStorage authentication; it is connected to the API in a later frontend module.

Seed the initial course, lesson, and assessment-question content after configuring MongoDB:

```bash
npm run seed -w server
```

Authenticated read endpoints are available at `GET /api/courses`, `GET /api/courses/:slug`, and `GET /api/lessons/:id`. Quiz questions (including their answers) are stored for later assessment APIs and are not exposed by these content endpoints.

Lesson progress is stored per user and course. Use `GET /api/progress/courses` to read course percentages, `POST /api/lessons/:id/complete` to mark a lesson complete, and `DELETE /api/lessons/:id/complete` to undo it. These endpoints require the auth cookie.

Assessments are created with `POST /api/assessments/start` and `{ "mode": "assessment" }` or `{ "mode": "challenge" }`. Save each selection with `PATCH /api/assessments/:id/answer`, then submit with `POST /api/assessments/:id/submit`. Correct answers and explanations are returned only after submission. Use `GET /api/assessments/history` and `GET /api/assessments/:id` to review attempts.

Progress analytics are available at `GET /api/progress/summary`, `/topics`, `/recommendations`, `/path`, and `/trend`. The summary uses the user's saved timezone to count today's assessments and activity streaks. Since older lesson progress did not store completion dates, streak history for lessons starts when timestamped activity tracking is introduced.

---

## Topics Covered

| Course            | Lessons   |
| ----------------- | --------- |
| HTML Fundamentals | 5 lessons |
| CSS Fundamentals  | 5 lessons |
| JavaScript        | 5 lessons |
| React Development | 5 lessons |

---

## Tech Stack

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| React 19             | UI framework            |
| Vite 8               | Build tool & dev server |
| Tailwind CSS 4       | Styling                 |
| Lucide React         | Icons                   |
| Browser localStorage | All state persistence   |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Nuba743/CollegeProject.git
cd CollegeProject

# Install dependencies
npm install

# Copy the example environment file and start MongoDB
cp .env.example .env

# Start the dev server
npm run dev
```

Set `MONGODB_URI` in `.env` to a running MongoDB instance, and replace `JWT_SECRET` with a private random value of at least 32 characters before starting the API. Auth cookies expire after the configured `JWT_TTL` (7 days by default); users sign in again when it expires. Then open **http://localhost:5173** in your browser. The API health check is available at **http://localhost:4000/api/health**.

**Other commands:**

```bash
npm run build                 # Build client and server
npm run preview -w client     # Preview the production client
npm run lint                  # Lint both workspaces
npm run test                  # Run workspace tests
```

---

## Project Structure

```
client/
└── src/
    ├── App.jsx                 # Root component — shell, navigation, all pages
    ├── Auth.jsx                # Login / Register form
    ├── Assessment.jsx          # Adaptive quiz engine
    ├── AITutor.jsx             # Interactive chatbot tutor
    ├── adaptiveEngine.js       # Difficulty level calculator
    ├── learningPathEngine.js   # Personalized study path generator
    ├── recommendationEngine.js # Topic recommendation engine
    └── advancedChallenges.js   # Advanced challenge question bank
server/
└── src/
    ├── app.ts                  # Express application and middleware
    ├── config/                 # Environment and MongoDB connection
    ├── middleware/             # Validation and error handling
    └── server.ts               # Startup and graceful shutdown
```

---

## How the Adaptive Engine Works

```
Score ≥ 80%  →  Promote to next level
Score ≥ 50%  →  Stay at current level
Score < 50%  →  Drop to previous level
Score = 100% at Advanced  →  Mastery achieved → Unlock challenge stages
```

---

## Notes

- All data is stored in `localStorage` — no backend required
- The AI Tutor uses a rule-based keyword engine (not a live AI API)
- Passwords are stored in plain text — this is a demo project only

---

> Built as a college final project | 2026
