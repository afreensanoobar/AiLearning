import type { TopicResult } from "../assessments/engines.js";

export function generateLearningPath(topicResults: TopicResult[]) {
  return topicResults
    .filter((topic) => topic.total > 0)
    .map((topic) => {
      const priority =
        topic.percentage < 50 ? "High" : topic.percentage < 70 ? "Medium" : "Low";
      return {
        topic: topic.topic,
        percentage: topic.percentage,
        priority,
        action:
          priority === "High"
            ? "Revise fundamentals and practise beginner questions."
            : priority === "Medium"
              ? "Review concepts and solve intermediate questions."
              : "Attempt advanced questions to improve mastery.",
        estimatedTime:
          priority === "High"
            ? "45 minutes"
            : priority === "Medium"
              ? "30 minutes"
              : "20 minutes",
      };
    })
    .sort((a, b) => a.percentage - b.percentage)
    .map((item, index) => ({ ...item, step: index + 1 }));
}
