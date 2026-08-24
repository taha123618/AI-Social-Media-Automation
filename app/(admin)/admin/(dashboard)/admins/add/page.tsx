"use client";

import { AdminForm } from "../../../_components/admin-form";
import { ChevronLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AddAdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" className="hover:bg-accent -ml-4 mb-2 text-muted-foreground">
            <Link href="/admin/admins">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Security Panel
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Initialize Security Node</h1>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AdminForm />
      </motion.div>
    </div>
  );
}
