import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useHistory() {
  return useQuery({
    queryKey: ["assessments", "history"],
    queryFn: () => apiRequest("/assessments/history"),
  });
}
