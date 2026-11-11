import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useLearningPath() {
  return useQuery({
    queryKey: ["progress", "path"],
    queryFn: () => apiRequest("/progress/path"),
  });
}
