"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Globe,
  Users,
  Target,
  Calendar,
  Clock,
  Briefcase,
  MessageSquare,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EmailComposer } from "../../_components/email-composer";

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
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown> | null;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchLead() {
      try {
        const res = await fetch(`/api/talk-to-sales/leads/${id}`);
        const json = await res.json();
        if (json.success) {
          setLead(json.data);
          setStatus(json.data.status);
        } else {
          toast.error("Lead not found");
        }
      } catch {
        toast.error("Failed to fetch lead");
      } finally {
        setIsLoading(false);
      }
    }
    fetchLead();
  }, [id]);

  async function updateStatus(newStatus: string) {
    try {
      const res = await fetch(`/api/talk-to-sales/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus(newStatus);
        toast.success("Status updated");
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Lead not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/talk-to-sales/leads">Back to Leads</Link>
        </Button>
      </div>
    );
  }

  const fields = [
    { icon: Mail, label: "Email", value: lead.email, href: `mailto:${lead.email}` },
    { icon: Phone, label: "Phone", value: lead.phone },
    { icon: Building2, label: "Company", value: lead.company },
    { icon: Briefcase, label: "Job Title", value: lead.jobTitle },
    { icon: Users, label: "Team Size", value: lead.teamSize },
    { icon: Globe, label: "Country", value: lead.country },
    { icon: Target, label: "Use Case", value: lead.useCase },
    { icon: Calendar, label: "Preferred Date", value: lead.preferredDate },
    { icon: Clock, label: "Preferred Time", value: lead.preferredTime },
    { icon: MessageSquare, label: "Notes", value: lead.notes || "—" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/admin/talk-to-sales/leads">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>
      </Button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{lead.firstName} {lead.lastName}</h1>
          <p className="text-muted-foreground mt-1">{lead.company}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={updateStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Lead Information</h2>
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <field.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{field.label}</p>
                  {field.href ? (
                    <a href={field.href} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                      {field.value}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium break-words">{field.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium">Lead Created</p>
                  <p className="text-muted-foreground text-xs">{new Date(lead.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium">Status Set to {lead.status}</p>
                  <p className="text-muted-foreground text-xs">{new Date(lead.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <EmailComposer
                mode="single"
                recipients={[{
                  id: lead.id,
                  firstName: lead.firstName,
                  lastName: lead.lastName,
                  email: lead.email,
                  company: lead.company,
                  preferredDate: lead.preferredDate,
                  preferredTime: lead.preferredTime,
                }]}
              >
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-3 h-4 w-4" />
                  Send Email
                </Button>
              </EmailComposer>
            </div>
          </div>

          {lead.metadata && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Metadata</h2>
              <pre className="text-xs text-muted-foreground bg-muted p-3 rounded-lg overflow-auto max-h-40">
                {JSON.stringify(lead.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
