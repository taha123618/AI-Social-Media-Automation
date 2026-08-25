"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Shield, User, MoreHorizontal, Edit2, Trash2, ArrowUpDown, Calendar, Mail, Globe, ExternalLink, Settings, Building2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
        className="hover:bg-accent hover:text-accent-foreground -ml-4 font-mono font-bold text-xs uppercase"
      >
        OPERATOR
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-none bg-primary/10 flex items-center justify-center text-primary font-mono font-bold text-xs border border-primary/30">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-foreground text-xs uppercase tracking-tight">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono uppercase">{row.original.email.split('@')[0]}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "email",
    header: "IDENTITY",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs">
        <Mail className="h-3 w-3 text-primary" />
        <span>{row.original.email}</span>
      </div>
    )
  },
  {
    accessorKey: "role",
    header: "CLEARANCE",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const isSuper = role === "super_admin";
      return (
        <Badge
          className={cn(
            "rounded-none border px-2 py-0.5 font-mono text-[10px] uppercase font-bold",
            isSuper
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary text-secondary-foreground border-border"
          )}
        >
          {isSuper ? (
            <Shield className="mr-1.5 h-3 w-3" />
          ) : (
            <User className="mr-1.5 h-3 w-3" />
          )}
          {isSuper ? "SUPER ADMIN" : "STANDARD ADMIN"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "PROVISIONED",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs">
        <Calendar className="h-3 w-3" />
        {format(new Date(row.getValue("createdAt")), "yyyy-MM-dd")}
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
            <Button variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-none">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-none p-1 shadow-none">
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-mono font-bold tracking-widest px-2 py-1">SECURITY OPS</DropdownMenuLabel>
            <DropdownMenuItem asChild className="focus:bg-secondary cursor-pointer font-mono text-xs p-2 rounded-none">
              <Link href={`/admin/admins/edit/${admin.id}`}>
                <Edit2 className="mr-2 h-3.5 w-3.5" />
                Audit Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 cursor-pointer font-mono text-xs p-2 rounded-none"
              onClick={() => onDelete(admin.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
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
    header: "USER IDENTITY",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-none bg-secondary border border-border flex items-center justify-center text-primary font-mono font-bold text-xs">
          {row.original.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-foreground text-xs uppercase">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{row.original.email}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "JOINED",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs">
        <Calendar className="h-3 w-3" />
        {format(new Date(row.original.createdAt), "yyyy-MM-dd")}
      </div>
    )
  },
  {
    id: "activity",
    header: "NODES // FLOWS",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Badge variant="outline" className="rounded-none bg-secondary border-border font-mono text-[10px] uppercase font-bold text-foreground">
          {row.original._count?.memberships || 0} ORGS
        </Badge>
        <Badge variant="outline" className="rounded-none bg-primary/10 border-primary/30 font-mono text-[10px] uppercase font-bold text-primary">
          {row.original._count?.workflows || 0} FLOWS
        </Badge>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-secondary rounded-none">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-none p-1 shadow-none">
          <DropdownMenuLabel className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-2 py-1">PROTOCOL ACTIONS</DropdownMenuLabel>
          <DropdownMenuItem
            className="focus:bg-secondary cursor-pointer font-mono text-xs p-2 rounded-none"
            onClick={() => onMessage({ id: row.original.id, name: row.original.name })}
          >
            <Mail className="mr-2 h-3.5 w-3.5" /> Message Operator
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="focus:bg-secondary cursor-pointer font-mono text-xs p-2 rounded-none">
            <Link href={`/admin/users/edit/${row.original.id}`}>
              <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 cursor-pointer font-mono text-xs p-2 rounded-none"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Deactivate Account
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
    header: "CHANNEL ENTITY",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.avatar ? (
          <img src={row.original.avatar} className="h-8 w-8 rounded-none border border-border" alt="" />
        ) : (
          <div className="h-8 w-8 rounded-none bg-secondary border border-border flex items-center justify-center text-primary font-mono font-bold text-xs">
            {row.original.platform.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-mono font-bold text-foreground text-xs uppercase">{row.original.name || "Unknown Channel"}</span>
          <span className="text-[10px] font-mono font-bold text-primary uppercase">{row.original.platform}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "business.name",
    header: "HOST WORKSPACE",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Globe className="h-3 w-3 text-muted-foreground" />
        <span className="font-mono text-xs text-muted-foreground">{row.original.business.name}</span>
      </div>
    )
  },
  {
    accessorKey: "isActive",
    header: "LINK STATUS",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "rounded-none border px-2 py-0.5 font-mono text-[10px] uppercase font-bold cursor-pointer transition-none",
          row.original.isActive ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"
        )}
        onClick={() => onToggle(row.original.id, !row.original.isActive)}
      >
        {row.original.isActive ? "SYNCHED" : "DISCONNECTED"}
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {row.original.profileUrl && (
          <Button variant="ghost" size="icon" asChild className="h-7 w-7 text-muted-foreground hover:text-primary rounded-none">
            <a href={row.original.profileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-secondary rounded-none">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-none p-1 shadow-none">
            <DropdownMenuLabel className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-2 py-1">PROTOCOL OPS</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 cursor-pointer font-mono text-xs p-2 rounded-none"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Revoke Token
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
    header: "WORKFLOW ENGINE",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono font-bold text-foreground text-xs uppercase tracking-tight">{row.original.name}</span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 cursor-pointer",
              row.original.isActive ? "bg-primary" : "bg-muted-foreground"
            )}
            onClick={() => onToggle(row.original.id, !row.original.isActive)}
          />
          <span className="text-[10px] font-mono uppercase text-muted-foreground">{row.original.isActive ? "ACTIVE" : "PAUSED"}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "business.name",
    header: "WORKSPACE",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-none">{row.original.business.name}</span>
    )
  },
  {
    accessorKey: "runCount",
    header: "TOTAL CYCLES",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 font-mono text-xs">
        <span className="font-bold text-foreground">{row.original.runCount.toLocaleString()} RUNS</span>
        {row.original.lastRunAt && (
          <span className="text-[10px] text-muted-foreground">
            LAST: {format(new Date(row.original.lastRunAt), "yyyy-MM-dd HH:mm")}
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
          <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-secondary rounded-none">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-none p-1 shadow-none">
          <DropdownMenuLabel className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-2 py-1">ENGINE CONTROLS</DropdownMenuLabel>
          <DropdownMenuItem
            className="focus:bg-secondary cursor-pointer font-mono text-xs p-2 rounded-none"
            onClick={() => onConfig(row.original)}
          >
            <Settings className="mr-2 h-3.5 w-3.5" /> Inspect Logic
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 cursor-pointer font-mono text-xs p-2 rounded-none"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Purge Instance
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
    header: "WORKSPACE CLUSTER",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-none bg-secondary border border-border flex items-center justify-center text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-foreground text-xs uppercase">{row.original.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground">/{row.original.slug}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "organization.name",
    header: "PARENT NODE",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.organization?.name || "Independent"}</span>
    )
  },
  {
    id: "resources",
    header: "RESOURCE GRID",
    cell: ({ row }) => (
      <div className="grid grid-cols-3 gap-2 font-mono">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase">MEMBERS</span>
          <span className="font-bold text-foreground text-xs">{row.original._count.members}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase">CHANNELS</span>
          <span className="font-bold text-foreground text-xs">{row.original._count.socialAccounts}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground uppercase">FLOWS</span>
          <span className="font-bold text-foreground text-xs">{row.original._count.workflows}</span>
        </div>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-secondary rounded-none">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-none p-1 shadow-none">
          <DropdownMenuLabel className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-2 py-1">NODE OPS</DropdownMenuLabel>
          <DropdownMenuItem asChild className="focus:bg-secondary cursor-pointer font-mono text-xs p-2 rounded-none">
            <Link href={`/admin/workspaces/edit/${row.original.id}`}>
              <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Workspace
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 cursor-pointer font-mono text-xs p-2 rounded-none"
            onClick={() => onDelete(row.original.id)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Decommission Node
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
];
