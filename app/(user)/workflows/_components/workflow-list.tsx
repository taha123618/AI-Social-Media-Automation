'use client';

import { Play, Pause, Edit, Trash2, Clock, Calendar, Zap, ChevronRight, Activity, Plus, Loader, MessageCircle, Users, CheckCircle, AlertCircle, Upload, Camera } from 'lucide-react';
import { formatDateLong, formatDateShort } from '@/lib/date-utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toggleWorkflow, deleteWorkflow, runWorkflow } from '../actions/mutations';
import { toast } from 'sonner';
import { WorkflowWithTeam, WorkflowComment } from '@/features/workflow/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { UploadWorkflowCard } from './upload-workflow-card';

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
    const iconProps = { className: 'h-3.5 w-3.5' };
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

  const getTriggerColor = (type: string) => {
    const typeColors: Record<string, string> = {
      MANUAL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      SCHEDULED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      EVENT_BASED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      PHOTO_UPLOAD: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      BEFORE_AFTER_UPLOAD: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    };
    return typeColors[type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
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
    } catch (error) {
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
    } catch (error) {
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
    <div className="space-y-10 pt-16">
      {/* Upload Workflow Cards */}
      {uploadWorkflows.length > 0 && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="h-14 w-14 rounded-3xl bg-orange-600/10 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-200/50 dark:border-orange-800/50 shadow-inner">
              <Upload className="h-7 w-7 stroke-[2.5px]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                Upload Automations
              </h2>
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                Drag & drop images to auto-generate posts
              </p>
            </div>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {uploadWorkflows?.map(workflow => (
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
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-4"
      >
        <div className="h-14 w-14 rounded-3xl bg-emerald-600/10 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-200/50 dark:border-emerald-800/50 shadow-inner">
          <Activity className="h-7 w-7 stroke-[2.5px] animate-pulse" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            Active Flows
          </h2>
          <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Commanding <span className="text-blue-600 dark:text-blue-400">{standardWorkflows.filter(w => w.isActive).length} autonomous</span> operations
          </p>
        </div>
      </motion.div>

      <div className="grid gap-10">
        {standardWorkflows?.map((workflow, index) => (
          <motion.div
            key={workflow.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, scale: 1.005 }}
            className="group relative rounded-[3rem] border border-slate-200/60 bg-white/40 backdrop-blur-xl p-10 transition-all duration-500 hover:bg-white/60 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] dark:border-slate-800/60 dark:bg-slate-950/40 dark:hover:bg-slate-950/60 dark:hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 h-64 w-64 bg-linear-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-48 w-48 bg-linear-to-tr from-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10 relative z-10">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tighter">
                    {workflow.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${getTriggerColor(workflow.trigger.type)} shadow-xs`}>
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getTriggerColor(workflow.trigger.type).split(' ')[1].replace('text-', 'bg-')}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${getTriggerColor(workflow.trigger.type).split(' ')[1].replace('text-', 'bg-')}`} />
                      </span>
                      {getTriggerIcon(workflow.trigger.type)}
                      {workflow.trigger.type.replace('_', ' ')}
                    </div>
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xs ${workflow.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900'
                      : 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-500 border-slate-100 dark:border-slate-800'
                      }`}>
                      <span className={`h-2 w-2 rounded-full ${workflow.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {workflow.isActive ? 'OPERATIONAL' : 'PAUSED'}
                    </div>
                  </div>
                </div>

                <p className="text-base font-bold text-slate-500 dark:text-slate-400 mb-10 max-w-3xl leading-relaxed uppercase tracking-tighter">
                  {workflow.description}
                </p>

                <div className="grid lg:grid-cols-3 gap-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-[2.5rem] p-8 border border-slate-100/80 dark:border-slate-800/50 backdrop-blur-sm shadow-inner sm:shadow-none">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 fill-current text-indigo-500" /> EXECUTION PIPELINE
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {workflow.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:scale-105 hover:border-indigo-500/30 hover:shadow-xl group/step">
                          <div className="h-6 w-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600 transition-colors group-hover/step:bg-indigo-600 group-hover/step:text-white">
                            {idx + 1}
                          </div>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center lg:border-l lg:border-slate-200/60 dark:lg:border-slate-800/60 lg:pl-10">
                    <div className="grid grid-cols-2 gap-10">
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Executions</div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums" suppressHydrationWarning>{workflow.runCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Performance</div>
                        <div className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">{workflow.successRate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center lg:border-l lg:border-slate-200/60 dark:lg:border-slate-800/60 lg:pl-10">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 fill-current text-purple-500" /> COLLABORATION
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {workflow.teamMembers.slice(0, 3).map((member, idx) => (
                            <div
                              key={member.id}
                              className="h-8 w-8 rounded-full bg-linear-to-br from-purple-400 to-indigo-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-white"
                              title={member.name || member.email}
                            >
                              {member.image ? (
                                <Image src={member.image} alt={member.name || ''} className="h-full w-full rounded-full object-cover" width={24} height={24} preload sizes="(max-width: 1024px) 100vw, 70vw" fill />
                              ) : (
                                (member.name?.charAt(0) || member.email.charAt(0)).toUpperCase()
                              )}
                            </div>
                          ))}
                          {workflow.teamMembers.length > 3 && (
                            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                              +{workflow.teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          {workflow.teamMembers.length} team member{workflow.teamMembers.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="font-bold" suppressHydrationWarning>{workflow.runCount} Runs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <Activity className="h-4 w-4" />
                          <span className="font-bold">{workflow.isActive ? 'Active' : 'Paused'}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedComments(expandedComments === workflow.id ? null : workflow.id)}
                        className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {workflow.comments?.length || 0} Comments
                        <ChevronRight className={`h-3 w-3 transition-transform ${expandedComments === workflow.id ? 'rotate-90' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {expandedComments === workflow.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800"
                    >
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> DISCUSSION THREAD
                      </div>

                      <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                        {workflow.comments && workflow.comments.length > 0 ? (
                          workflow.comments.map((comment: WorkflowComment, idx: number) => (
                            <motion.div
                              key={comment.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                            >
                              <div className="h-10 w-10 rounded-full bg-linear-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                {comment.author?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-sm text-slate-900 dark:text-white">{comment.author || 'Team Member'}</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400" suppressHydrationWarning>{formatDateShort(comment.createdAt)}</span>
                                  {comment.status && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${comment.status === 'APPROVED'
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                      : comment.status === 'REJECTED'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}
                                    >
                                      {comment.status}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                            <p className="text-sm font-medium">No comments yet</p>
                            <p className="text-xs mt-1">Comments will appear here when team members review workflows</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex gap-3">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                        <button className="px-4 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Comment
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex flex-wrap items-center gap-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span className="flex items-center gap-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs">
                    <Clock className="h-4 w-4 text-indigo-500/60" />
                    Last Execution: <span className="text-slate-800 dark:text-slate-300 ml-1" suppressHydrationWarning>{workflow.lastRunAt ? formatDateLong(workflow.lastRunAt) : 'Ready'}</span>
                  </span>
                  <span className="flex items-center gap-2.5 bg-white/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs">
                    <Calendar className="h-4 w-4 text-blue-500/60" />
                    System Inception: <span className="text-slate-800 dark:text-slate-300 ml-1" suppressHydrationWarning>{formatDateShort(workflow.createdAt)}</span>
                  </span>
                </div>
              </div>

              <div className="flex xl:flex-col items-center gap-4 bg-slate-50/80 dark:bg-slate-900/80 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleRunWorkflow(workflow.id)}
                  disabled={isRunning === workflow.id || !workflow.isActive}
                  className="group/btn relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-2xl shadow-indigo-500/30 transition-all hover:scale-110 active:scale-90 disabled:opacity-30 disabled:grayscale overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  {isRunning === workflow.id ? (
                    <Loader className="h-7 w-7 animate-spin" />
                  ) : (
                      <Play className="h-7 w-7 fill-current transition-transform group-hover/btn:scale-125" />
                  )}
                </button>
                <button
                  onClick={() => handleToggle(workflow.id, workflow.isActive)}
                  disabled={isToggling === workflow.id}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all shadow-xl hover:scale-110 active:scale-90 overflow-hidden ${workflow.isActive
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    }`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
                  {isToggling === workflow.id ? (
                    <Loader className="h-7 w-7 animate-spin" />
                  ) : workflow.isActive ? (
                      <Pause className="h-7 w-7 fill-current" />
                  ) : (
                        <Play className="h-7 w-7 fill-current" />
                  )}
                </button>
                <div className="h-px w-8 xl:w-full xl:h-px bg-slate-200 dark:bg-slate-800 my-2" />
                <button
                  onClick={() => {
                    if (!workflow.id) {
                      toast.error('Workflow ID is missing');
                      return;
                    }
                    window.dispatchEvent(new CustomEvent('edit-workflow', { detail: { workflow } }));
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 transition-all hover:bg-white hover:text-indigo-600 hover:shadow-xl dark:hover:bg-slate-700 dark:hover:text-indigo-400 hover:scale-110 active:scale-90 border border-slate-100 dark:border-slate-700"
                >
                  <Edit className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(workflow.id)}
                  disabled={isDeleting === workflow.id}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-400 transition-all hover:bg-rose-600 hover:text-white hover:shadow-xl hover:shadow-rose-500/20 hover:scale-110 active:scale-90 dark:bg-rose-950/20 dark:text-rose-500 dark:hover:bg-rose-600 dark:hover:text-white border border-rose-100 dark:border-rose-900/30"
                >
                  {isDeleting === workflow.id ? (
                    <Loader className="h-6 w-6 animate-spin" />
                  ) : (
                      <Trash2 className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {standardWorkflows.length === 0 && uploadWorkflows.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-40 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-indigo-500/10 blur-[150px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
            <div className="h-28 w-28 rounded-[2.5rem] bg-white dark:bg-slate-800 flex items-center justify-center mb-10 shadow-3xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative z-10 transition-transform group-hover:rotate-12 group-hover:scale-110">
              <Zap className="h-14 w-14 text-indigo-300 dark:text-indigo-600 stroke-[2.5px]" />
            </div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white relative z-10 tracking-tighter">
              Automation Hub Empty
            </h3>
            <p className="mt-5 text-sm font-bold text-slate-500 dark:text-slate-400 text-center max-w-sm px-10 relative z-10 leading-relaxed uppercase tracking-widest">
              Unlock pure scalability by <span className="text-indigo-600 dark:text-indigo-400">deploying your first autonomous flow</span> to handle the heavy lifting.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-create-workflow'))}
              className="mt-12 group relative inline-flex items-center gap-4 rounded-3xl bg-linear-to-br from-indigo-600 to-blue-700 px-10 py-5 text-xs font-black text-white shadow-2xl shadow-indigo-500/30 transition-all hover:scale-[1.05] active:scale-95 z-10 uppercase tracking-[0.2em] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="h-5 w-5 stroke-[4px]" /> INITIALIZE WORKFLOW
            </button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-[3rem] bg-white p-10 shadow-3xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 shadow-inner">
                  <Trash2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Delete Workflow?</h3>
                <p className="mt-3 text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-tighter">
                  This will <span className="text-rose-600 font-black">permanently delete</span> the automation flow and all its history.
                </p>
              </div>
              <div className="mt-10 flex gap-4">
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="flex-1 rounded-2xl border-2 border-slate-100 py-4 text-sm font-black text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => showConfirmDelete && handleDelete(showConfirmDelete)}
                  disabled={!!isDeleting}
                  className="flex-1 rounded-2xl bg-rose-600 py-4 text-sm font-black text-white shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
