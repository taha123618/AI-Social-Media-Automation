'use client';

import { useState } from 'react';
import { X, Plus, Zap, Trash2, Loader2, Save, Camera, Image as ImageIcon, Workflow as WorkflowIcon, ChevronDown, Clock, Webhook, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorkflow, updateWorkflow } from '../actions/mutations';
import { toast } from 'sonner';
import { Workflow, WorkflowTemplate } from '@/features/workflow/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface CreateWorkflowModalProps {
  onClose: () => void;
  businessId: string;
  initialData?: Workflow | WorkflowTemplate;
}

interface WorkflowStepInput {
  name: string;
  type: string;
  config: Record<string, unknown>;
  order?: number;
}

const UPLOAD_CATEGORIES = [
  { id: 'JOB_PHOTO', label: 'Job Asset', icon: Camera, desc: 'Work-in-progress or project showcase photos' },
  { id: 'BEFORE_AFTER', label: 'Transformation', icon: ImageIcon, desc: 'Before/after visual split comparisons' },
  { id: 'PRODUCT', label: 'Product Hero', icon: ImageIcon, desc: 'E-commerce and feature demonstrations' },
];

const TRIGGER_OPTIONS = [
  { id: 'MANUAL', label: 'Manual Trigger', icon: Play, desc: 'Run on-demand from dashboard' },
  { id: 'SCHEDULED', label: 'Cron Interval', icon: Clock, desc: 'Recurring timetable execution' },
  { id: 'EVENT_BASED', label: 'Webhook Event', icon: Webhook, desc: 'Triggered by external webhooks' },
  { id: 'PHOTO_UPLOAD', label: 'Media Ingestion', icon: Camera, desc: 'Auto-triggers upon file upload' },
  { id: 'BEFORE_AFTER_UPLOAD', label: 'Transformation Drop', icon: ImageIcon, desc: 'Auto-triggers on pair upload' },
];

