"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarCheck, ListOrdered, Settings, BarChart3 } from "lucide-react";

const navItems = [
  { title: "Overview", url: "/admin/talk-to-sales", icon: CalendarCheck },
  { title: "Leads", url: "/admin/talk-to-sales/leads", icon: ListOrdered },
  { title: "Analytics", url: "/admin/talk-to-sales/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/talk-to-sales/settings", icon: Settings },
];

export default function TalkToSalesSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border bg-card shrink-0 hidden md:block">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Talk to Sales</span>
        </div>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url || (item.url !== "/admin/talk-to-sales" && pathname.startsWith(item.url));
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
