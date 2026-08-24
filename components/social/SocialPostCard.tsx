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

/**
 * Compact, media-first card for the social feed view
 */
export const SocialPostCard = ({ post, isSelected, onClick, index }: SocialPostCardProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'FACEBOOK': return <FaFacebook className="text-blue-500" />;
      case 'INSTAGRAM': return <FaInstagram className="text-pink-500" />;
      case 'TWITTER': return <FaTwitter className="text-sky-400" />;
      case 'LINKEDIN': return <FaLinkedin className="text-blue-700" />;
      case 'YOUTUBE': return <FaYoutube className="text-red-600" />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SCHEDULED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DRAFT': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'FAILED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-3xl cursor-pointer transition-all border ${
        isSelected 
          ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/30' 
          : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
      } group relative overflow-hidden`}
    >
      <div className="flex items-center space-x-4 relative z-10">
        {/* Media Preview Box */}
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 group-hover:border-white/20 transition-colors">
          {post.mediaUrls?.[0] ? (
            <img src={post.mediaUrls[0]} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-600 opacity-50 group-hover:opacity-100 transition-opacity">
               {post.platform && getPlatformIcon(post.platform) && React.cloneElement(getPlatformIcon(post.platform) as React.ReactElement<any>, { className: 'h-6 w-6' } as any)}
             </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded-md bg-white/5 border border-white/10">
                {post.platform && getPlatformIcon(post.platform) && React.cloneElement(getPlatformIcon(post.platform) as React.ReactElement<any>, { className: 'h-3 w-3' } as any)}
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[100px]">
                {post.accountName}
              </span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-black tracking-tighter self-center ${getStatusStyle(post.status)}`}>
              {post.status}
            </span>
          </div>

          <p className="text-sm text-gray-200 line-clamp-1 mb-2 font-medium leading-tight group-hover:text-white transition-colors">
            {post.content}
          </p>

          <div className="flex items-center space-x-4 text-[11px] text-gray-500 font-bold tabular-nums">
            <div className="flex items-center space-x-1 group-hover:text-pink-400 transition-colors">
              <Heart className="h-3 w-3" />
              <span>{post.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-1 group-hover:text-emerald-400 transition-colors">
              <Eye className="h-3 w-3" />
              <span>{post.reach || 0}</span>
            </div>
            <div className="flex items-center space-x-1 ml-auto text-gray-600">
              {post.scheduledFor ? <Calendar className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              <span>{new Date(post.postedAt || post.scheduledFor).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle select indicator */}
      {isSelected && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" 
        />
      )}
    </motion.div>
  );
};
