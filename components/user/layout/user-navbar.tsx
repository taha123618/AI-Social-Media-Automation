"use client";

import React, { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileSearchDrawer } from "@/components/user/layout/mobile-search-drawer";

export function UserNavbar() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6 sticky top-0 z-30 transition-all">
        {/* Left: sidebar trigger + breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors shrink-0 touch-manipulation" />
          <Separator orientation="vertical" className="h-6 bg-border shrink-0 hidden sm:block" />
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium"
                >
                  Workspace
                </BreadcrumbLink>
              </BreadcrumbItem>
              {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join("/")}`;
                const isLast = index === paths.length - 1;
                const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

                return (
                  <React.Fragment key={path}>
                    <BreadcrumbSeparator className="hidden md:block text-muted-foreground/30" />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-foreground font-semibold text-xs">
                          {title}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={href}
                          className="text-muted-foreground hover:text-primary transition-colors text-xs font-medium"
                        >
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

        {/* Right: search + bell + theme toggle */}
        <div className="flex items-center gap-2">
          {/* Desktop search */}
          <div className="relative hidden sm:block w-44 md:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="w-full pl-8 h-8 text-xs bg-secondary/50 border-border/70 rounded-lg focus-visible:ring-primary"
            />
          </div>

          {/* Mobile search trigger */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden rounded-lg text-muted-foreground hover:text-foreground touch-manipulation"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notification bell */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-muted-foreground hover:text-foreground relative touch-manipulation"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {/* Active notification dot */}
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
          </Button>

          <ModeToggle />
        </div>
      </header>

      {/* Mobile search drawer */}
      <MobileSearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
