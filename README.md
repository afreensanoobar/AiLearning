# LearnAI – Personalized Adaptive Learning Platform

A college project that gives web development students an adaptive learning path: courses, quizzes, progress analytics, and an AI tutor. The app is a **React client** plus a **Node/Express API** with **MongoDB**.

---

## Features

- **Auth** – Register, login, and logout with one signed JWT in an httpOnly cookie
- **Adaptive assessments** – Difficulty moves Beginner → Intermediate → Advanced from quiz scores; perfect Advanced scores unlock challenge stages
- **AI tutor** – Streamed chat, saved sessions, and a rule-based fallback if Gemini is unavailable
- **Courses and lessons** – Four starter courses; lesson completion is stored per user
- **Progress** – Topic performance, learning path, recommendations, streak, and a seven-day AI study plan
- **Gamification** – Notifications, badges, and a display-name leaderboard
- **Admin** – Manage courses, lessons, questions (including AI drafts), users, and basic stats

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Client | React 19, Vite, Tailwind CSS, React Router, React Query |
| Server | Express, TypeScript, MongoDB/Mongoose, Zod, JWT cookies |
| AI | Gemini (optional); rule-based tutor if the key is missing |

---

## Getting started

```bash
git clone https://github.com/Nuba743/CollegeProject.git
cd CollegeProject
npm install
cp .env.example .env
```

Set `MONGODB_URI` to a running MongoDB instance and replace `JWT_SECRET` with a private random value of at least 32 characters.

```bash
npm run seed -w server
npm run dev
```

Open **http://localhost:5173**. The API health check is **http://localhost:4000/api/health**.

To promote an existing account to admin:

```bash
npm run make-admin -w server -- you@example.com
```

**Other commands**

```bash
npm run build
npm run lint
npm run test
npm run preview -w client
```

---

## Environment variables

| Name | Purpose |
| --- | --- |
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string |
| `CLIENT_URL` | Client origin for CORS (default `http://localhost:5173`) |
| `JWT_SECRET` | Cookie signing secret (min 32 characters) |
| `JWT_TTL` | Auth cookie lifetime (default `7d`) |
| `AI_PROVIDER` | Currently `gemini` |
| `AI_API_KEY` | Optional while developing; AI routes error clearly without it |
| `AI_MODEL` | Default `gemini-1.5-flash` |
| `AI_TIMEOUT_MS` | Provider timeout |
| `VITE_API_URL` | Client API base URL (default `http://localhost:4000/api`) |

---

## How the adaptive engine works

```
Score ≥ 80%  →  Promote to next level
Score ≥ 50%  →  Stay at current level
Score < 50%  →  Drop to previous level
Score = 100% at Advanced  →  Mastery achieved → Unlock challenge stages
```

Correct answers are returned only after a quiz is submitted.

---

## API overview

All routes are prefixed with `/api`. Authenticated routes need the `learnai_auth` cookie.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`; `GET /auth/me` |
| Users | `GET\|PATCH /users/me`, `POST /users/me/password`, `DELETE /users/me/progress` |
| Content | `GET /courses`, `/courses/:slug` |
| Lessons | `POST\|DELETE /lessons/:id/complete` |
| Assessments | `POST /assessments/start`, `PATCH /assessments/:id/answer`, `POST /assessments/:id/submit`, `POST /assessments/:id/explain`, `GET /assessments/history`, `GET /assessments/:id` |
| Progress | `GET /progress/summary`, `/courses`, `/topics`, `/recommendations`, `/path`, `/trend`; `POST /progress/ai-plan` |
| Tutor | `POST\|GET /tutor/sessions`, `GET\|DELETE /tutor/sessions/:id`, `POST /tutor/sessions/:id/messages` (SSE) |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` |
| Leaderboard | `GET /leaderboard` |
| Admin | `/admin/stats`, `/admin/courses`, `/admin/lessons`, `/admin/questions` (including `/generate`, approve/reject), `/admin/users` |

---

## Project structure

```
client/src/          React app (pages, hooks, API client)
server/src/          Express API, models, AI gateway, engines
server/test/         Node test runner + MongoDB memory server
```

---

## Notes

- Passwords are hashed with bcrypt. Auth uses one httpOnly JWT cookie (`SameSite=Lax`, path `/api`). There is no refresh-token flow; users sign in again after `JWT_TTL`.
- Logout and password changes clear the browser cookie. A copied JWT stays valid until it expires.
- Deactivated users cannot sign in, and their existing cookie is rejected on the next request.
- AI-generated questions are saved as drafts and stay out of student quizzes until an admin approves them.
- Seeded courses cover HTML, CSS, JavaScript, and React (five lessons each).

> Built as a college final project | 2026
