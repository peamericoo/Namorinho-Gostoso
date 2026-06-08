import { useQuery } from "@tanstack/react-query";
import { getCurrentWorkspace } from "../services/finance.service";
import { useAuth } from "./useAuth";

export function useWorkspace() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["workspace", user?.id],
    queryFn: () => getCurrentWorkspace(),
    enabled: Boolean(user?.id)
  });
}
