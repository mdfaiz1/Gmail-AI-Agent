import { fetchEmailDetailApi } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

export const useEmailDetailHook = emailId => {
  const emailDetailQuery = useQuery({
    queryKey: ["emailDetail", emailId],
    queryFn: () => fetchEmailDetailApi(emailId),
    enabled: !!emailId,
    staleTime: 0,
  });
  return {
    data: emailDetailQuery.data,
    isLoading: emailDetailQuery.isLoading,
    isError: emailDetailQuery.isError,
    error: emailDetailQuery.error,
  };
};
