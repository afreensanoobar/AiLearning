const topicResources = {
  HTML: "Revise HTML tags, forms, semantic elements, and page structure.",
  CSS: "Practice selectors, box model, Flexbox, Grid, and responsive design.",
  JavaScript: "Revise variables, functions, arrays, objects, and DOM manipulation.",
  React: "Practice components, props, state, hooks, and event handling.",
};

export function generateRecommendations(topicResults) {
  if (!Array.isArray(topicResults) || topicResults.length === 0) {
    return [];
  }

  return topicResults
    .map((result) => {
      const percentage =
        result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;

      let priority;
      let message;

      if (percentage < 50) {
        priority = "High";
        message = "You need more practice in this topic.";
      } else if (percentage < 70) {
        priority = "Medium";
        message = "Revise this topic and solve more questions.";
      } else {
        priority = "Low";
        message = "Good performance! Try advanced questions.";
      }

      return {
        topic: result.topic,
        percentage,
        priority,
        message,
        suggestion:
          topicResources[result.topic] ||
          `Revise ${result.topic} and practise more questions.`,
      };
    })
    .sort((a, b) => a.percentage - b.percentage);
}
