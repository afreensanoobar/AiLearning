import { useState, useEffect } from "react";
import {
  BrainCircuit,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  Target,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { calculateNextDifficulty } from "./adaptiveEngine";
import { generateRecommendations } from "./recommendationEngine";
import { advancedChallenges } from "./advancedChallenges";

// Assessment question bank
const questions = [
  {
    id: 1,
    topic: "HTML",
    difficulty: "Beginner",
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language",
    ],
    answer: 0,
  },
  {
    id: 2,
    topic: "HTML",
    difficulty: "Beginner",
    question: "Which tag is used to create a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: 1,
  },
  {
    id: 3,
    topic: "CSS",
    difficulty: "Beginner",
    question: "Which property changes text color?",
    options: ["font-style", "background", "color", "text-size"],
    answer: 2,
  },
  {
    id: 4,
    topic: "CSS",
    difficulty: "Beginner",
    question: "Which CSS property controls element spacing inside its border?",
    options: ["margin", "padding", "border", "display"],
    answer: 1,
  },
  {
    id: 5,
    topic: "JavaScript",
    difficulty: "Beginner",
    question: "Which keyword declares a block-scoped variable?",
    options: ["var", "let", "define", "static"],
    answer: 1,
  },
  {
    id: 6,
    topic: "JavaScript",
    difficulty: "Beginner",
    question: "Which operator checks strict equality?",
    options: ["=", "==", "===", "!="],
    answer: 2,
  },
  {
    id: 7,
    topic: "React",
    difficulty: "Beginner",
    question: "What is React primarily used for?",
    options: [
      "Database management",
      "Building user interfaces",
      "Operating systems",
      "Server hardware",
    ],
    answer: 1,
  },
  {
    id: 8,
    topic: "React",
    difficulty: "Beginner",
    question: "Which React Hook manages component state?",
    options: ["useEffect", "useState", "useRef", "useMemo"],
    answer: 1,
  },

  {
    id: 9,
    topic: "HTML",
    difficulty: "Intermediate",
    question: "Which HTML attribute is used to provide alternative text for an image?",
    options: ["title", "alt", "src", "href"],
    answer: 1,
  },
  {
    id: 10,
    topic: "CSS",
    difficulty: "Intermediate",
    question:
      "Which CSS layout system is primarily designed for two-dimensional layouts?",
    options: ["Flexbox", "Grid", "Float", "Inline"],
    answer: 1,
  },
  {
    id: 11,
    topic: "JavaScript",
    difficulty: "Intermediate",
    question: "What does the map() method return?",
    options: [
      "A new array",
      "A single number",
      "The original array only",
      "A boolean value",
    ],
    answer: 0,
  },
  {
    id: 12,
    topic: "React",
    difficulty: "Intermediate",
    question: "What is the purpose of the useEffect Hook?",
    options: [
      "To create CSS styles",
      "To handle side effects",
      "To create components",
      "To define routes",
    ],
    answer: 1,
  },

  {
    id: 13,
    topic: "HTML",
    difficulty: "Advanced",
    question: "Which attribute makes a form control mandatory before submission?",
    options: ["validate", "required", "mandatory", "checked"],
    answer: 1,
  },
  {
    id: 14,
    topic: "CSS",
    difficulty: "Advanced",
    question: "Which CSS property defines the stacking order of positioned elements?",
    options: ["position", "display", "z-index", "overflow"],
    answer: 2,
  },
  {
    id: 15,
    topic: "JavaScript",
    difficulty: "Advanced",
    question: "What is a closure in JavaScript?",
    options: [
      "A function bundled with its lexical environment",
      "A method that closes a browser window",
      "A loop that never ends",
      "A CSS property",
    ],
    answer: 0,
  },
  {
    id: 16,
    topic: "React",
    difficulty: "Advanced",
    question: "Why are keys used when rendering lists in React?",
    options: [
      "To style list items",
      "To help React identify changed elements",
      "To create unique CSS classes",
      "To store component state",
    ],
    answer: 1,
  },
];

function getSavedProgress() {
  try {
    const saved = localStorage.getItem("adaptiveLearningProgress");
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error("Unable to load saved progress:", error);
    return {};
  }
}

