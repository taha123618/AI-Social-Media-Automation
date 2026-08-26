"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BarChart3,
  ShieldAlert,
  Workflow,
  Building2,
  Hash,
  Server,
  FileText,
  CalendarCheck,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { logoutAdmin } from "../actions/admin.actions";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Talk to Sales",
    url: "/admin/talk-to-sales",
    icon: CalendarCheck,
  },
  {
    title: "User Registry",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Billing & Plans",
    url: "/admin/billing",
    icon: CreditCard,
  },
  {
    title: "Workflows",
    url: "/admin/workflows",
    icon: Workflow,
  },
  {
    title: "Workspaces",
    url: "/admin/workspaces",
    icon: Building2,
  },
  {
    title: "Social Accounts",
    url: "/admin/social-accounts",
    icon: Hash,
  },
  {
    title: "AI Blog Writer",
    url: "/admin/ai-blog",
    icon: FileText,
  },
  {
    title: "Ad Campaigns",
    url: "/admin/ad-campaigns",
    icon: BarChart3,
  },
  {
    title: "Admin Management",
    url: "/admin/admins",
    icon: ShieldAlert,
    role: "super_admin",
  },
  {
    title: "System Control",
    url: "/admin/system",
    icon: Server,
  },
];

export function AdminSidebar({ adminRole }: { adminRole?: string }) {
  const pathname = usePathname();
  const [isLoggingOut, startTransition] = React.useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAdmin();
    });
  };

  const filteredMenuItems = React.useMemo(() => {
    return menuItems.filter(item => {
      if (item.title === "Admin Management" && adminRole !== "super_admin") {
        return false;
      }
      return true;
    });
  }, [adminRole]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4 bg-sidebar">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            A
          </div>
          <span className="text-sidebar-foreground group-data-[collapsible=icon]:hidden font-bold">
            Social AI Admin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/60 text-xs font-semibold px-3 py-1">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      "transition-colors duration-150 rounded-lg text-xs font-medium h-9 px-3",
                      pathname === item.url
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg h-8 text-xs cursor-pointer"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-3.5 w-3.5 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
