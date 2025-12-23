import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthUserApi } from "../lib/api";

const useAuthUser = () => {
  const queryClient = useQueryClient(); // 1. Add this
  const hasToken = !!localStorage.getItem("gmail-user");

  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUserApi,
    retry: false,
    enabled: hasToken,
    staleTime: 55 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchIntervalInBackground: true,
  });

  // 2. Define a proper removal function
  const removeAuthUser = () => {
    // This manually sets the cache to null and cancels any outgoing fetches
    queryClient.setQueryData(["authUser"], null);
    queryClient.removeQueries({ queryKey: ["authUser"] });
  };

  return {
    isLoading: hasToken && authUser.isLoading,
    authUser: authUser.data,
    success: authUser.isSuccess && authUser.data?.success === true,
    refetchAuthUser: authUser.refetch,
    removeAuthUser: removeAuthUser, // 3. Return the new function
  };
};

export { useAuthUser };
