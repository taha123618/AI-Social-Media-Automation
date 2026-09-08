"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Shield, User, MoreHorizontal, Edit2, Trash2, ArrowUpDown, Calendar, Mail, Hash, Globe, ExternalLink, Settings, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format } from "date-fns";

export type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
};

export const columns = (onDelete: (id: string) => void): ColumnDef<Admin>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-accent hover:text-accent-foreground -ml-4 font-bold"
      >
        Name
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shadow-sm transition-all hover:scale-110">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-foreground tracking-tight">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{row.original.email.split('@')[0]}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "email",
    header: "Auth Identity",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground font-medium">
        <Mail className="h-3.5 w-3.5 text-primary/40" />
        <span className="text-sm">{row.original.email}</span>
      </div>
    )
  },
  {
    accessorKey: "role",
    header: "Security Clearance",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isSuper = role === "super_admin";
      return (
        <Badge
          className={cn(
            "rounded-lg border-0 px-3 py-1.5 font-bold tracking-tight shadow-sm",
            isSuper
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isSuper ? (
            <Shield className="mr-2 h-3.5 w-3.5" />
          ) : (
              <User className="mr-2 h-3.5 w-3.5" />
          )}
          {isSuper ? "Super Admin" : "Standard Admin"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Onboarding",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-muted-foreground/80 font-bold text-xs uppercase tracking-tighter">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground/40" />
        {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const admin = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-border shadow-2xl rounded-2xl p-2">
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] px-3 py-2">Security Ops</DropdownMenuLabel>
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer font-bold p-3 rounded-lg">
              <Link href={`/admin/admins/edit/${admin.id}`}>
                <Edit2 className="mr-2 h-4 w-4" />
                Audit Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-black p-3 rounded-lg"
              onClick={() => onDelete(admin.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Terminate Clearance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// User Columns
export type UserRow = {
  id: string;
  name: string;
  email: string;
  createdAt: string | Date;
  plan?: string;
  billingStatus?: string;
  _count?: {
    memberships: number;
    workflows: number;
  };
};

export const userColumns = (
  onDelete: (id: string) => void,
  onMessage: (user: { id: string; name: string }) => void
): ColumnDef<UserRow>[] => [
    {
      accessorKey: "name",
      header: "User Identity",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm border border-emerald-500/20 shadow-sm">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{row.original.name}</span>
            <span className="text-xs text-muted-foreground font-medium">{row.original.email}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "plan",
      header: "Plan Tier",
      cell: ({ row }) => {
        const plan = (row.original.plan || "free").toLowerCase();
        const status = row.original.billingStatus || "ACTIVE";
        const getBadgeStyles = () => {
          switch (plan) {
            case "enterprise":
              return "bg-purple-500/10 text-purple-500 border-purple-500/20";
            case "pro":
              return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
            case "starter":
              return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            default:
              return "bg-muted text-muted-foreground border-border";
          }
        };

        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`font-mono font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-lg border ${getBadgeStyles()}`}>
              {plan}
            </Badge>
            {status !== "ACTIVE" && (
              <Badge variant="destructive" className="text-[9px] font-mono uppercase px-1.5 py-0.2">
                {status}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
          <Calendar className="h-3.5 w-3.5 text-primary/50" />
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </div>
      )
    },
    {
      id: "activity",
      header: "Activity Meta",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold">
            {row.original._count?.memberships || 0} Orgs
          </Badge>
          <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/10 font-bold">
            {row.original._count?.workflows || 0} Flows
          </Badge>
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted rounded-xl">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 glass-card border-border shadow-2xl rounded-xl">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Protocol Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="focus:bg-primary/10 focus:text-primary cursor-pointer font-medium p-3 rounded-lg"
              onClick={() => onMessage({ id: row.original.id, name: row.original.name })}
            >
              <Mail className="mr-2 h-4 w-4" /> Message User
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer font-medium p-3 rounded-lg">
              <Link href={`/admin/users/edit/${row.original.id}`}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold p-3 rounded-lg"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Deactivate Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

// Social Account Columns
export type SocialAccountRow = {
  id: string;
  platform: string;
  name: string;
  avatar?: string | null;
  isActive: boolean;
  profileUrl?: string | null;
  business: { name: string };
};

export const socialAccountColumns = (
  onDelete: (id: string) => void,
  onToggle: (id: string, active: boolean) => void
): ColumnDef<SocialAccountRow>[] => [
    {
      accessorKey: "name",
      header: "Channel Entity",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.avatar ? (
            <img src={row.original.avatar} className="h-10 w-10 rounded-full border border-border shadow-sm" alt="" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {row.original.platform.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-foreground">{row.original.name || "Unknown Channel"}</span>
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{row.original.platform}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "business.name",
      header: "Host Workspace",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <span className="font-bold text-muted-foreground text-sm">{row.original.business.name}</span>
        </div>
      )
    },
    {
      accessorKey: "isActive",
      header: "Link Status",
      cell: ({ row }) => (
        <Badge className={cn(
          "rounded-md border-0 px-2 py-1 font-bold cursor-pointer transition-all hover:scale-105",
          row.original.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
        )} onClick={() => onToggle(row.original.id, !row.original.isActive)}>
          {row.original.isActive ? "Synched" : "Disconnected"}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.profileUrl && (
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
              <a href={row.original.profileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-lg">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-border shadow-2xl rounded-xl">
              <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Protocol Ops</DropdownMenuLabel>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold p-3 rounded-lg"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Revoke Token
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

// Workflow Columns
export type WorkflowRow = {
  id: string;
  name: string;
  isActive: boolean;
  runCount: number;
  lastRunAt?: string | Date | null;
  business: { name: string };
  creator: { name: string };
  trigger: any;
};

export const workflowColumns = (
  onDelete: (id: string) => void,
  onConfig: (workflow: WorkflowRow) => void,
  onToggle: (id: string, active: boolean) => void
): ColumnDef<WorkflowRow>[] => [
    {
      accessorKey: "name",
      header: "Workflow Engine",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-foreground text-base tracking-tight">{row.original.name}</span>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "h-1.5 w-1.5 rounded-full p-0 border-0 cursor-pointer",
                row.original.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted"
              )}
              onClick={() => onToggle(row.original.id, !row.original.isActive)}
            />
            <span className="text-xs text-muted-foreground font-bold uppercase">{row.original.isActive ? "Active" : "Paused"}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "business.name",
      header: "Context Workspace",
      cell: ({ row }) => (
        <span className="font-bold text-primary text-sm bg-primary/5 px-2 py-1 rounded-md">{row.original.business.name}</span>
      )
    },
    {
      accessorKey: "runCount",
      header: "Total Cycles",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="font-mono font-bold text-foreground">{row.original.runCount.toLocaleString()} runs</span>
          {row.original.lastRunAt && (
            <span className="text-[10px] text-muted-foreground font-medium italic">
              Last run: {format(new Date(row.original.lastRunAt), "MMM dd, HH:mm")}
            </span>
          )}
        </div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted rounded-xl">
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-border shadow-2xl rounded-xl">
            <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Engine Controls</DropdownMenuLabel>
            <DropdownMenuItem
              className="focus:bg-primary/10 focus:text-primary cursor-pointer font-medium p-3 rounded-lg"
              onClick={() => onConfig(row.original)}
            >
              <Settings className="mr-2 h-4 w-4" /> Inspect Logic
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold p-3 rounded-lg"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Purge Instance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

// Business (Workspace) Columns
export type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: string | Date;
  organization?: { name: string } | null;
  _count: {
    members: number;
    socialAccounts: number;
    workflows: number;
  };
  website?: string | null;
};

export const businessColumns = (onDelete: (id: string) => void): ColumnDef<BusinessRow>[] => [
  {
    accessorKey: "name",
    header: "Workspace Cluster",
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="font-extrabold text-foreground text-lg tracking-tight">{row.original.name}</span>
          <span className="text-xs font-mono text-muted-foreground bg-muted w-fit px-1.5 rounded">/{row.original.slug}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "organization.name",
    header: "Parent Node",
    cell: ({ row }) => (
      <span className="font-bold text-muted-foreground">{row.original.organization?.name || "Independent"}</span>
    )
  },
  {
    id: "resources",
    header: "Resource Grid",
    cell: ({ row }) => (
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Users</span>
          <span className="font-mono font-bold text-foreground text-sm">{row.original._count.members}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Social</span>
          <span className="font-mono font-bold text-foreground text-sm">{row.original._count.socialAccounts}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Flows</span>
          <span className="font-mono font-bold text-foreground text-sm">{row.original._count.workflows}</span>
        </div>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted rounded-xl">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 glass-card border-border shadow-2xl rounded-xl">
          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Node Ops</DropdownMenuLabel>
          <DropdownMenuItem asChild className="focus:bg-primary/10 focus:text-primary cursor-pointer font-medium p-3 rounded-lg">
            <Link href={`/admin/workspaces/edit/${row.original.id}`}>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Workspace
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold p-3 rounded-lg"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Decommission Node
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];

import { cn } from "@/lib/utils";
