"use client";

import { useEffect, useState } from "react";
import { UserForm } from "../../../../_components/forms/user-form";
import { updateUser, getUsers } from "../../../../actions/admin.actions";
import { Users, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const users = await getUsers();
        const foundUser = users.find((u: any) => u.id === id);
        if (foundUser) {
          setUser(foundUser);
        } else {
          toast.error("User instance not found");
        }
      } catch (error) {
        toast.error("Failed to fetch user metadata");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">User Not Found</h2>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/users">Return to Registry</Link>
        </Button>
      </div>
    );
  }

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
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Reconfigure Identity</h1>
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
            <h2 className="text-xl font-bold text-foreground">Identity Protocol Overrides</h2>
            <p className="text-muted-foreground font-medium">Modify existing credentials or update personal identifiers for <span className="text-foreground font-bold">{user.name}</span>.</p>
          </div>
          <UserForm
            initialData={{
              name: user.name,
              email: user.email
            }}
            onSubmit={(data) => updateUser(id, data)}
          />
        </div>
      </motion.div>
    </div>
  );
}
