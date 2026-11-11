import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useRecommendations() {
  return useQuery({
    queryKey: ["progress", "recommendations"],
    queryFn: () => apiRequest("/progress/recommendations"),
  });
}
