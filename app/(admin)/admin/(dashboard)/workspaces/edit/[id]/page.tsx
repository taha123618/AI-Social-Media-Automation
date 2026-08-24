"use client";

import { useEffect, useState } from "react";
import { BusinessForm } from "../../../../_components/forms/business-form";
import { updateBusiness, getBusinesses } from "../../../../actions/admin.actions";
import { Building2, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const businesses = await getBusinesses();
        const found = businesses.find((b: any) => b.id === id);
        if (found) {
          setBusiness(found);
        } else {
          toast.error("Workspace node not found");
        }
      } catch (error) {
        toast.error("Failed to fetch workspace metadata");
      } finally {
         setIsLoading(false);
      }
    }
    fetchBusiness();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Node Not Found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/workspaces">Return to Cluster</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" className="hover:bg-accent -ml-4 mb-2 text-muted-foreground">
            <Link href="/admin/workspaces">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Cluster
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reconfigure Node</h1>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card premium-border p-8 rounded-3xl bg-card/20 backdrop-blur-xl shadow-2xl"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Node Metadata Updates</h2>
            <p className="text-muted-foreground font-medium">Modify routing slugs or display identifiers for <span className="text-foreground font-bold">{business.name}</span>.</p>
          </div>
          <BusinessForm
            initialData={{
              name: business.name,
              slug: business.slug,
              website: business.website || ""
            }}
            onSubmit={(data) => updateBusiness(id, data)}
          />
        </div>
      </motion.div>
    </div>
  );
}
