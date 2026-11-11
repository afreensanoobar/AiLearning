import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => apiRequest("/leaderboard"),
  });
}
