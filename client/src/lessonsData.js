const recommendationTargets = {
  HTML: { courseSlug: "html-fundamentals", title: "HTML Elements and Tags" },
  CSS: { courseSlug: "css-fundamentals", title: "Flexbox and Grid" },
  JavaScript: { courseSlug: "javascript", title: "Functions and Scope" },
  React: { courseSlug: "react-development", title: "React Hooks" },
};

export function getRecommendedLesson(topic) {
  return recommendationTargets[topic];
}
