"use client";

import { useState, useEffect } from "react";
import {
  Plus, Loader2, FileText, Trash2, Edit3, Globe,
  Search, Sparkles,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  isGlobal: boolean;
  createdAt: string;
  _count?: { articles?: number };
}

export default function AIBlogTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "", category: "" });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const res = await fetch("/api/admin/blog/templates");
    const json = await res.json();
    if (json.templates) setTemplates(json.templates);
    setLoading(false);
  };

  const handleCreate = async () => {
    const res = await fetch("/api/admin/blog/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTemplate),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewTemplate({ name: "", description: "", category: "" });
      fetchTemplates();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/blog/templates?id=${id}`, { method: "DELETE" });
    fetchTemplates();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Templates</h1>
          <p className="text-muted-foreground mt-1">Manage AI blog writing templates.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      {showCreate && (
        <div className="p-6 rounded-2xl border border-border bg-card/50 space-y-4">
          <h3 className="font-bold text-foreground">Create Template</h3>
          <input
            placeholder="Template name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground"
          />
          <input
            placeholder="Description (optional)"
            value={newTemplate.description}
            onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground"
          />
          <input
            placeholder="Category (optional)"
            value={newTemplate.category}
            onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground"
          />
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 rounded-xl bg-muted text-foreground text-sm font-bold hover:bg-accent transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border bg-card/30 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground">No templates yet</h3>
          <p className="text-muted-foreground mt-2">Create your first template to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="group p-6 rounded-2xl border border-border bg-card/50 hover:bg-card/80 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${template.isGlobal ? "bg-blue-500/10" : "bg-muted"}`}>
                  {template.isGlobal
                    ? <Globe className="h-4 w-4 text-blue-400" />
                    : <FileText className="h-4 w-4 text-muted-foreground" />
                  }
                </div>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
              <h3 className="font-bold text-foreground mb-1">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.description}</p>
              )}
              <div className="flex items-center gap-2 mt-auto">
                {template.category && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {template.category}
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(template.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
