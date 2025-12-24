import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLoginApi } from "../lib/api";

export const useLoginHook = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: code => googleLoginApi(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  return mutation;
};
