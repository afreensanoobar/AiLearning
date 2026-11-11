import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => apiRequest("/courses"),
    staleTime: 60_000,
  });
}
