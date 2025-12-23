import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Inbox, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Inbox", url: "/inbox", icon: Inbox },
    // { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header */}
      <Header />

      <SidebarContent>
        <SidebarMenu className="px-2">
          {navItems.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`transition-all duration-200 rounded-md my-1 ${
                  location.pathname === item.url
                    ? "bg-zinc-800 text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                }`}
              >
                <Link to={item.url}>
                  <item.icon className="opacity-70" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* footer */}
      <Footer />
      <SidebarRail />
    </Sidebar>
  );
}
