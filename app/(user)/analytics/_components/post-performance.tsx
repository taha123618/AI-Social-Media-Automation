'use client';

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
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
      <div className="p-5 border-b border-border/70 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">Content Performance</h3>
          <p className="text-xs text-muted-foreground">Detailed engagement and conversion telemetry per post</p>
        </div>
        <span className="text-xs font-mono font-medium text-muted-foreground">
          {posts.length} Posts Analyzed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/70 text-xs font-semibold text-muted-foreground uppercase">
              <th className="px-5 py-3">Content Vector</th>
              <th className="px-5 py-3">Channel</th>
              <th className="px-5 py-3 text-center">Impressions</th>
              <th className="px-5 py-3 text-center">Engagement</th>
              <th className="px-5 py-3 text-center">Clicks</th>
              <th className="px-5 py-3">Published Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {posts.map((post) => {
              const Icon = icons[post.platform] || ExternalLink;
              return (
                <tr
                  key={post.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground line-clamp-1">{post.title || 'Untitled Campaign Vector'}</span>
                      <span className="text-[11px] text-muted-foreground mt-0.5">{post.intent || 'GENERAL'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md flex items-center justify-center bg-secondary">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground uppercase">{post.platform}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center font-mono">
                    <span suppressHydrationWarning className="font-semibold text-foreground">{post.metrics.impressions.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3 text-center font-mono">
                    <span suppressHydrationWarning className="font-semibold text-primary">{(post.metrics.likes + post.metrics.comments).toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3 text-center font-mono">
                    <span suppressHydrationWarning className="font-semibold text-accent">{post.metrics.clicks.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                      <span suppressHydrationWarning>
                        {new Date(post.postedAt).toISOString().split('T')[0]}
                      </span>
                      {post.url && (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-md hover:bg-muted text-primary transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground text-xs">
                  No post telemetry data recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
