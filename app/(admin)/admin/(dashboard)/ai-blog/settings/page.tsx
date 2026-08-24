"use client";

import { useState, useEffect } from "react";
import {
  Save, Loader2, Globe, Shield, Sliders, Palette, Type, Hash,
  AlertTriangle, CheckCircle, RefreshCw,
} from "lucide-react";

const TONE_PRESETS = [
  "PROFESSIONAL", "CONVERSATIONAL", "ACADEMIC", "CASUAL",
  "PERSUASIVE", "STORYTELLING", "HUMOROUS", "AUTHORITATIVE", "INSPIRATIONAL", "TECHNICAL",
];

const LENGTH_PRESETS = [
  { value: "SHORT", label: "Short (500-1000 words)" },
  { value: "MEDIUM", label: "Medium (1000-2500 words)" },
  { value: "LONG", label: "Long (2500-5000 words)" },
  { value: "PILLAR", label: "Pillar (5000-8000 words)" },
];

export default function AIBlogSettings() {
  const [settings, setSettings] = useState({
    enabled: true,
    defaultModel: "google/gemini-2.0-flash-lite-001",
    fallbackModel: "openai/gpt-4o-mini",
    maxGenerationPerDay: 100,
    maxWordsPerArticle: 8000,
    defaultTone: "PROFESSIONAL",
    defaultLength: "MEDIUM",
    enableSeoAnalysis: true,
    enableAiDetectionBypass: true,
    enableAutoSave: true,
    autoSaveInterval: 30,
    moderationEnabled: true,
    maxConcurrentGenerations: 5,
    enableImages: true,
    imageProvider: "unsplash",
    maxImagesPerArticle: 4,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/blog/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  const SettingSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="p-6 rounded-2xl border border-border bg-card/50 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">AI Blog Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your AI blog writer system.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Providers */}
        <SettingSection title="AI Providers" icon={Globe}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Default AI Model</label>
              <input
                type="text"
                value={settings.defaultModel}
                onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Fallback AI Model</label>
              <input
                type="text"
                value={settings.fallbackModel}
                onChange={(e) => setSettings({ ...settings, fallbackModel: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
              />
            </div>
          </div>
        </SettingSection>

        {/* Limits */}
        <SettingSection title="Generation Limits" icon={Shield}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Max Generations/Day</label>
              <input
                type="number"
                value={settings.maxGenerationPerDay}
                onChange={(e) => setSettings({ ...settings, maxGenerationPerDay: Number(e.target.value) })}
                className="w-24 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground text-right"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Max Words/Article</label>
              <input
                type="number"
                value={settings.maxWordsPerArticle}
                onChange={(e) => setSettings({ ...settings, maxWordsPerArticle: Number(e.target.value) })}
                className="w-24 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground text-right"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Max Concurrent Generations</label>
              <input
                type="number"
                value={settings.maxConcurrentGenerations}
                onChange={(e) => setSettings({ ...settings, maxConcurrentGenerations: Number(e.target.value) })}
                className="w-24 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground text-right"
              />
            </div>
          </div>
        </SettingSection>

        {/* Content Defaults */}
        <SettingSection title="Content Defaults" icon={Palette}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Default Tone</label>
              <select
                value={settings.defaultTone}
                onChange={(e) => setSettings({ ...settings, defaultTone: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
              >
                {TONE_PRESETS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Default Article Length</label>
              <select
                value={settings.defaultLength}
                onChange={(e) => setSettings({ ...settings, defaultLength: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
              >
                {LENGTH_PRESETS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </SettingSection>

        {/* Features */}
        <SettingSection title="Feature Toggles" icon={Sliders}>
          <div className="space-y-4">
            {[
              { key: "enableSeoAnalysis", label: "Real-time SEO Analysis" },
              { key: "enableAiDetectionBypass", label: "AI Detection Bypass" },
              { key: "enableAutoSave", label: "Auto-save Drafts" },
              { key: "moderationEnabled", label: "Content Moderation" },
              { key: "enableImages", label: "Enable Blog Images" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <input
                  type="checkbox"
                  checked={(settings as any)[key]}
                  onChange={(e) => setSettings({ ...settings, [key]: e.target.checked })}
                  className="toggle toggle-primary"
                />
              </label>
            ))}
            {settings.enableAutoSave && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Auto-save Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.autoSaveInterval}
                  onChange={(e) => setSettings({ ...settings, autoSaveInterval: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground text-right"
                />
              </div>
            )}
            {settings.enableImages && (
              <>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Max Images per Article</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.maxImagesPerArticle}
                    onChange={(e) => setSettings({ ...settings, maxImagesPerArticle: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground text-right"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Image Provider</label>
                  <select
                    value={settings.imageProvider}
                    onChange={(e) => setSettings({ ...settings, imageProvider: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                  >
                    <option value="unsplash">Unsplash</option>
                    <option value="pexels">Pexels</option>
                    <option value="picsum">Lorem Picsum</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </SettingSection>
      </div>

      {/* Global toggle */}
      <div className="p-6 rounded-2xl border border-border bg-card/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${settings.enabled ? "bg-emerald-400" : "bg-red-400"}`} />
          <div>
            <h3 className="font-bold text-foreground">AI Blog Writer System</h3>
            <p className="text-sm text-muted-foreground">
              {settings.enabled ? "Active and accepting requests" : "Disabled — no generations allowed"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            settings.enabled
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          {settings.enabled ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
}
