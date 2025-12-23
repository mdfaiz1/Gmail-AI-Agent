import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toggleEmailSyncApi } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthUser } from "../hooks/useAuthUser";
import { toast } from "react-toastify";

const ToggleSwitchPage = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();

  // Extract values from authUser helper
  const userId = authUser?.user?._id || null;
  const isSyncActive = authUser?.user?.isSyncActive || false;

  // 1. Setup the Mutation
  const mutation = useMutation({
    mutationFn: toggleEmailSyncApi,
    onSuccess: responseData => {
      toast.success("Email sync activated successfully!");

      // Invalidate the user query to refresh the UI state automatically
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: error => {
      console.error("Error starting sync:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update sync status.";
      toast.error(errorMessage);
    },
  });

  // 2. The Logic Handler
  const handleConfirm = () => {
    // Validation
    if (!userId) {
      toast.error("User ID is missing. Please login again.");
      return;
    }

    if (isSyncActive === true) {
      toast.error("Email Sync is already Active.");
      return;
    }

    // Trigger API call
    mutation.mutate({
      userId: userId,
      status: true,
    });
  };

  return (
    <div className="flex justify-center items-center min-h-120">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="default"
            className="cursor-pointer"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processing..." : "Open Confirmation"}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="bg-dark text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action will activate your Email Syncing. Please be certain
              before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer border-none bg-gray-700 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-blue-600 hover:bg-blue-500"
              onClick={e => {
                // Prevent modal from closing immediately if you want to wait for mutation
                // Or just let it close and rely on the toast feedback
                handleConfirm();
              }}
            >
              Activate Sync
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ToggleSwitchPage;
