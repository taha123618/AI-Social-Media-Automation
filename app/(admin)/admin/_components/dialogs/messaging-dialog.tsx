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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { sendMessageToUser } from "../../actions/admin.actions";

interface MessagingDialogProps {
  user: { id: string; name: string } | null;
  onClose: () => void;
}

export function MessagingDialog({ user, onClose }: MessagingDialogProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!user) return null;

  const handleSend = async () => {
    if (!message.trim()) return toast.error("Please enter a message");

    setIsSending(true);
    try {
      await sendMessageToUser(user.id, message);
      toast.success(`Message dispatched to ${user.name}`);
      setMessage("");
      onClose();
    } catch (error) {
      toast.error("Failed to transmit protocol message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="glass-card border-border bg-background/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Administrative Message
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Transmission protocol for user: <span className="text-foreground font-bold">{user.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Enter administrative directive or notification..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[150px] glass-card border-border focus:ring-primary/20 rounded-2xl"
          />
        </div>
        <DialogFooter className="gap-3 flex-col sm:flex-row mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSending} className="w-full sm:w-auto glass-card border-border font-bold">
            Abort
          </Button>
          <Button onClick={handleSend} disabled={isSending} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
            {isSending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Dispatch Transmission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
