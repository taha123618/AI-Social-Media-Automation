'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaLinkedin, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

const icons: Record<string, any> = {
  TWITTER: FaXTwitter,
  LINKED_IN: FaLinkedin,
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebook,
  YOUTUBE: FaYoutube,
};

export function PostPerformance({ posts }: { posts: any[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900/50 shadow-sm">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Content Performance</h3>
        <p className="text-sm text-slate-500">Deep dive into individual post metrics</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Platform</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Impressions</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Engagement</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Clicks</th>
              <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Posted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {posts.map((post, idx) => {
              const Icon = icons[post.platform] || ExternalLink;
              return (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-8 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{post.title || 'Untitled Content'}</span>
                      <span className="text-[10px] font-medium text-slate-400 mt-0.5">{post.intent}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded flex items-center justify-center bg-slate-50 dark:bg-slate-800">
                        <Icon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{post.platform}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span suppressHydrationWarning className="text-sm font-bold text-slate-900 dark:text-white">{post.metrics.impressions.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span suppressHydrationWarning className="text-sm font-bold text-emerald-600">{(post.metrics.likes + post.metrics.comments).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span suppressHydrationWarning className="text-sm font-bold text-blue-600">{post.metrics.clicks.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-between">
                      <span suppressHydrationWarning className="text-xs font-medium text-slate-500">
                        {new Date(post.postedAt).toLocaleDateString()}
                      </span>
                      {post.url && (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}

            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-slate-400 text-sm">
                  No posts analyzed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
