"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  CalendarCheck,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { EmailComposer } from "../_components/email-composer";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "QUALIFIED", "SCHEDULED", "COMPLETED", "CONVERTED", "LOST"];

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  teamSize: string;
  jobTitle: string;
  useCase: string;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  status: string;
  source: string;
  assignedTo: string | null;
  createdAt: string;
  assignedAdmin?: { id: string; name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  }

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/talk-to-sales/leads?${params}`);
      const json = await res.json();
      if (json.success) {
        setLeads(json.data);
        setPagination(json.pagination);
      }
    } catch {
      toast.error("Failed to fetch leads");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, search, statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/talk-to-sales/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Status updated");
        fetchLeads();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  function exportCSV() {
    const headers = ["Name", "Email", "Company", "Job Title", "Phone", "Country", "Team Size", "Use Case", "Preferred Date", "Preferred Time", "Status", "Source", "Notes", "Created At"];
    const rows = leads.map((l) => [
      `${l.firstName} ${l.lastName}`,
      l.email,
      l.company,
      l.jobTitle,
      l.phone,
      l.country,
      l.teamSize,
      l.useCase,
      l.preferredDate,
      l.preferredTime,
      l.status,
      l.source,
      l.notes || "",
      new Date(l.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demo-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Demo Leads</h1>
          <p className="text-muted-foreground mt-1">Manage all demo request submissions</p>
        </div>
        <div className="flex gap-3">
          {someSelected && (
            <EmailComposer
              mode="bulk"
              recipients={leads
                .filter((l) => selectedIds.has(l.id))
                .map((l) => ({
                  id: l.id,
                  firstName: l.firstName,
                  lastName: l.lastName,
                  email: l.email,
                  company: l.company,
                  preferredDate: l.preferredDate,
                  preferredTime: l.preferredTime,
                }))}
              onSuccess={() => { setSelectedIds(new Set()); fetchLeads(); }}
            >
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Email ({selectedIds.size})
              </Button>
            </EmailComposer>
          )}
          <Button variant="outline" onClick={exportCSV} disabled={leads.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchLeads} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} aria-label="Select all" />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Use Case</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(lead.id)} onCheckedChange={() => toggleSelect(lead.id)} aria-label={`Select ${lead.firstName} ${lead.lastName}`} />
                  </TableCell>
                  <TableCell className="font-medium">{lead.firstName} {lead.lastName}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell className="max-w-[160px] truncate">{lead.useCase}</TableCell>
                  <TableCell>{lead.preferredDate}</TableCell>
                  <TableCell>
                    <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                      <SelectTrigger className="h-8 text-xs w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/talk-to-sales/leads/${lead.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
