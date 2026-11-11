import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useCourseProgress() {
  return useQuery({
    queryKey: ["progress", "courses"],
    queryFn: () => apiRequest("/progress/courses"),
  });
}
