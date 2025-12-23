import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Command } from "lucide-react";

const Header = () => {
  return (
    <SidebarHeader className="pb-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2  py-1">
            <div className="flex aspect-square size-8 items-center justify-center rounded bg-zinc-50 text-zinc-950 font-bold">
              <Command className="size-4 " />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-bold tracking-tight text-zinc-100">
                Gmail Agent
              </span>
              <span className="truncate text-xs text-zinc-500">Workspace</span>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};

export { Header };
