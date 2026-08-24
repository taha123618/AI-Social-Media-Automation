"use client";

import { useEffect, useState, useRef } from "react";
import { getWorkflows, deleteWorkflow } from "../../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "../../_components/data-table";
import { workflowColumns } from "../../_components/columns";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Workflow, RefreshCw, Shield, Search, Loader2, Trash2, Settings2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

import { WorkflowConfigModal } from "../../_components/dialogs/workflow-config-modal";
import { toggleWorkflowStatus } from "../../actions/admin.actions";

export default function WorkflowManagementPage() {
   const [workflows, setWorkflows] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [configWorkflow, setConfigWorkflow] = useState<any | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   async function fetchWorkflows() {
      setIsLoading(true);
      try {
         const data = await getWorkflows();
         setWorkflows(data);
      } catch (error) {
         toast.error("Failed to fetch system workflows");
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      fetchWorkflows();
   }, []);

   useGSAP(() => {
      if (!isLoading) {
         gsap.from(".header-section", {
            y: -20,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out"
         });
         gsap.from(".table-section", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.2
         });
      }
   }, [isLoading]);

   async function handleDelete() {
      if (!deleteId) return;
      setIsDeleting(true);
      try {
         await deleteWorkflow(deleteId);
         toast.success("Workflow engine purged successfully");
         fetchWorkflows();
      } catch (error) {
         toast.error("Failed to decommission workflow");
      } finally {
         setIsDeleting(false);
         setDeleteId(null);
      }
   }

   async function handleToggleStatus(id: string, isActive: boolean) {
      try {
         await toggleWorkflowStatus(id, isActive);
         toast.success(`Workflow engine ${isActive ? 'reactivated' : 'paused'}`);
         fetchWorkflows();
      } catch (error) {
         toast.error("Failed to update engine state");
      }
   }

   return (
      <div ref={containerRef} className="space-y-10 pb-10">
         <div className="header-section flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                     <Workflow className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">Workflow Engine</h1>
               </div>
               <p className="text-muted-foreground text-lg font-medium ml-15">Monitor and manage automated logic flows across all tenant workspaces.</p>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={fetchWorkflows} className="glass-card hover:bg-muted font-semibold px-6 border-border" disabled={isLoading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4 text-primary", isLoading && "animate-spin")} />
                  Refresh
               </Button>
               <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold px-8 rounded-xl transition-all hover:scale-105 active:scale-95">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
               </Button>
            </div>
         </div>

         <div className="table-section w-full">
            <AnimatePresence mode="wait">
               {isLoading ? (
                  <motion.div
                     key="loading"
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="flex h-[500px] flex-col items-center justify-center space-y-6 rounded-3xl border border-border bg-card/30 backdrop-blur-xl shadow-2xl"
                  >
                     <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Workflow className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                     </div>
                     <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-foreground">Querying Automation Hub...</p>
                        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Fetching Execution Metadata</p>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div
                     key="table"
                     initial={{ opacity: 0, scale: 0.98 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="glass-card premium-border overflow-hidden rounded-3xl border-0 bg-card/20 backdrop-blur-md shadow-2xl"
                  >
                     <DataTable
                        columns={workflowColumns(setDeleteId, setConfigWorkflow, handleToggleStatus)}
                        data={workflows}
                        searchKey="name"
                        searchPlaceholder="Search active engines by name..."
                     />
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <WorkflowConfigModal workflow={configWorkflow} onClose={() => setConfigWorkflow(null)} />

         <Dialog open={!!deleteId} onOpenChange={(open: any) => !open && setDeleteId(null)}>
            <DialogContent className="glass-card border-border bg-background/95 backdrop-blur-2xl">
               <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground">Critical Engine Decommission</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                     You are about to purge this workflow engine. Any active executions will be halted and logic definitions will be erased. This action cannot be reversed.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className="gap-3 mt-4">
                  <Button variant="outline" className="glass-card border-border hover:bg-muted font-bold px-8 rounded-xl" disabled={isDeleting} onClick={() => setDeleteId(null)}>Abort Request</Button>
                  <Button
                     onClick={(e: any) => {
                        e.preventDefault();
                        handleDelete();
                     }}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 font-bold px-8 rounded-xl"
                     disabled={isDeleting}
                  >
                     {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                     {isDeleting ? "Purging Engine..." : "Confirm Purge"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
