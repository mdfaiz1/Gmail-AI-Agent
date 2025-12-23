import { AppSidebar } from "@/layouts/components/AppSidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useAuthUser } from "../hooks/useAuthUser";
import { toggleEmailSyncApi } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();
  const pathName = location.pathname.split("/").filter(Boolean).pop();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const isSyncActive = authUser?.user?.isSyncActive || false;
  const userId = authUser?.user?._id || null;
  const [status, setStatus] = useState(isSyncActive);
  const mutation = useMutation({
    mutationFn: toggleEmailSyncApi,
    onSuccess: () => {
      toast.success("Email sync deactivated successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: error => {
      const errorMessage =
        error.response?.data?.message || "Failed to update sync status.";
      toast.error(errorMessage);
    },
  });

  const handleConfirm = () => {
    if (!userId) {
      toast.error("User ID is missing. Please login again.");
      return;
    }
    let newStatus = !status;
    mutation.mutate({
      userId: userId,
      status: newStatus,
    });
    setStatus(newStatus);
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      {/* SidebarInset is the main container next to the sidebar */}
      <SidebarInset className="bg-zinc-950 min-h-screen">
        {/* HEADER SECTION */}
        {/* 1. sticky top-0: Makes it stick to the top */}
        {/* 2. z-10: Ensures it stays ABOVE the scrolling content */}
        {/* 3. bg-zinc-950/80 + backdrop-blur: The "Glassmorphism" dark effect */}
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 transition-[width,height] ease-linear group-has-[data-collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 text-zinc-400 hover:text-black hover:bg-zinc-400 cursor-pointer" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 bg-zinc-700"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="#"
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    Agent
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize text-zinc-100 font-medium">
                    {pathName || "Dashboard"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto flex items-center gap-2 px-4">
            <label
              htmlFor="mode-toggle"
              className="text-sm  text-zinc-400 cursor-pointer hidden md:block"
            >
              <div className="flex gap-1 justify-between items-center mb-1">
                <div className="font-bold text-2xl">
                  {status ? "Sync Actived" : "Sync Inactived"}
                </div>
                <div>{mutation.isPending && <Loader2 size={40} />}</div>
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                onClick={handleConfirm}
                value=""
                checked={status}
                className="sr-only peer"
              />
              <div
                className="peer h-8 w-16 rounded-full bg-blue-300 
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 
                    transition-colors duration-300 ease-in-out
                    
                    after:content-['No'] 
                    after:absolute after:top-1 after:left-1 
                    after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-6 after:w-6 
                    after:transition-all after:duration-300 
                    
                    after:flex after:justify-center after:items-center 
                    after:text-[10px] after:font-bold after:text-sky-800
                    
                    peer-checked:bg-blue-600 
                    peer-checked:after:translate-x-8 
                    peer-checked:after:content-['Yes'] 
                    peer-checked:after:border-white
                  "
              ></div>
            </label>
          </div>
        </header>

        {/* MAIN CONTENT */}
        {/* flex-1 ensures it fills the remaining height */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 text-zinc-100">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
