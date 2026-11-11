import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useSummary() {
  return useQuery({
    queryKey: ["progress", "summary"],
    queryFn: () => apiRequest("/progress/summary"),
  });
}
