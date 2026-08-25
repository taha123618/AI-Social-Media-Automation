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
    <div className="rounded-none border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase text-foreground">INDIVIDUAL POST TELEMETRY</h3>
          <p className="text-[10px] font-mono text-muted-foreground">Granular conversion & engagement logs per dispatch</p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
          COUNT: {posts.length} POSTS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CONTENT VECTOR</th>
              <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">NETWORK</th>
              <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">IMPRESSIONS</th>
              <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">ENGAGEMENT</th>
              <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">CLICKS</th>
              <th className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">DISPATCH DATE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => {
              const Icon = icons[post.platform] || ExternalLink;
              return (
                <tr
                  key={post.id}
                  className="hover:bg-secondary/30 transition-none"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground line-clamp-1">{post.title || 'Untitled Content'}</span>
                      <span className="text-[10px] text-primary mt-0.5">{post.intent || 'GENERAL'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-none flex items-center justify-center bg-secondary border border-border">
                        <Icon className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-xs text-foreground uppercase">{post.platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span suppressHydrationWarning className="text-xs font-bold text-foreground">{post.metrics.impressions.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span suppressHydrationWarning className="text-xs font-bold text-primary">{(post.metrics.likes + post.metrics.comments).toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span suppressHydrationWarning className="text-xs font-bold text-foreground">{post.metrics.clicks.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <span suppressHydrationWarning className="text-xs text-muted-foreground">
                        {new Date(post.postedAt).toISOString().split('T')[0]}
                      </span>
                      {post.url && (
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-none hover:bg-secondary text-primary transition-none">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-xs font-mono">
                  NO ANALYZED DISPATCH VECTORS AVAILABLE.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
