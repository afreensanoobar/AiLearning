import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useTrend() {
  return useQuery({
    queryKey: ["progress", "trend"],
    queryFn: () => apiRequest("/progress/trend"),
  });
}
