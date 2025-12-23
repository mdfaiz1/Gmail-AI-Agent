import { toast } from "react-toastify";
import { cancelSendMailApi } from "../lib/api";
import { useMutation } from "@tanstack/react-query";

export const useCancelSendMail = () => {
  return useMutation({
    mutationFn: payload => cancelSendMailApi(payload),
    onSuccess: data => {
      toast.success("Email Send Cancel Successful");
    },
    onError: error => {
      toast.error("Failed Send Try Again!");
    },
  });
};
