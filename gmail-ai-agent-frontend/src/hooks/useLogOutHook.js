import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutApi } from "../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthUser } from "./useAuthUser";
import { toast } from "react-toastify";

export const useLogoutHook = () => {
  const navigate = useNavigate();
  const { removeAuthUser } = useAuthUser();
  const queryClient = useQueryClient();

  const {
    mutate: logout,
    isPending,
    error,
  } = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      removeAuthUser();
      localStorage.removeItem("gmail-user");
      queryClient.clear();
      navigate("/login", { replace: true });
      toast.success("Successfully logged out.");
    },
    onError: err => {
      toast.error("Logout failed. Please try again.");
      console.error("Logout failed:", err);
    },
  });

  return { logout, isPending, error };
};
