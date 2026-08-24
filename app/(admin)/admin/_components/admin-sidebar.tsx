"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  BarChart3,
  ShieldAlert,
  Workflow,
  Building2,
  Hash,
  History,
  Server,
  FileText,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { logoutAdmin } from "../actions/admin.actions";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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
  const sidebarRef = React.useRef<HTMLDivElement>(null);

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

  useGSAP(() => {
    gsap.from(".sidebar-item", {
      x: -20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
      delay: 0.2
    });
  }, { scope: sidebarRef });

  return (
    <Sidebar collapsible="icon" ref={sidebarRef} className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4 bg-sidebar">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            A
          </div>
          <span className="text-sidebar-foreground group-data-[collapsible=icon]:hidden">Social AI Admin</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/50">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="sidebar-item">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-300",
                      pathname === item.url
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-4">
        <SidebarMenu>
          <SidebarMenuItem className="sidebar-item">
            <SidebarMenuButton
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