const STEP_TYPE_MAP: Record<string, { label: string; badgeColor: string }> = {
  CONTENT_GENERATION: { label: 'AI Copy Generation', badgeColor: 'bg-primary/10 text-primary border-primary/30' },
  IMAGE_GENERATION: { label: 'Media Synthesis', badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  CONTENT_REVIEW: { label: 'Human-in-the-Loop', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  AUTO_POST: { label: 'Auto-Publish', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  NOTIFICATION: { label: 'Alert Dispatch', badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
};

export function CreateWorkflowModal({ onClose, businessId, initialData }: CreateWorkflowModalProps) {
  const isEditingWorkflow = initialData && 'businessId' in initialData;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [trigger, setTrigger] = useState(
    isEditingWorkflow
      ? (initialData as Workflow).trigger
      : { type: 'MANUAL', config: {} }
  );

  const [uploadCategory, setUploadCategory] = useState<'JOB_PHOTO' | 'BEFORE_AFTER' | 'PRODUCT'>('JOB_PHOTO');
  const [autoCaption, setAutoCaption] = useState(true);
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [uploadPlatform, setUploadPlatform] = useState('INSTAGRAM');
  const [scheduleOffset, setScheduleOffset] = useState(60);

  const isUploadTrigger = trigger.type === 'PHOTO_UPLOAD' || trigger.type === 'BEFORE_AFTER_UPLOAD';

  const [steps, setSteps] = useState<WorkflowStepInput[]>(
    initialData?.steps?.map((step, idx) => ({
      name: step.name,
      type: step.type,
      config: step.config || {},
      order: step.order ?? idx,
    })) || [
      { name: 'Analyze Context & Audience', type: 'CONTENT_GENERATION', config: {} },
      { name: 'Generate Multi-Channel Variants', type: 'CONTENT_GENERATION', config: {} }
    ]
  );

  const addStep = () => {
    setSteps([...steps, { name: `Pipeline Step ${steps.length + 1}`, type: 'NOTIFICATION', config: {} }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i: number) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<WorkflowStepInput>) => {
    setSteps(steps.map((step, i: number) => i === index ? { ...step, ...updates } : step));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Workflow name is required');
    if (!isUploadTrigger && steps.length === 0) return toast.error('At least one step is required');

    setIsSubmitting(true);
    try {
      const uploadConfig = isUploadTrigger ? {
        uploadCategory,
        autoCaption,
        autoSchedule,
        scheduleOffsetMinutes: scheduleOffset,
        platform: uploadPlatform,
      } : null;

      if (isEditingWorkflow) {
        await updateWorkflow((initialData as Workflow).id, {
          name,
          description,
          trigger,
          steps,
          uploadConfig,
        });
        toast.success('Workflow updated successfully');
      } else {
        await createWorkflow({
          name,
          description,
          trigger,
          steps,
          businessId,
          uploadConfig,
        });
        toast.success('Workflow created successfully');
      }
      onClose();
    } catch {
      toast.error('Failed to save workflow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-card border border-border/80 shadow-2xl overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-border/60 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
              <WorkflowIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                {initialData ? 'Edit Automation Workflow' : 'Create Agent Workflow'}
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  Orchestrator
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {initialData ? 'Update your autonomous execution graph' : 'Build multi-step agent pipelines with conditional triggers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 relative z-10 custom-scrollbar">
          <form id="workflow-modal-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Workflow Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autonomous Viral Repurposing"
                  className="h-10 text-xs rounded-xl bg-secondary/30 border-border/70 focus-visible:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Trigger Condition</label>
                <select
                  value={trigger.type}
                  onChange={(e) => setTrigger({ ...trigger, type: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border/70 bg-card px-3 text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                >
                  {TRIGGER_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Pipeline Objective & Notes</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what agents are involved and the intended business outcome..."
                rows={2}
                className="text-xs rounded-xl bg-secondary/30 border-border/70 resize-none focus-visible:ring-primary/30"
              />
            </div>

            {/* Ingestion Automation Config Card */}
            {isUploadTrigger && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-secondary/40 border border-border/70 space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-2">Ingestion Asset Classification</label>
                  <div className="grid grid-cols-3 gap-2">
                    {UPLOAD_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setUploadCategory(cat.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all',
                          uploadCategory === cat.id
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-xs'
                            : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <cat.icon className="h-4 w-4" />
                        <span className="text-[11px] font-semibold">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-card cursor-pointer hover:bg-secondary/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoCaption}
                      onChange={(e) => setAutoCaption(e.target.checked)}
                      className="rounded border-border"
                    />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Auto-Vision Caption</span>
                      <p className="text-[10px] text-muted-foreground">LLM synthesizes visual context</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-border/70 bg-card cursor-pointer hover:bg-secondary/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoSchedule}
                      onChange={(e) => setAutoSchedule(e.target.checked)}
                      className="rounded border-border"
                    />
                    <div>
                      <span className="text-xs font-semibold text-foreground">Auto-Schedule Queue</span>
                      <p className="text-[10px] text-muted-foreground">Places into peak traffic window</p>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Pipeline Step Graph */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                  <span>Execution Pipeline Nodes</span>
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {steps.length} nodes
                  </Badge>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStep}
                  className="h-7 px-2.5 text-xs rounded-lg gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Node</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {steps.map((step: WorkflowStepInput, idx: number) => {
                  const stepMeta = STEP_TYPE_MAP[step.type] || { label: step.type, badgeColor: 'bg-secondary text-foreground' };
                  return (
                    <div key={idx} className="relative flex flex-col gap-2">
                      <div className="group rounded-xl border border-border/80 bg-secondary/20 p-3.5 flex flex-col gap-2.5 shadow-xs hover:border-primary/40 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-mono font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-foreground">
                              {step.name || `Node ${idx + 1}`}
                            </span>
                            <Badge variant="outline" className={cn('text-[10px] font-mono py-0', stepMeta.badgeColor)}>
                              {stepMeta.label}
                            </Badge>
                          </div>

                          {steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStep(idx)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            type="text"
                            value={step.name}
                            onChange={(e) => updateStep(idx, { name: e.target.value })}
                            placeholder="Step Action Name"
                            className="h-8 text-xs rounded-lg bg-card border-border/70"
                          />
                          <select
                            value={step.type}
                            onChange={(e) => updateStep(idx, { type: e.target.value })}
                            className="h-8 rounded-lg border border-border/70 bg-card px-2 text-xs font-medium text-foreground outline-none"
                          >
                            <option value="CONTENT_GENERATION">AI Copy Generation</option>
                            <option value="IMAGE_GENERATION">Media Synthesis</option>
                            <option value="CONTENT_REVIEW">Human-in-the-Loop Review</option>
                            <option value="AUTO_POST">Auto Publish</option>
                            <option value="NOTIFICATION">Alert Notification</option>
                          </select>
                        </div>
                      </div>

                      {idx < steps.length - 1 && (
                        <div className="flex justify-center -my-1 text-muted-foreground/40">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-card/50 flex items-center justify-between shrink-0 relative z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs rounded-xl text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="workflow-modal-form"
            disabled={isSubmitting}
            size="sm"
            className="h-9 px-5 text-xs font-semibold rounded-xl gap-1.5 shadow-sm active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Pipeline...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>{initialData ? 'Update Workflow' : 'Save Workflow'}</span>
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
