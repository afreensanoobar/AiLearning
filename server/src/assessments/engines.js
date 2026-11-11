const topicSuggestions = {
    HTML: "Revise HTML tags, forms, semantic elements, and page structure.",
    CSS: "Practice selectors, box model, Flexbox, Grid, and responsive design.",
    JavaScript: "Revise variables, functions, arrays, objects, and DOM manipulation.",
    React: "Practice components, props, state, hooks, and event handling.",
};
export function calculateNextDifficulty(correct, total, currentLevel) {
    if (total <= 0) {
        return {
            level: "Beginner",
            message: "Start with beginner-level questions.",
            mastered: false,
        };
    }
    const accuracy = (correct / total) * 100;
    if (currentLevel === "Beginner") {
        if (accuracy >= 80) {
            return {
                level: "Intermediate",
                message: "Excellent! You have unlocked Intermediate level!",
                mastered: false,
            };
        }
        if (accuracy >= 50) {
            return {
                level: "Beginner",
                message: "Good effort! Keep practising Beginner-level questions.",
                mastered: false,
            };
        }
        return {
            level: "Beginner",
            message: "Keep practising your basics. You can do it!",
            mastered: false,
        };
    }
    if (currentLevel === "Intermediate") {
        if (accuracy >= 80) {
            return {
                level: "Advanced",
                message: "Great performance! You have unlocked Advanced level.",
                mastered: false,
            };
        }
        if (accuracy >= 50) {
            return {
                level: "Intermediate",
                message: "Good effort! Keep improving at this level.",
                mastered: false,
            };
        }
        return {
            level: "Beginner",
            message: "Let's strengthen your fundamentals.",
            mastered: false,
        };
    }
    if (accuracy === 100) {
        return {
            level: "Advanced",
            message: "Outstanding! You have mastered the Advanced level!",
            mastered: true,
        };
    }
    if (accuracy >= 50) {
        return {
            level: "Advanced",
            message: "Excellent work! Try more challenging Advanced questions.",
            mastered: false,
        };
    }
    return {
        level: "Intermediate",
        message: "Let's revise Intermediate topics before trying Advanced again.",
        mastered: false,
    };
}
export function generateRecommendations(topicResults) {
    return topicResults
        .map((result) => {
        const percentage = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
        const priority = percentage < 50 ? "High" : percentage < 70 ? "Medium" : "Low";
        const message = priority === "High"
            ? "You need more practice in this topic."
            : priority === "Medium"
                ? "Revise this topic and solve more questions."
                : "Good performance! Try advanced questions.";
        return {
            topic: result.topic,
            percentage,
            priority,
            message,
            suggestion: topicSuggestions[result.topic],
        };
    })
        .sort((a, b) => a.percentage - b.percentage);
}
