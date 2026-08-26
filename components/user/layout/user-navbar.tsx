"use client";

import React from "react";
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

export function UserNavbar() {
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

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search resources..."
            className="w-full pl-8 h-8 text-xs bg-secondary/50 border-border/70 rounded-lg focus-visible:ring-primary"
          />
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
