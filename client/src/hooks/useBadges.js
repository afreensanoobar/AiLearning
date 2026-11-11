import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useBadges() {
  return useQuery({
    queryKey: ["badges"],
    queryFn: () => apiRequest("/badges"),
  });
}
