"use client";

import React from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Bell, ExternalLink, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { AdminSearch } from "./admin-search";

export function AdminNavbar() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 backdrop-blur-md px-6 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <Separator orientation="vertical" className="h-6 bg-border" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/admin/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            {paths.map((path, index) => {
              if (path === "admin") return null;
              if (path === "(dashboard)") return null;
              const href = `/${paths.slice(0, index + 1).filter(p => p !== "(dashboard)").join("/")}`;
              const isLast = index === paths.length - 1;
              const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');

              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator className="hidden md:block text-muted-foreground/30" />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-foreground font-semibold">{title}</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={href} className="text-muted-foreground hover:text-primary transition-colors">
                          {title}
                        </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden lg:block">
          <AdminSearch />
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="inline-flex items-center gap-1.5 text-xs font-medium border-border bg-background/60 hover:bg-muted text-foreground transition-all shadow-2xs"
        >
          <Link
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            title="Open /dashboard in a new tab"
          >
            <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Workspace</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </Link>
        </Button>

        <Separator orientation="vertical" className="h-6 bg-border" />

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          </motion.button>

          <Separator orientation="vertical" className="h-6 bg-border mx-1" />

          <ModeToggle />
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-semibold text-foreground">System Operator</span>
            <span className="text-[10px] font-bold uppercase tracking-tight text-primary">Super Admin</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/60 p-[2px]">
            <div className="h-full w-full rounded-full bg-background flex items-center justify-center text-xs font-bold text-foreground border border-foreground/5">
              AD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
