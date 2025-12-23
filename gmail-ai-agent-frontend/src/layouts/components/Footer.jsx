import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useLogoutHook } from "../../hooks/useLogoutHook";
import { useAuthUser } from "../../hooks/useAuthUser";

const Footer = () => {
  const { logout, isPending } = useLogoutHook();
  const { authUser } = useAuthUser();
  return (
    <SidebarFooter className="p-2 border-t border-zinc-900">
      <SidebarMenu>
        <SidebarMenuItem>
          {/* Container: Just a div, so the whole row DOES NOT react to hover */}
          <div className="flex items-center w-full gap-2 px-2 py-1.5">
            {/* 1. LEFT SIDE: User Info (Static / Read-only) */}
            {/* No hover effects added here */}
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 shrink-0">
                <img src={authUser?.user?.picture} alt="IMG" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-zinc-200">
                  {authUser?.user?.name}
                </span>
                <span className="truncate text-xs text-zinc-500">
                  {authUser?.user?.email}
                </span>
              </div>
            </div>

            {/* 2. RIGHT SIDE: Logout Button (Independent Interactive Element) */}
            <button
              onClick={() => logout()}
              disabled={isPending} // Disable button while logging out
              title="Logout"
              className="group-data-[collapsible=icon]:hidden flex aspect-square size-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 cursor-pointer hover:text-red-500 disabled:opacity-50"
            >
              <LogOut className={`size-4 ${isPending ? "animate-spin" : ""}`} />
            </button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
};

export { Footer };
