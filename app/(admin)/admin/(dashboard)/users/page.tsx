"use client";

import { useEffect, useState, useRef } from "react";
import { getUsers, deleteUser } from "../../actions/admin.actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "../../_components/data-table";
import { userColumns } from "../../_components/columns";
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
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

import { MessagingDialog } from "../../_components/dialogs/messaging-dialog";

export default function UserManagementPage() {
   const [users, setUsers] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [messageUser, setMessageUser] = useState<{ id: string; name: string } | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);

   async function fetchUsers() {
      setIsLoading(true);
      try {
         const data = await getUsers();
         setUsers(data);
      } catch (error) {
         toast.error("Failed to fetch platform users");
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      fetchUsers();
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
         await deleteUser(deleteId);
         toast.success("User protocol terminated successfully");
         fetchUsers();
      } catch (error) {
         toast.error("Failed to revoke user access");
      } finally {
         setIsDeleting(false);
         setDeleteId(null);
      }
   }

   return (
      <div ref={containerRef} className="space-y-10 pb-10">
         <div className="header-section flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/20">
                     <Users className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">User Registry</h1>
               </div>
               <p className="text-muted-foreground text-lg font-medium ml-15">Manage platform identities, permissions, and service access.</p>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={fetchUsers} className="glass-card hover:bg-muted font-semibold px-6 border-border" disabled={isLoading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4 text-emerald-500", isLoading && "animate-spin")} />
                  Refresh
               </Button>
               <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-bold px-8 rounded-xl transition-all hover:scale-105 active:scale-95">
                  <Link href="/admin/users/add">
                     <Plus className="mr-2 h-5 w-5" />
                     Add New User
                  </Link>
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
                        <div className="h-16 w-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Shield className="h-6 w-6 text-emerald-500 animate-pulse" />
                        </div>
                     </div>
                     <div className="text-center space-y-2">
                        <p className="text-xl font-bold text-foreground">Syncing Identity Core...</p>
                        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-widest uppercase">Querying Platform Database</p>
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
                        columns={userColumns(setDeleteId, setMessageUser)}
                        data={users}
                        searchKey="name"
                        searchPlaceholder="Search identities by name or email..."
                     />
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <MessagingDialog user={messageUser} onClose={() => setMessageUser(null)} />

         <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
            <DialogContent className="glass-card border-border bg-background/95 backdrop-blur-2xl">
               <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-foreground">Irreversible Data Purge</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                     You are about to permanently terminate this user identity. This will revoke all associated workspaces and data access. This action is logged for security audit purposes.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter className="gap-3 flex-col sm:flex-row mt-4">
                  <Button variant="outline" className="glass-card border-border hover:bg-muted font-bold px-8 rounded-xl" disabled={isDeleting} onClick={() => setDeleteId(null)}>Abort Ops</Button>
                  <Button
                     onClick={(e) => {
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

