import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLoginApi } from "../lib/api";

export const useLoginHook = () => {
  const queryClient = useQueryClient();
  const { mutate, mutateAsync, isLoading, error } = useMutation({
    mutationFn: code => googleLoginApi(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return { loginMutation: mutate, mutateAsync, isLoading, error };
};