function Assessment({ onComplete }) {
  const savedProgress = getSavedProgress();
  const [current, setCurrent] = useState(savedProgress.current ?? 0);
  const [answers, setAnswers] = useState(savedProgress.answers ?? {});
  const [submitted, setSubmitted] = useState(savedProgress.submitted ?? false);

  const [difficulty, setDifficulty] = useState(savedProgress.difficulty ?? "Beginner");

  const [challengeStage, setChallengeStage] = useState(savedProgress.challengeStage ?? 1);

  const [isChallenge, setIsChallenge] = useState(savedProgress.isChallenge ?? false);

  useEffect(() => {
    const progress = {
      current,
      answers,
      submitted,
      difficulty,
      challengeStage,
      isChallenge,
    };

    localStorage.setItem("adaptiveLearningProgress", JSON.stringify(progress));
  }, [current, answers, submitted, difficulty, challengeStage, isChallenge]);

  const quizQuestions = isChallenge
    ? advancedChallenges[challengeStage]
    : questions.filter((q) => q.difficulty === difficulty);

  const question = quizQuestions[current];

  const score = quizQuestions.filter((q) => answers[q.id] === q.answer).length;

  const percentage = Math.round((score / quizQuestions.length) * 100);

  const adaptiveResult = calculateNextDifficulty(score, quizQuestions.length, difficulty);

  // Advanced Challenge conditions
  const challengePassed = isChallenge && percentage === 100;

  const canStartChallenge =
    !isChallenge && difficulty === "Advanced" && percentage === 100;

  const finalChallengeCompleted = isChallenge && challengeStage === 3 && challengePassed;

  // Calculate topic-wise performance
  const topicResults = ["HTML", "CSS", "JavaScript", "React"].map((topic) => {
    const topicQuestions = quizQuestions.filter((q) => q.topic === topic);

    const correct = topicQuestions.filter((q) => answers[q.id] === q.answer).length;

    const total = topicQuestions.length;

    return {
      topic,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });

  const weakTopics = topicResults.filter((item) => item.percentage < 60);
  const recommendations = generateRecommendations(topicResults);

  const handleSubmit = () => {
    if (Object.keys(answers).length !== quizQuestions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const newRecord = {
      id: Date.now(),
      type: isChallenge ? "Advanced Challenge" : "Assessment",
      difficulty,
      challengeStage: isChallenge ? challengeStage : null,
      score,
      totalQuestions: quizQuestions.length,
      percentage,
      topicResults,
      completedAt: new Date().toISOString(),
    };

    try {
      const previousHistory = JSON.parse(
        localStorage.getItem("assessmentHistory") || "[]"
      );

      const updatedHistory = [...previousHistory, newRecord];

      localStorage.setItem("assessmentHistory", JSON.stringify(updatedHistory));

      setSubmitted(true);

      // Notify parent so dashboard stats refresh immediately
      if (typeof onComplete === "function") {
        onComplete(updatedHistory);
      }
    } catch (error) {
      console.error("Unable to save assessment history:", error);
      alert("Unable to save your assessment history.");
    }
  };

  const restartQuiz = () => {
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);

    if (isChallenge) {
      setIsChallenge(true);
    } else {
      setDifficulty(adaptiveResult.level);
    }
  };

  const startAdvancedChallenge = () => {
    setChallengeStage(1);
    setIsChallenge(true);
    setDifficulty("Advanced");
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
  };

  const goToNextChallenge = () => {
    setChallengeStage((previous) => previous + 1);
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
    setIsChallenge(true);
  };

  // Results screen
  if (submitted) {
    return (
      <div className="space-y-7">
        <div className="rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-8 text-white">
          <Trophy size={40} className="mb-4" />

          <p className="text-violet-200">Assessment Completed</p>

          <h2 className="mt-2 text-3xl font-bold">Your Performance Report</h2>

          <div className="mt-6 flex flex-wrap items-center gap-8">
            <div>
              <p className="text-sm text-violet-200">Your Score</p>
              <h3 className="text-5xl font-bold">{percentage}%</h3>
            </div>

            <div>
              <p className="text-sm text-violet-200">Correct Answers</p>
              <h3 className="text-3xl font-bold">
                {score}/{quizQuestions.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <Target className="text-violet-600" />
              <h3 className="text-lg font-bold">Topic-wise Analysis</h3>
            </div>

            <div className="space-y-5">
              {topicResults.map((item) => (
                <div key={item.topic}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium">{item.topic}</span>
                    <span className="font-semibold">{item.percentage}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        item.percentage >= 60 ? "bg-emerald-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <BrainCircuit className="text-violet-600" />
              <h3 className="text-lg font-bold">Learning Analysis</h3>
            </div>

            {percentage >= 80 ? (
              <div className="rounded-xl bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle className="mb-2" />
                <p className="font-semibold">Excellent performance!</p>
                <p className="mt-2 text-sm">
                  You have demonstrated strong understanding. Try more advanced questions.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-orange-50 p-4 text-orange-800">
                <Target className="mb-2" />
                <p className="font-semibold">Areas for improvement</p>
                <p className="mt-2 text-sm">
                  Revise your weaker topics and practice additional questions.
                </p>
              </div>
            )}

            <h4 className="mb-3 mt-5 font-semibold">Recommended topics</h4>

            {weakTopics.length > 0 ? (
              weakTopics.map((item) => (
                <div
                  key={item.topic}
                  className="mb-2 flex items-center gap-2 text-sm text-slate-600"
                >
                  <BookOpen size={16} className="text-violet-600" />
                  {item.topic} – needs revision
                </div>
              ))
            ) : (
              <p className="text-sm text-emerald-700">
                No major weak topics identified. Keep progressing!
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Personalized Recommendation Engine */}
          <div className="rounded-2xl border border-violet-100 bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <Sparkles className="text-violet-600" />
              <div>
                <h3 className="text-lg font-bold">
                  Personalized Learning Recommendations
                </h3>
                <p className="text-sm text-slate-500">
                  Suggestions based on your assessment performance
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {recommendations.map((item) => (
                <div
                  key={item.topic}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold text-slate-800">{item.topic}</h4>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : item.priority === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-600">Score: {item.percentage}%</p>

                  <p className="mt-2 text-sm text-slate-700">{item.message}</p>

                  <p className="mt-2 text-sm text-violet-700">
                    <BookOpen size={15} className="mr-1 inline" />
                    {item.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Adaptive Learning Result */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <BrainCircuit className="text-indigo-600" size={24} />
              <h3 className="text-lg font-bold">Adaptive Learning Analysis</h3>
            </div>

            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-sm font-medium text-indigo-700">
                Recommended Next Difficulty
              </p>

              <h4 className="mt-2 text-2xl font-bold text-indigo-900">
                {adaptiveResult.level}
              </h4>

              <p className="mt-2 text-sm text-indigo-700">{adaptiveResult.message}</p>

              <p className="mt-3 text-xs text-indigo-500">
                Based on your accuracy of {percentage}%
              </p>
            </div>
          </div>

          {finalChallengeCompleted && (
            <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-6 text-center">
              <div className="text-5xl mb-3">🏆</div>

              <h2 className="text-2xl font-bold text-yellow-800">Advanced Master!</h2>

              <p className="mt-2 text-yellow-700 font-medium">
                Outstanding achievement! You scored {percentage}% at the Advanced level.
              </p>

              <p className="mt-3 text-sm text-yellow-700">
                You have successfully mastered this assessment. Keep learning with new
                challenges!
              </p>

              <div className="mt-4 inline-block rounded-full bg-yellow-200 px-4 py-2 text-sm font-semibold text-yellow-900">
                Achievement Unlocked
              </div>
            </div>
          )}

          {canStartChallenge && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 text-center">
              <h3 className="text-xl font-bold text-violet-900">
                Advanced Challenge Unlocked!
              </h3>

              <p className="mt-2 text-sm text-violet-700">
                You scored 100% in the Advanced assessment. Ready for a tougher challenge?
              </p>

              <button
                onClick={startAdvancedChallenge}
                className="mt-4 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700"
              >
                Start Challenge 1
              </button>
            </div>
          )}

          {/* Next Challenge Button */}
          {isChallenge && challengePassed && challengeStage < 3 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <h3 className="text-xl font-bold text-emerald-900">
                Challenge {challengeStage} Completed!
              </h3>

              <p className="mt-2 text-sm text-emerald-700">
                Excellent! You scored 100%. The next challenge is unlocked.
              </p>

              <button
                onClick={goToNextChallenge}
                className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                Start Challenge {challengeStage + 1}
              </button>
            </div>
          )}

          <div className="flex w-full items-start">
            <button
              onClick={restartQuiz}
              style={{
                width: "fit-content",
                height: "auto",
                alignSelf: "flex-start",
              }}
              className="inline-flex flex-none items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              <RotateCcw size={17} />
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-violet-600">
              <Sparkles size={18} />
              <span className="text-sm font-semibold">KNOWLEDGE ASSESSMENT</span>
            </div>

            <h2 className="mt-3 text-2xl font-bold">Computer Science Assessment</h2>

            <p className="mt-2 text-sm text-slate-500">
              Test your knowledge of HTML, CSS, JavaScript and React.
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 px-4 py-3 text-center">
            <p className="text-xs text-violet-500">Total Questions</p>
            <p className="text-xl font-bold text-violet-700">{quizQuestions.length}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-semibold text-violet-600">
            Question {current + 1} of {quizQuestions.length}
          </span>

          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
            {question.topic}
          </span>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-violet-600 transition-all"
            style={{
              width: `${((current + 1) / quizQuestions.length) * 100}%`,
            }}
          />
        </div>

        <h3 className="mb-7 text-xl font-bold leading-relaxed">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const selected = answers[question.id] === index;

            return (
              <button
                key={index}
                onClick={() =>
                  setAnswers((previous) => ({
                    ...previous,
                    [question.id]: index,
                  }))
                }
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-violet-600 bg-violet-50 text-violet-800"
                    : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                    selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>

                <span className="text-sm font-medium">{option}</span>

                {selected && (
                  <CheckCircle className="ml-auto text-violet-600" size={19} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setCurrent((value) => value - 1)}
            disabled={current === 0}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          {current < quizQuestions.length - 1 ? (
            <button
              onClick={() => setCurrent((value) => value + 1)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Next Question
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Submit Assessment
              <CheckCircle size={17} />
            </button>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          {Object.keys(answers).length} of {quizQuestions.length} questions answered
        </p>
      </div>
    </div>
  );
}

export default Assessment;
