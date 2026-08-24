"use client";

import { UserForm } from "../../../_components/forms/user-form";
import { createUser } from "../../../actions/admin.actions";
import { Users, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AddUserPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button asChild variant="ghost" className="hover:bg-accent -ml-4 mb-2 text-muted-foreground">
            <Link href="/admin/users">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Registry
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Provision New Identity</h1>
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
            <h2 className="text-xl font-bold text-foreground">Identity Profile</h2>
            <p className="text-muted-foreground font-medium">Configure credentials and personal details for the new user instance.</p>
          </div>
          <UserForm onSubmit={createUser} />
        </div>
      </motion.div>
    </div>
  );
}
