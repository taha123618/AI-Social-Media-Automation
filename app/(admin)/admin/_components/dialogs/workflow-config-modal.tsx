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
import { toast } from "sonner";
import { Loader2, Settings2 } from "lucide-react";
import { updateWorkflowConfig } from "../../actions/admin.actions";

interface WorkflowConfigModalProps {
  workflow: { id: string; name: string; trigger: any } | null;
  onClose: () => void;
}

export function WorkflowConfigModal({ workflow, onClose }: WorkflowConfigModalProps) {
  const [configStr, setConfigStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize config when workflow is provided
  useState(() => {
    if (workflow) {
      setConfigStr(JSON.stringify(workflow.trigger, null, 2));
    }
  });

  if (!workflow) return null;

  const handleSave = async () => {
    try {
      const parsedConfig = JSON.parse(configStr);
      setIsSaving(true);
      await updateWorkflowConfig(workflow.id, parsedConfig);
      toast.success("Workflow engine reconfiguration complete");
      onClose();
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid protocol syntax (JSON Error)");
      } else {
        toast.error("Failed to update engine configuration");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!workflow} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl glass-card border-border bg-background/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            Engine Configuration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Fine-tune logic overrides for workflow: <span className="text-foreground font-bold">{workflow.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <textarea
              value={configStr}
              onChange={(e) => setConfigStr(e.target.value)}
              className="relative w-full min-h-[350px] p-4 bg-black/5 dark:bg-black/40 border border-border rounded-2xl font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              spellCheck={false}
            />
          </div>
        </div>
        <DialogFooter className="gap-3 flex-col sm:flex-row mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto glass-card border-border font-bold">
            Discard Changes
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings2 className="h-4 w-4 mr-2" />}
            Commit Directives
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
