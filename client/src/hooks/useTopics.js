import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useTopics() {
  return useQuery({
    queryKey: ["progress", "topics"],
    queryFn: () => apiRequest("/progress/topics"),
  });
}
