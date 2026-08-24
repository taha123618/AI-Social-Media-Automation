"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Link2, ShieldCheck } from "lucide-react";
import { manualLinkAccount } from "../../actions/admin.actions";

interface LinkSocialAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const platforms = [
  { id: "X", name: "X (Twitter)" },
  { id: "INSTAGRAM", name: "Instagram" },
  { id: "LINKEDIN", name: "LinkedIn" },
  { id: "FACEBOOK", name: "Facebook" },
];

export function LinkSocialAccountModal({ isOpen, onClose, onSuccess }: LinkSocialAccountModalProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [formData, setFormData] = useState({
    businessId: "",
    platform: "",
    name: "",
    accountId: "",
    accessToken: "",
  });

  const handleLink = async () => {
    if (!formData.businessId || !formData.platform || !formData.name) {
      toast.error("Protocol error: Required fields missing");
      return;
    }

    setIsLinking(true);
    try {
      await manualLinkAccount(formData);
      toast.success("Social identity protocol established");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to establish platform link");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl glass-card border-border bg-background/95 backdrop-blur-2xl p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            Manual Link Protocol
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium text-base">
            Establish a manual API authorization link for a business workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Target Workspace ID</Label>
            <Input
              placeholder="Enter Business UUID"
              value={formData.businessId}
              onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
              className="h-12 border-border bg-muted/20 rounded-xl font-mono text-xs focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Platform Hub</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                <SelectTrigger className="h-12 border-border bg-muted/20 rounded-xl font-bold">
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border rounded-xl">
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="font-bold">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Identity Name</Label>
              <Input
                placeholder="@username"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 border-border bg-muted/20 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Authorization Token (Optional)</Label>
            <Input
              type="password"
              placeholder="pb_token_v1_..."
              value={formData.accessToken}
              onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
              className="h-12 border-border bg-muted/20 rounded-xl font-mono text-xs focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 mt-6 flex-col sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={isLinking} className="w-full sm:w-auto glass-card border-border font-black px-8 rounded-xl h-12">
            Abort link
          </Button>
          <Button onClick={handleLink} disabled={isLinking} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black px-12 rounded-xl h-12 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            {isLinking ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <ShieldCheck className="h-5 w-5 mr-2" />}
            {isLinking ? "Establishing..." : "Commit Protocol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
