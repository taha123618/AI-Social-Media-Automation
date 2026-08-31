"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Layers,
  FolderOpen,
  Send,
  Workflow,
  Target,
  TrendingUp,
  Brain,
  Megaphone,
  MessageSquare,
  Calendar,
  Clock,
  Share2,
  Globe,
  Star,
  Users,
  Settings,
  LogOut,
  Sparkles,
  Mic,
  Radar,
  Swords,
  Bot,
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
import { WorkspaceSwitcher } from "@/components/common/WorkspaceSwitcher";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const userNavSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "AI Generation & Media",
    items: [
      {
        title: "AI Blog Writer",
        url: "/blog",
        icon: FileText,
        badge: "AI",
      },
      {
        title: "Creative Studio",
        url: "/studio",
        icon: Sparkles,
        badge: "Hub",
      },
      {
        title: "Posts Feed",
        url: "/posts",
        icon: Send,
      },
      {
        title: "AI Carousel Studio",
        url: "/carousels",
        icon: Layers,
        badge: "New",
      },
      {
        title: "Voice Studio",
        url: "/voice",
        icon: Mic,
        badge: "New",
      },
      {
        title: "Contents Library",
        url: "/contents",
        icon: FolderOpen,
      }
    ],
  },
  {
    label: "Autonomous Strategy",
    items: [
      {
        title: "Social Listening Radar",
        url: "/listening",
        icon: Radar,
        badge: "New",
      },
      {
        title: "Autonomous DM Bot",
        url: "/dm-automation",
        icon: Bot,
        badge: "New",
      },
      {
        title: "AI Multi-Model Arena",
        url: "/arena",
        icon: Swords,
        badge: "New",
      },
      {
        title: "Workflows",
        url: "/workflows",
        icon: Workflow,
        badge: "Swarm",
      },
      {
        title: "Competitors",
        url: "/competitors",
        icon: Target,
        badge: "AI",
      },
      {
        title: "Local Trends",
        url: "/trends",
        icon: TrendingUp,
        badge: "AI",
      },
      {
        title: "Brand Knowledge",
        url: "/knowledge",
        icon: Brain,
        badge: "RAG",
      },
    ],
  },
  {
    label: "Publishing & Reach",
    items: [
      {
        title: "Ad Campaigns",
        url: "/ad-campaigns",
        icon: Megaphone,
        badge: "Ads",
      },
      {
        title: "Engagement",
        url: "/engagement",
        icon: MessageSquare,
        badge: "AI",
      },
      {
        title: "Calendar",
        url: "/schedule",
        icon: Calendar,
      },
      {
        title: "Post Schedule",
        url: "/post-schedule",
        icon: Clock,
      },
      {
        title: "Social Accounts",
        url: "/social/accounts",
        icon: Share2,
      },
      {
        title: "Multi-Location",
        url: "/multi-location",
        icon: Globe,
        badge: "Pro",
      },
      {
        title: "Reviews",
        url: "/reviews",
        icon: Star,
      },
    ],
  },
  {
    label: "Workspace & Team",
    items: [
      {
        title: "Team Members",
        url: "/team",
        icon: Users,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

interface UserSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export function UserSidebar({ user }: UserSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border w-64">
      {/* Sidebar Header with Brand Mark */}
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4 bg-sidebar">
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-sidebar-foreground leading-tight truncate">SocialAI</span>
            <span className="text-[10px] text-muted-foreground font-mono">Workspace Hub</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Sidebar Main Content with Grouped Nav Sections */}
      <SidebarContent className="bg-sidebar">
        {userNavSections?.map((section) => (
          <SidebarGroup key={section.label} className="py-1.5">
            <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground/60 px-3 py-1 uppercase tracking-wider">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    (item.url !== "/dashboard" && pathname.startsWith(item.url));
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={`${section.label}-${item.url}-${item.title}`}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200 text-xs font-medium rounded-lg h-9 px-3",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Link href={item.url} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded group-data-[collapsible=icon]:hidden">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer with Workspace Switcher & Sign Out */}
      <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
        <div className="flex flex-col gap-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <WorkspaceSwitcher />
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg h-8 cursor-pointer"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-3.5 w-3.5 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {isLoggingOut ? "Signing out..." : "Sign Out"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
