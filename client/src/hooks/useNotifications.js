import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest("/notifications"),
  });
}
