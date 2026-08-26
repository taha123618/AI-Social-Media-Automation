'use client';

import { Play, Pause, Edit2, Trash2, Clock, Calendar, Zap, ChevronRight, Activity, Plus, Loader2, MessageCircle, Users, CheckCircle2, Upload, Camera } from 'lucide-react';
import { formatDateLong, formatDateShort } from '@/lib/date-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toggleWorkflow, deleteWorkflow, runWorkflow } from '../actions/mutations';
import { toast } from 'sonner';
import { WorkflowWithTeam, WorkflowComment } from '@/features/workflow/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { UploadWorkflowCard } from './upload-workflow-card';
import { cn } from '@/lib/utils';

interface WorkflowListProps {
  workflows: WorkflowWithTeam[];
}

export function WorkflowList({ workflows }: WorkflowListProps) {
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);

  const getTriggerIcon = (type: string) => {
    const iconProps = { className: 'h-3 w-3' };
    switch (type) {
      case 'MANUAL':
        return <Play {...iconProps} />;
      case 'SCHEDULED':
        return <Calendar {...iconProps} />;
      case 'EVENT_BASED':
        return <Zap {...iconProps} />;
      case 'PHOTO_UPLOAD':
        return <Upload {...iconProps} />;
      case 'BEFORE_AFTER_UPLOAD':
        return <Camera {...iconProps} />;
      default:
        return <Clock {...iconProps} />;
    }
  };

  const getTriggerBadge = (type: string) => {
    switch (type) {
      case 'SCHEDULED':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-mono gap-1">{getTriggerIcon(type)} Scheduled</Badge>;
      case 'EVENT_BASED':
        return <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/30 text-[10px] font-mono gap-1">{getTriggerIcon(type)} Webhook</Badge>;
      case 'PHOTO_UPLOAD':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-mono gap-1">{getTriggerIcon(type)} Ingestion</Badge>;
      case 'BEFORE_AFTER_UPLOAD':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono gap-1">{getTriggerIcon(type)} Split Drop</Badge>;
      default:
        return <Badge variant="outline" className="bg-secondary text-muted-foreground border-border text-[10px] font-mono gap-1">{getTriggerIcon(type)} Manual</Badge>;
    }
  };

  const handleRunWorkflow = async (workflowId: string) => {
    setIsRunning(workflowId);
    try {
      await runWorkflow(workflowId);
      toast.success('Workflow execution started successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to start workflow execution');
    } finally {
      setIsRunning(null);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setIsToggling(id);
    try {
      await toggleWorkflow(id, !currentStatus);
      toast.success(`Workflow ${!currentStatus ? 'enabled' : 'paused'} successfully`);
    } catch {
      toast.error('Failed to update workflow status');
    } finally {
      setIsToggling(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteWorkflow(id);
      toast.success('Workflow deleted successfully');
    } catch {
      toast.error('Failed to delete workflow');
    } finally {
      setIsDeleting(null);
      setShowConfirmDelete(null);
    }
  };

  const uploadWorkflows = workflows.filter(w =>
    w.trigger.type === 'PHOTO_UPLOAD' || w.trigger.type === 'BEFORE_AFTER_UPLOAD'
  );
  const standardWorkflows = workflows.filter(w =>
    w.trigger.type !== 'PHOTO_UPLOAD' && w.trigger.type !== 'BEFORE_AFTER_UPLOAD'
  );

  return (
    <div className="space-y-8">
      {/* Upload Workflow Cards */}
      {uploadWorkflows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Media Upload Automations</h2>
              <p className="text-[11px] text-muted-foreground">Drag &amp; drop images to auto-synthesize social copy</p>
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {uploadWorkflows.map(workflow => (
              <UploadWorkflowCard
                key={workflow.id}
                workflowId={workflow.id}
                workflowName={workflow.name}
                uploadCategory={workflow.uploadConfig?.uploadCategory || 'JOB_PHOTO'}
                autoCaption={workflow.uploadConfig?.autoCaption ?? true}
                autoSchedule={workflow.uploadConfig?.autoSchedule ?? false}
                platform={workflow.uploadConfig?.platform || 'INSTAGRAM'}
                lastPostPreview={null}
                initialResult={workflow.lastDraft}
              />
            ))}
          </div>
        </div>
      )}

      {/* Standard Workflows */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Active Agent Pipelines</h2>
              <p className="text-[11px] text-muted-foreground">
                {standardWorkflows.filter(w => w.isActive).length} operational orchestration pipelines
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {standardWorkflows.map((workflow, index) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
              className="group relative rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition-all overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {workflow.name}
                    </h3>
                    {getTriggerBadge(workflow.trigger.type)}
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'} className="text-[10px] font-mono">
                      {workflow.isActive ? 'Operational' : 'Paused'}
                    </Badge>
                  </div>

                  {workflow.description && (
                    <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                      {workflow.description}
                    </p>
                  )}

                  {/* Pipeline Steps Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono font-semibold uppercase text-muted-foreground mr-1">
                      Pipeline:
                    </span>
                    {workflow.steps.map((step, idx) => (
                      <span
                        key={step.id || idx}
                        className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-md bg-secondary/50 border border-border/70 text-[11px] font-medium text-foreground"
                      >
                        <span className="h-3.5 w-3.5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[9px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span>{step.name}</span>
                      </span>
                    ))}
                  </div>

                  {/* Telemetry Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 font-mono">
                    <span>Runs: <strong className="text-foreground">{workflow.runCount}</strong></span>
                    <span>•</span>
                    <span>Success: <strong className="text-emerald-500">{workflow.successRate}</strong></span>
                    <span>•</span>
                    <span suppressHydrationWarning>
                      Last Run: <strong className="text-foreground">{workflow.lastRunAt ? formatDateShort(workflow.lastRunAt) : 'Never'}</strong>
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/60">
                  <Button
                    size="sm"
                    onClick={() => handleRunWorkflow(workflow.id)}
                    disabled={isRunning === workflow.id || !workflow.isActive}
                    className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5 shadow-xs active:scale-95"
                  >
                    {isRunning === workflow.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                    <span>Execute</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(workflow.id, workflow.isActive)}
                    disabled={isToggling === workflow.id}
                    className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
                  >
                    {isToggling === workflow.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : workflow.isActive ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 text-primary" />
                        <span>Resume</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.dispatchEvent(new CustomEvent('edit-workflow', { detail: { workflow } }))}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirmDelete(workflow.id)}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Confirm Delete Dialog */}
              <AnimatePresence>
                {showConfirmDelete === workflow.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-between gap-3 text-xs text-foreground"
                  >
                    <span className="font-medium text-destructive">Permanently delete this workflow?</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowConfirmDelete(null)}
                        className="h-7 px-2.5 text-xs rounded-md"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(workflow.id)}
                        disabled={isDeleting === workflow.id}
                        className="h-7 px-2.5 text-xs rounded-md gap-1"
                      >
                        {isDeleting === workflow.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        <span>Confirm Delete</span>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {standardWorkflows.length === 0 && uploadWorkflows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-border/80 bg-card/40 text-center relative overflow-hidden"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-xs">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">No Workflows Deployed</h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Create an autonomous multi-step execution pipeline to research, write, and schedule posts automatically.
            </p>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('open-create-workflow'))}
              size="sm"
              className="h-9 px-4 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Initialize Pipeline</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
