'use client';

import React, { useState } from 'react';
import { 
  X, Tag, Plus, Search, Check, 
  Trash2, ChevronRight, Hash
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
}

const SUGGESTED_LABELS = [
  { id: 'marketing', label: 'Marketing', color: 'bg-blue-100 text-blue-700' },
  { id: 'sales', label: 'Sales', color: 'bg-green-100 text-green-700' },
  { id: 'branding', label: 'Branding', color: 'bg-purple-100 text-purple-700' },
  { id: 'event', label: 'Event', color: 'bg-orange-100 text-orange-700' },
  { id: 'announcement', label: 'Announcement', color: 'bg-red-100 text-red-700' },
  { id: 'tutorial', label: 'Tutorial', color: 'bg-cyan-100 text-cyan-700' },
];

export function LabelsModal({
  isOpen,
  onClose,
  selectedLabels,
  onLabelsChange
}: LabelsModalProps) {
  const [search, setSearch] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      onLabelsChange(selectedLabels.filter(l => l !== label));
    } else {
      onLabelsChange([...selectedLabels, label]);
    }
  };

  const handleCreateLabel = () => {
    if (newLabel.trim() && !selectedLabels.includes(newLabel.trim())) {
      onLabelsChange([...selectedLabels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
        <DialogHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Tag className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Post Labels</DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search or create labels..." 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-medium"
            />
            {newLabel.trim() && (
                <button 
                    onClick={handleCreateLabel}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg shadow-sm"
                >
                    <Plus className="h-3 w-3" />
                </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Suggested Labels</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_LABELS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleLabel(item.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    selectedLabels.includes(item.label)
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                  {selectedLabels.includes(item.label) && <Check className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>

          {selectedLabels.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Applied to this post</div>
                    <button 
                        onClick={() => onLabelsChange([])}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                        Clear All
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedLabels.map((label) => (
                        <Badge 
                            key={label}
                            variant="secondary"
                            className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 px-3 py-1 rounded-lg flex items-center gap-2"
                        >
                            {label}
                            <button onClick={() => toggleLabel(label)}>
                                <X className="h-3 w-3 hover:text-red-500" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800 flex justify-end">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 font-bold">
                Done
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
