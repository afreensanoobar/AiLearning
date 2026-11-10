export function calculateNextDifficulty(correctAnswers, totalQuestions, currentLevel) {
  if (totalQuestions <= 0) {
    return {
      level: "Beginner",
      message: "Start with beginner-level questions.",
      mastered: false,
    };
  }

  const accuracy = (correctAnswers / totalQuestions) * 100;

  // Beginner level
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

  // Intermediate level
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

  // Advanced level
  if (currentLevel === "Advanced") {
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

  return {
    level: "Beginner",
    message: "Start with beginner-level questions.",
    mastered: false,
  };
}
