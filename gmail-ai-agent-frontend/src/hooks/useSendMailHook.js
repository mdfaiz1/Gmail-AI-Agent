import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMailReplyApi } from "../lib/api";
import { toast } from "react-toastify";

export const useSendMailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMailReplyApi,
    onSuccess: (data, variables) => {
      toast.success("Reply sent successfully");
      if (variables?.emailId) {
        queryClient.invalidateQueries({
          queryKey: ["sendMail", variables.emailId],
        });
      }
    },
    onError: error => {
      console.log(error)
      const errorMessage =
        error.response?.data?.message || "Failed to send the reply.";
      toast.error(errorMessage);
    },
  });
};
