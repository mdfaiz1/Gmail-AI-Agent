import { fetcheEmailsApi } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

export const useEmailFetchHook = ({ userId, page, limit }) => {
  const emailFetchQuery = useQuery({
    queryKey: ["fetchEmails", userId, page, limit],
    queryFn: () => fetcheEmailsApi({ userId, page, limit }),
    enabled: !!userId,
    staleTime: 0,
    select: response => {
      if (!response?.data || !Array.isArray(response.data)) {
        return response;
      }
      const sortedData = [...response.data].sort((a, b) => {
        return (
          new Date(a.originalMessage.receivedAt) -
          new Date(b.originalMessage.receivedAt)
        );
      });
      return { ...response, data: sortedData };
    },
    refetchInterval: query => {
      const data = query.state.data?.data;
      if (Array.isArray(data) && data.length < 5) {
        return 2000; // 2 seconds
      }
      return 80000; // 80 seconds
    },
  });

  return {
    data: emailFetchQuery.data,
    isLoading: emailFetchQuery.isLoading,
    isError: emailFetchQuery.isError,
    error: emailFetchQuery.error,
    isFetching: emailFetchQuery.isFetching,
  };
};
