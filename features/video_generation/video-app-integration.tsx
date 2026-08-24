// Video Feature Integration Guide
//
// This file demonstrates how to integrate all the video feature components
// into a cohesive application experience.
"use client";
import React from 'react';
import { VideoAnalyticsDashboard } from './components/video-analytics-dashboard';
import { VideoManagementDashboard } from './components/video-management-dashboard';
import { VideoAdvancedTools } from './components/video-advanced-tools';
import { VideoGenerator } from './components/video-generator';
import { SystemMonitor } from './components/system-monitor';
import VideoGallery from '@/app/(user)/gallery/_components/video-gallery';

interface VideoAppProps {
  businessId: string;
  userRole: 'admin' | 'user';
}

export function VideoApp({ businessId, userRole }: VideoAppProps) {
  const [activeTab, setActiveTab] = React.useState('generate');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'generate':
        return <VideoGenerator businessId={businessId} />;
      case 'gallery':
        return <VideoGallery />;
      case 'analytics':
        return <VideoAnalyticsDashboard businessId={businessId} />;
      case 'manage':
        return <VideoManagementDashboard businessId={businessId} />;
      case 'tools':
        return <VideoAdvancedTools businessId={businessId} />;
      case 'system':
        return userRole === 'admin' ? <SystemMonitor businessId={businessId} /> : null;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: '🎬' },
    { id: 'gallery', label: 'Gallery', icon: '🖼️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'manage', label: 'Manage', icon: '⚙️' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
  ];

  if (userRole === 'admin') {
    tabs.push({ id: 'system', label: 'System', icon: '🖥️' });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Video Platform</h1>
              <p className="text-muted-foreground">AI-powered video generation and management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Business ID: {businessId}
              </div>
              <div className="text-sm text-muted-foreground">
                Role: {userRole}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

// Usage Example:
// <VideoApp businessId="your-business-id" userRole="admin" />

export default VideoApp;
