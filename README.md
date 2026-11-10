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

Set `MONGODB_URI` in `.env` to a running MongoDB instance before starting the API. Then open **http://localhost:5173** in your browser. The API health check is available at **http://localhost:4000/api/health**.

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
