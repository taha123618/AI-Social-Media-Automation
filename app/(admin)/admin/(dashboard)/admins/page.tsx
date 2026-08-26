"use client";

import { useEffect, useState, useRef } from "react";
import { getAdmins, deleteAdmin } from "../../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "../../_components/data-table";
import { columns } from "../../_components/columns";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, RefreshCw, Shield, Search, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AdminManagementPage() {
   const [admins, setAdmins] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   async function fetchAdmins() {
      setIsLoading(true);
      try {
         const data = await getAdmins();
         setAdmins(data);
      } catch (error) {
         toast.error("Failed to fetch administrative protocol records");
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      fetchAdmins();
   }, []);

   async function handleDelete() {
      if (!deleteId) return;
      setIsDeleting(true);
      try {
         await deleteAdmin(deleteId);
         toast.success("Security access credentials revoked");
         fetchAdmins();
      } catch (error) {
         toast.error("Failed to terminate administrative session");
      } finally {
         setIsDeleting(false);
         setDeleteId(null);
      }
   }

   return (
      <div ref={containerRef} className="space-y-10 pb-10">
         <div className="admin-header flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                     <Users className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">Admin Management</h1>
               </div>
               <p className="text-muted-foreground text-lg ml-15 font-medium">Configure and monitor platform administrators and their access levels.</p>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={fetchAdmins} className="glass-card hover:bg-muted font-semibold px-6 border-border" disabled={isLoading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4 text-primary", isLoading && "animate-spin")} />
                  Refresh
               </Button>
               <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold px-8 rounded-xl transition-all hover:scale-105 active:scale-95">
                  <Link href="/admin/admins/add">
                     <Plus className="mr-2 h-5 w-5" />
                     Add Administrator
                  </Link>
               </Button>
            </div>
         </div>

         <div className="table-container w-full">
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
                           <Shield className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                     </div>
                     <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-foreground">Initialising Protocol...</p>
                        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Synchronizing Security Nodes</p>
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
                           columns={columns(setDeleteId)}
                           data={admins}
                           searchKey="email"
                           searchPlaceholder="Search protocol identifiers by email..."
                        />
                     </motion.div>
               )}
            </AnimatePresence>
         </div>

         <Dialog open={!!deleteId} onOpenChange={(open: any) => !open && setDeleteId(null)}>
            <DialogContent className="glass-card border-border bg-background/95 backdrop-blur-2xl">
               <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground">Authorized Access Revocation</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                     This will permanently revoke all access privileges for this administrator. This action is logged and irreversible.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className="gap-3 mt-4">
                  <Button variant="outline" className="glass-card border-border hover:bg-muted font-bold px-8 rounded-xl" disabled={isDeleting} onClick={() => setDeleteId(null)}>Abort Ops</Button>
                  <Button
                     onClick={(e: any) => {
                        e.preventDefault();
                        handleDelete();
                     }}
                     className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 font-bold px-8 rounded-xl"
                     disabled={isDeleting}
                  >
                     {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                     {isDeleting ? "Terminating..." : "Confirm Deletion"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
