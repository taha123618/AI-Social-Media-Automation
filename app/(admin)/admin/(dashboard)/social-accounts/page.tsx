"use client";

import { useEffect, useState, useRef } from "react";
import { getSocialAccounts, deleteSocialAccount } from "../../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "../../_components/data-table";
import { socialAccountColumns } from "../../_components/columns";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Hash, RefreshCw, Shield, Search, Loader2, Trash2, Link2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { updateSocialAccountStatus } from "../../actions/admin.actions";
import { LinkSocialAccountModal } from "../../_components/dialogs/link-social-account-modal";

export default function SocialAccountManagementPage() {
   const [accounts, setAccounts] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   async function fetchAccounts() {
      setIsLoading(true);
      try {
         const data = await getSocialAccounts();
         setAccounts(data);
      } catch (error) {
         toast.error("Failed to fetch social accounts");
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      fetchAccounts();
   }, []);

   async function handleDelete() {
      if (!deleteId) return;
      setIsDeleting(true);
      try {
         await deleteSocialAccount(deleteId);
         toast.success("Social account link terminated");
         fetchAccounts();
      } catch (error) {
         toast.error("Failed to revoke account access");
      } finally {
         setIsDeleting(false);
         setDeleteId(null);
      }
   }

   async function handleToggleStatus(id: string, isActive: boolean) {
      try {
         await updateSocialAccountStatus(id, isActive);
         toast.success(`Channel ${isActive ? 'synched' : 'disconnected'}`);
         fetchAccounts();
      } catch (error) {
         toast.error("Failed to update channel status");
      }
   }

   return (
      <div ref={containerRef} className="space-y-10 pb-10">
         <div className="header-section flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
                     <Hash className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">Social Channels</h1>
               </div>
               <p className="text-muted-foreground text-lg font-medium ml-15">Monitor and manage connected social media profiles and API authorizations.</p>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={fetchAccounts} className="glass-card hover:bg-muted font-semibold px-6 border-border" disabled={isLoading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4 text-primary", isLoading && "animate-spin")} />
                  Refresh
               </Button>
               <Button
                  onClick={() => setIsLinkModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 font-bold px-8 rounded-xl transition-all hover:scale-105 active:scale-95"
               >
                  <Link2 className="mr-2 h-5 w-5" />
                  Link New Channel
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
                           <Hash className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                     </div>
                     <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-foreground">Syncing Channel Matrix...</p>
                        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Validating API Tokens</p>
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
                        columns={socialAccountColumns(setDeleteId, handleToggleStatus)}
                        data={accounts}
                        searchKey="name"
                        searchPlaceholder="Search identities by platform name..."
                     />
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <Dialog open={!!deleteId} onOpenChange={(open: any) => !open && setDeleteId(null)}>
            <DialogContent className="glass-card border-border bg-background/95 backdrop-blur-2xl">
               <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground">Revoke Platform Authorization</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                     You are about to terminate the API link for this social channel. The system will lose all posting and monitoring capabilities for this account immediately.
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
                     {isDeleting ? "Revoking..." : "Confirm Revocation"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <LinkSocialAccountModal
            isOpen={isLinkModalOpen}
            onClose={() => setIsLinkModalOpen(false)}
            onSuccess={fetchAccounts}
         />
      </div>
   );
}
