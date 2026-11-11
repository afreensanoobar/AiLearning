import { useState } from "react";
import {
  BookOpen,
  ClipboardCheck,
  Clock3,
  ArrowUpRight,
  Play,
  Sparkles,
  Target,
  Flame,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import Assessment from "./Assessment";
import AITutor from "./AITutor";
import { generateRecommendations } from "./recommendationEngine";
import { generateLearningPath } from "./learningPathEngine";
import AppShell from "./layout/AppShell";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

const pageRoutes = {
  Dashboard: "/dashboard",
  "My Courses": "/courses",
  Assessment: "/assessment",
  "AI Tutor": "/tutor",
  "My Progress": "/progress",
  Settings: "/settings",
};

function activePageForPath(path) {
  if (path.startsWith("/courses")) return "My Courses";
  if (path.startsWith("/assessment")) return "Assessment";
  if (path.startsWith("/tutor")) return "AI Tutor";
  if (path.startsWith("/progress")) return "My Progress";
  if (path.startsWith("/settings")) return "Settings";
  return "Dashboard";
}

function courseSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const courseNamesBySlug = {
  "html-fundamentals": "HTML Fundamentals",
  "css-fundamentals": "CSS Fundamentals",
  javascript: "JavaScript",
  "react-development": "React Development",
};

function LearningApp() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activePage = activePageForPath(location.pathname);
  const selectedCourse = Object.keys(courseNamesBySlug).find(
    (slug) => slug === location.pathname.split("/")[2]
  )
    ? courseNamesBySlug[location.pathname.split("/")[2]]
    : null;
  const setActivePage = (page) => navigate(pageRoutes[page] || "/dashboard");
  const setSelectedCourse = (name) =>
    navigate(name ? `/courses/${courseSlug(name)}` : "/courses");
  const [studentName, setStudentName] = useState(user?.name || "Learner");
  const [studentEmail, setStudentEmail] = useState(user?.email || "");
  const [completedLessons, setCompletedLessons] = useState({});

  const toggleLessonComplete = (courseName, lesson) => {
    setCompletedLessons((previous) => {
      const courseLessons = previous[courseName] || [];

      const updatedLessons = courseLessons.includes(lesson)
        ? courseLessons.filter((item) => item !== lesson)
        : [...courseLessons, lesson];

      const updated = {
        ...previous,
        [courseName]: updatedLessons,
      };

      return updated;
    });
  };

  const courseDetails = {
    "HTML Fundamentals": [
      "Introduction to HTML",
      "HTML Elements and Tags",
      "HTML Attributes",
      "HTML Forms and Input Elements",
      "HTML Tables and Semantic Elements",
    ],

    "CSS Fundamentals": [
      "Introduction to CSS",
      "CSS Selectors",
      "Colors and Backgrounds",
      "Flexbox and Grid",
      "Responsive Web Design",
    ],

    JavaScript: [
      "Introduction to JavaScript",
      "Variables and Data Types",
      "Functions and Scope",
      "DOM Manipulation",
      "Events and Event Handling",
    ],

    "React Development": [
      "Introduction to React",
      "Components and JSX",
      "Props and State",
      "React Hooks",
      "React Router",
    ],
  };

  const getCourseProgress = (courseName) => {
    const totalLessons = courseDetails[courseName]?.length || 0;
    const completed = completedLessons[courseName]?.length || 0;

    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  };

  // Total completed lessons across all courses
  const totalCompletedLessons = Object.values(completedLessons).reduce(
    (sum, lessons) => sum + lessons.length,
    0
  );

  const [settingsSaved, setSettingsSaved] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);

  const topicNames = ["HTML", "CSS", "JavaScript", "React"];

  const topicPerformance = topicNames.map((topic) => {
    const correct = assessmentHistory.reduce((sum, record) => {
      const result = record.topicResults?.find((item) => item.topic === topic);

      return sum + (result?.correct || 0);
    }, 0);

    const total = assessmentHistory.reduce((sum, record) => {
      const result = record.topicResults?.find((item) => item.topic === topic);

      return sum + (result?.total || 0);
    }, 0);

    return {
      topic,
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  });
  const recommendations = generateRecommendations(topicPerformance);
  const learningPath = generateLearningPath(topicPerformance);

  const completedAssessments = assessmentHistory.length;

  const averageScore =
    completedAssessments > 0
      ? Math.round(
          assessmentHistory.reduce((total, record) => total + record.percentage, 0) /
            completedAssessments
        )
      : 0;

  // Learning streak: count consecutive days with at least one assessment
  const learningStreak = (() => {
    if (assessmentHistory.length === 0) return 0;

    const uniqueDays = [
      ...new Set(
        assessmentHistory.map((r) => new Date(r.completedAt).toLocaleDateString())
      ),
    ].sort((a, b) => new Date(b) - new Date(a));

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1]);
      const curr = new Date(uniqueDays[i]);
      const diff = (prev - curr) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  })();

  // Real-time course list from courseDetails
  const courseList = Object.entries(courseDetails).map(([name], index) => {
    const colors = [
      {
        color: "bg-violet-500",
        bg: "bg-violet-100",
        icon: "HTML",
        iconColor: "text-violet-700",
        category: "Web Fundamentals",
      },
      {
        color: "bg-blue-500",
        bg: "bg-blue-100",
        icon: "CSS",
        iconColor: "text-blue-700",
        category: "Web Fundamentals",
      },
      {
        color: "bg-yellow-500",
        bg: "bg-yellow-100",
        icon: "JS",
        iconColor: "text-yellow-700",
        category: "Programming",
      },
      {
        color: "bg-emerald-500",
        bg: "bg-emerald-100",
        icon: "RE",
        iconColor: "text-emerald-700",
        category: "Web Development",
      },
    ];
    return {
      name,
      progress: getCourseProgress(name),
      ...colors[index],
    };
  });

  const dashboardRecommendations = recommendations.map((item) => ({
    title: `${item.topic} Practice`,
    reason: item.suggestion,
    level: item.priority,
  }));

  return (
    <AppShell activePage={activePage}>
      {activePage === "Assessment" ? (
        <Assessment
          onComplete={(record) =>
            setAssessmentHistory((previous) => [...previous, record])
          }
        />
      ) : activePage === "AI Tutor" ? (
        <AITutor />
      ) : activePage === "My Courses" && selectedCourse ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCourse(null)}
            className="rounded-xl bg-violet-50 px-4 py-2 font-semibold text-violet-700 hover:bg-violet-100"
          >
            ← Back to My Courses
          </button>

          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-2xl font-bold">{selectedCourse}</h2>

            <p className="mt-2 text-sm text-slate-500">
              Complete lessons to improve your course progress.
            </p>

            <div className="mt-5 flex justify-between">
              <span className="font-semibold">Course Progress</span>
              <span className="font-bold text-violet-600">
                {getCourseProgress(selectedCourse)}%
              </span>
            </div>

            <div className="mt-3 h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-violet-600 transition-all"
                style={{ width: `${getCourseProgress(selectedCourse)}%` }}
              />
            </div>
          </section>

          <section className="rounded-2xl border bg-white p-6">
            <h3 className="mb-5 text-lg font-bold">Course Lessons</h3>

            <div className="space-y-4">
              {courseDetails[selectedCourse].map((lesson, index) => (
                <label
                  key={lesson}
                  className="flex cursor-pointer items-center gap-4 rounded-xl border p-4 hover:bg-violet-50"
                >
                  <input
                    type="checkbox"
                    checked={(completedLessons[selectedCourse] || []).includes(lesson)}
                    onChange={() => toggleLessonComplete(selectedCourse, lesson)}
                    className="h-5 w-5 accent-violet-600"
                  />

                  <span className="font-medium">
                    {index + 1}. {lesson}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>
      ) : activePage === "My Courses" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">My Courses</h2>
            <p className="text-slate-500">Explore your enrolled learning courses.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courseList.map((course) => (
              <div
                key={course.name}
                onClick={() => setSelectedCourse(course.name)}
                className="bg-white border rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-violet-400 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-sm ${course.bg} ${course.iconColor}`}
                  >
                    {course.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{course.name}</h3>
                    <p className="text-xs text-slate-400">{course.category}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  {course.progress}% completed
                </p>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${course.color} transition-all`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {completedLessons[course.name]?.length || 0} /{" "}
                  {courseDetails[course.name].length} lessons completed
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : activePage === "My Progress" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">My Learning Progress</h2>
            <p className="text-slate-500 mt-1">
              Track your performance and learning journey.
            </p>
          </div>

          {/* Progress statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl border p-5">
              <p className="text-slate-500 text-sm">Total Assessments</p>
              <h3 className="text-3xl font-bold mt-3">{completedAssessments}</h3>
            </div>

            <div className="bg-white rounded-2xl border p-5">
              <p className="text-slate-500 text-sm">Average Score</p>
              <h3 className="text-3xl font-bold mt-3 text-violet-600">{averageScore}%</h3>
            </div>

            <div className="bg-white rounded-2xl border p-5">
              <p className="text-slate-500 text-sm">Best Score</p>
              <h3 className="text-3xl font-bold mt-3 text-emerald-600">
                {completedAssessments > 0
                  ? Math.max(...assessmentHistory.map((record) => record.percentage))
                  : 0}
                %
              </h3>
            </div>
          </section>

          {/* Topic-wise Performance */}
          <section className="bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold mb-2">Topic-wise Performance</h3>

            <p className="text-sm text-slate-500 mb-6">
              Track your accuracy in each learning topic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {topicPerformance.map((item) => (
                <div key={item.topic}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-700">{item.topic}</span>

                    <span className="font-semibold text-violet-600">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-violet-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {item.correct} correct out of {item.total} questions
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Personalized Learning Path */}
          <section className="bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold mb-2">Your Personalized Learning Path</h3>

            <p className="text-sm text-slate-500 mb-6">
              Follow these steps to improve your weaker topics.
            </p>

            {learningPath.length === 0 ? (
              <p className="text-sm text-slate-500">
                Complete an assessment to generate your learning path.
              </p>
            ) : (
              <div className="space-y-5">
                {learningPath.map((item) => (
                  <div
                    key={item.topic}
                    className="flex gap-4 border-b border-slate-100 pb-5 last:border-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                      {item.step}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-semibold">{item.topic}</h4>

                        <span className="text-sm font-semibold text-violet-600">
                          {item.percentage}%
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500">{item.action}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {item.priority} Priority
                        </span>

                        <span className="text-xs text-slate-400">
                          <Clock3 size={14} className="inline mr-1" />
                          {item.estimatedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Assessment history */}
          <section className="bg-white rounded-2xl border p-6">
            <h3 className="text-lg font-bold mb-5">Assessment History</h3>

            {assessmentHistory.length === 0 ? (
              <p className="text-slate-500">No assessments completed yet.</p>
            ) : (
              <div className="space-y-4">
                {[...assessmentHistory].reverse().map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-800">{record.type}</h4>

                      <p className="text-sm text-slate-500">
                        {record.difficulty}
                        {record.challengeStage
                          ? ` - Challenge ${record.challengeStage}`
                          : ""}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(record.completedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-violet-600">
                        {record.percentage}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {record.score}/{record.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : activePage === "Settings" ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p className="text-slate-500 mt-1">
              Manage your learning platform preferences.
            </p>
          </div>

          <section className="bg-white rounded-2xl border p-6 space-y-5">
            <h3 className="text-lg font-bold">Account Settings</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Student Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>

              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border p-3"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 3000);
                }}
                className="bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition"
              >
                Save Profile
              </button>

              {settingsSaved && (
                <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <CheckCircle size={18} /> Profile saved successfully!
                </span>
              )}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-slate-700 mb-3">Danger Zone</h4>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "This will clear all your assessment history and lesson progress. Are you sure?"
                    )
                  ) {
                    setAssessmentHistory([]);
                    setCompletedLessons({});
                  }
                }}
                className="rounded-xl border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Clear All Progress Data
              </button>
            </div>
          </section>
        </div>
      ) : (
        <>
          {/* Welcome banner */}
          <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 p-7 text-white shadow-lg sm:p-9">
            <div className="max-w-xl">
              <p className="mb-3 text-sm text-violet-200">YOUR PERSONAL LEARNING SPACE</p>

              <h2 className="text-2xl font-bold sm:text-3xl">Hello, {studentName} 👋</h2>

              <p className="mt-3 text-sm leading-6 text-violet-100">
                Every student learns differently. Your AI learning assistant is here to
                help you achieve your goals.
              </p>

              <button
                onClick={() => setActivePage("My Courses")}
                className="mt-6 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                Continue Learning <ArrowUpRight size={17} />
              </button>
            </div>
          </section>

          {/* Statistics */}
          <section className="mb-9 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Enrolled Courses",
                value: String(Object.keys(courseDetails).length).padStart(2, "0"),
                icon: BookOpen,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Completed Lessons",
                value: String(totalCompletedLessons).padStart(2, "0"),
                icon: ClipboardCheck,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
              {
                title: "Average Score",
                value: `${averageScore}%`,
                icon: Target,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                title: "Learning Streak",
                value: `${String(learningStreak).padStart(2, "0")} Days`,
                icon: Flame,
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <Icon size={21} className={stat.color} />
                    </div>
                  </div>

                  <h3 className="mt-4 text-2xl font-bold">{stat.value}</h3>
                </div>
              );
            })}
          </section>

          {/* Courses and recommendations */}
          <section className="grid grid-cols-1 gap-7 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">My Courses</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Continue where you left off
                  </p>
                </div>

                <button
                  onClick={() => setActivePage("My Courses")}
                  className="text-sm font-semibold text-violet-600"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {courseList.map((course) => (
                  <div
                    key={course.name}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${course.bg} ${course.iconColor}`}
                    >
                      {course.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-400">{course.category}</p>
                      <h3 className="mt-1 font-semibold">{course.name}</h3>

                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Course Progress</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${course.color} transition-all`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCourse(course.name);
                        setActivePage("My Courses");
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700 hover:bg-violet-100"
                    >
                      <Play size={15} /> Continue
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <div className="mb-5">
                <h2 className="text-lg font-bold">AI Recommendations</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Personalized for your learning
                </p>
              </div>

              <div className="space-y-4">
                {dashboardRecommendations.length > 0 ? (
                  dashboardRecommendations.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <Sparkles size={17} className="text-violet-600" />
                        <span className="text-xs font-semibold text-violet-600">
                          AI SUGGESTION
                        </span>
                      </div>

                      <h3 className="font-semibold">{item.title}</h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.reason}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {item.level}
                        </span>

                        <button
                          onClick={() => setActivePage("My Courses")}
                          className="text-sm font-semibold text-violet-600"
                        >
                          Explore <ChevronRight size={15} className="inline" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 text-center">
                    <Sparkles size={24} className="mx-auto mb-3 text-violet-400" />
                    <p className="text-sm text-slate-500">
                      Complete an assessment to get personalized AI recommendations.
                    </p>
                    <button
                      onClick={() => setActivePage("Assessment")}
                      className="mt-3 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      Take Assessment
                    </button>
                  </div>
                )}
              </div>

              {/* Study time */}
              <div className="mt-5 rounded-2xl bg-emerald-50 p-5">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Clock3 size={20} />
                  <h3 className="font-semibold">Daily Study Goal</h3>
                </div>

                <p className="mt-3 text-2xl font-bold text-emerald-800">
                  {completedAssessments} / 3 Assessments
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.min((completedAssessments / 3) * 100, 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-emerald-700">
                  {completedAssessments >= 3
                    ? "Daily goal achieved! 🎉"
                    : `${3 - completedAssessments} more assessment${3 - completedAssessments !== 1 ? "s" : ""} to reach your daily goal.`}
                </p>
              </div>
            </div>
          </section>

          <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs text-slate-400">
            © 2026 LearnAI – Personalized Learning Platform
          </footer>
        </>
      )}
    </AppShell>
  );
}

export default LearningApp;
