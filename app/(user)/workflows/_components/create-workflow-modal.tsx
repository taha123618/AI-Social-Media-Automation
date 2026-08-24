'use client';

import { useState } from 'react';
import { X, Plus, Zap, Trash2, Loader, Save, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorkflow, updateWorkflow } from '../actions/mutations';
import { toast } from 'sonner';
import { Workflow, WorkflowTemplate } from '@/features/workflow/types';
import { cn } from '@/lib/utils';

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
  { id: 'JOB_PHOTO', label: 'Job Photo', icon: Camera, desc: 'Work-in-progress or completed job photos' },
  { id: 'BEFORE_AFTER', label: 'Before & After', icon: ImageIcon, desc: 'Transformation and result comparisons' },
  { id: 'PRODUCT', label: 'Product', icon: ImageIcon, desc: 'Product showcases and features' },
];

const TRIGGER_TYPES = ['MANUAL', 'SCHEDULED', 'EVENT_BASED', 'PHOTO_UPLOAD', 'BEFORE_AFTER_UPLOAD'];

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

  // Upload config state
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
    })) || [{ name: 'Generate Content', type: 'CONTENT_GENERATION', config: {} }]
  );

  const addStep = () => {
    setSteps([...steps, { name: 'New Step', type: 'NOTIFICATION', config: {} }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i: number) => i !== index));
  };

  const updateStep = (index: number, updates: Partial<WorkflowStepInput>) => {
    setSteps(steps.map((step, i: number) => i === index ? { ...step, ...updates } : step));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error('Workflow name is required');
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
    } catch (error) {
      toast.error('Failed to save workflow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit' : 'Create'} Workflow
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {initialData ? 'Update your automation flow' : 'Design your automation flow'}
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Workflow Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Daily Engagement Flow"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this workflow do?"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Trigger Type</label>
              <select
                value={trigger.type}
                onChange={(e) => setTrigger({ ...trigger, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="MANUAL">Manual</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="EVENT_BASED">Event Based</option>
                <option value="PHOTO_UPLOAD">Photo Upload</option>
                <option value="BEFORE_AFTER_UPLOAD">Before/After Upload</option>
              </select>
              {isUploadTrigger && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
                  This workflow triggers when images are uploaded via drag-and-drop
                </p>
              )}
            </div>

            {/* Upload automation config */}
            {isUploadTrigger && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600">Upload Configuration</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Upload Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {UPLOAD_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setUploadCategory(cat.id as typeof uploadCategory)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                          uploadCategory === cat.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                      >
                        <cat.icon className={cn(
                          'h-5 w-5',
                          uploadCategory === cat.id ? 'text-blue-600' : 'text-slate-400'
                        )} />
                        <span className={cn(
                          'text-xs font-bold',
                          uploadCategory === cat.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500'
                        )}>
                          {cat.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoCaption}
                      onChange={(e) => setAutoCaption(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Auto-caption</span>
                      <p className="text-xs text-slate-400">AI generates caption from image</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoSchedule}
                      onChange={(e) => setAutoSchedule(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Auto-schedule</span>
                      <p className="text-xs text-slate-400">Queue for best time slot</p>
                    </div>
                  </label>
                </div>

                {autoSchedule && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Platform</label>
                      <select
                        value={uploadPlatform}
                        onChange={(e) => setUploadPlatform(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      >
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="FACEBOOK">Facebook</option>
                        <option value="LINKEDIN">LinkedIn</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="GOOGLE_BUSINESS">Google Business</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Offset (min)</label>
                      <input
                        type="number"
                        value={scheduleOffset}
                        onChange={(e) => setScheduleOffset(Number(e.target.value))}
                        min={0}
                        max={1440}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Workflow Steps</h3>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-3 w-3" /> Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((step: WorkflowStepInput, idx: number) => (
                <div key={idx} className="group relative rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-blue-600">Step {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStep(idx, { name: e.target.value })}
                      placeholder="Step Name"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    />
                    <select
                      value={step.type}
                      onChange={(e) => updateStep(idx, { type: e.target.value })}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <option value="CONTENT_GENERATION">Generation</option>
                      <option value="CONTENT_REVIEW">Review</option>
                      <option value="NOTIFICATION">Notification</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 py-3 font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save Workflow
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
