export function generateLearningPath(topicPerformance) {
  if (!Array.isArray(topicPerformance) || topicPerformance.length === 0) {
    return [];
  }

  const learningPath = topicPerformance
    .filter((topic) => topic.total > 0)
    .map((topic) => {
      const percentage = Math.round((topic.correct / topic.total) * 100);

      let priority;
      let action;
      let estimatedTime;

      if (percentage < 50) {
        priority = "High";
        action = "Revise fundamentals and practise beginner questions.";
        estimatedTime = "45 minutes";
      } else if (percentage < 70) {
        priority = "Medium";
        action = "Review concepts and solve intermediate questions.";
        estimatedTime = "30 minutes";
      } else {
        priority = "Low";
        action = "Attempt advanced questions to improve mastery.";
        estimatedTime = "20 minutes";
      }

      return {
        topic: topic.topic,
        percentage,
        priority,
        action,
        estimatedTime,
      };
    })
    .sort((a, b) => a.percentage - b.percentage)
    .map((item, index) => ({
      ...item,
      step: index + 1,
    }));

  return learningPath;
}
