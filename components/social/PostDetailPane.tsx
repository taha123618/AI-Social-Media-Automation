import React from 'react';
import { motion } from 'framer-motion';
import { FaEllipsisV } from 'react-icons/fa';
import { Sparkles, BarChart3, Users, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialPlatformPreview } from '@/components/social/SocialPlatformPreview';
import { PostMetricCard } from '@/components/social/PostMetricCard';
import { Platform } from '@/app/generated/prisma/enums';

interface PostDetailPaneProps {
  post: any;
}

/**
 * Reusable detail pane for the social media management hub
 */
export const PostDetailPane = ({ post }: PostDetailPaneProps) => {
  if (!post) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 border-dashed flex items-center justify-center mb-6">
          <Zap className="h-10 w-10 text-gray-800" />
        </div>
        <h3 className="text-xl font-black tracking-tighter mb-2 text-gray-200">Select a Blueprint</h3>
        <p className="text-gray-600 text-sm font-medium">Capture a deep dive into any campaign by selecting it from the central frequency.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 space-y-10"
    >
      {/* Hero Detail Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Post Blueprint</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-white/5 border-white/10 hover:bg-white/10">
              <FaEllipsisV className="h-3 w-3 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 shadow-2xl">
            <p className="text-lg leading-relaxed font-medium text-gray-200 italic">
              "{post.content}"
            </p>
          </div>

          <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gray-800 border border-white/10 overflow-hidden">
              {post.accountAvatar ? (
                <img src={post.accountAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-gray-600">
                  {post.accountName.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <p className="font-black text-sm">{post.accountName}</p>
              <p className="text-xs text-blue-500 font-bold tracking-tight uppercase">{post.platform} Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Engine */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Performance Hub</span>
          <div className="flex items-center space-x-1 text-emerald-500">
            <Sparkles className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase">Live Data</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PostMetricCard
            label="Impressions"
            value={post.impressions || 0}
            icon={Users}
            color="blue"
            delay={0.1}
          />
          <PostMetricCard
            label="Post Reach"
            value={post.reach || 0}
            icon={BarChart3}
            color="green"
            delay={0.2}
          />
          <PostMetricCard
            label="Engagement"
            value={(post.likes || 0) + (post.comments || 0)}
            icon={Heart}
            color="pink"
            delay={0.3}
          />
          <PostMetricCard
            label="Profile Visits"
            value={post.profileVisits || 0}
            icon={Sparkles}
            color="purple"
            delay={0.4}
          />
        </div>
      </div>

      {/* Live Mockup */}
      <div className="space-y-6">
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Native Canvas</span>
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative rounded-[2.5rem] border-8 border-white/10 shadow-3xl overflow-hidden bg-white dark:bg-black">
            <SocialPlatformPreview
              platform={post.platform as Platform}
              content={post.content}
              mediaUrls={post.mediaUrls || []}
              accountName={post.accountName}
              accountImage={post.accountAvatar}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="pt-4 grid grid-cols-2 gap-3 pb-8">
        <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 h-12 font-bold transition-all">
          Download Report
        </Button>
        <Button className="rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 font-bold shadow-lg shadow-blue-600/20 transition-all">
          Promote Post
        </Button>
      </div>
    </motion.div>
  );
};
