import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { Clock, Eye, Heart, Calendar } from 'lucide-react';

interface SocialPostCardProps {
  post: any;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export const SocialPostCard = ({ post, isSelected, onClick, index }: SocialPostCardProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <FaFacebook className="text-blue-500" />;
      case 'INSTAGRAM': return <FaInstagram className="text-pink-500" />;
      case 'TWITTER': return <FaTwitter className="text-sky-400" />;
      case 'LINKEDIN': return <FaLinkedin className="text-blue-600" />;
      case 'YOUTUBE': return <FaYoutube className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'SCHEDULED': return 'bg-primary/10 text-primary border-primary/20';
      case 'DRAFT': return 'bg-muted text-muted-foreground border-border';
      case 'FAILED': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
        isSelected 
          ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/30' 
          : 'bg-card border-border/80 hover:border-primary/40 hover:bg-card'
      } group relative overflow-hidden text-left`}
    >
      <div className="flex items-center space-x-3 relative z-10">
        {/* Media Preview Box */}
        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-secondary border border-border/60">
          {post.mediaUrls?.[0] ? (
            <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {post.platform && getPlatformIcon(post.platform) && React.cloneElement(getPlatformIcon(post.platform) as React.ReactElement<any>, { className: 'h-5 w-5' } as any)}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider border ${getStatusStyle(post.status)}`}>
              {post.status}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : 'Draft'}</span>
            </div>
          </div>

          <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {post.content || 'Untitled Draft'}
          </p>

          <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3 text-primary" />
              {(post.metrics?.reach || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-destructive" />
              {(post.metrics?.likes || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
