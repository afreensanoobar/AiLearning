import { useQueries, useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { getRecommendedLesson } from "../lessonsData";

export function useCourseDetails(slug) {
  return useQuery({
    queryKey: ["courses", slug],
    queryFn: () => apiRequest(`/courses/${slug}`),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useRecommendedLessons(recommendations = []) {
  const targets = recommendations.map(({ topic }) => getRecommendedLesson(topic));
  const queries = useQueries({
    queries: targets.map((target) => ({
      queryKey: ["courses", target?.courseSlug],
      queryFn: () => apiRequest(`/courses/${target.courseSlug}`),
      enabled: Boolean(target),
      staleTime: 60_000,
    })),
  });

  return targets.map((target, index) =>
    target
      ? queries[index]?.data?.lessons?.find((lesson) => lesson.title === target.title)
      : undefined
  );
}
