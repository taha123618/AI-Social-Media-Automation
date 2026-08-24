'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Share2, Plus, Building } from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Platform {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const platforms: Platform[] = [
  { id: 'FACEBOOK', name: 'Facebook Page', description: 'Connect a new Facebook page', icon: <FaFacebook className="h-5 w-5" />, color: 'bg-blue-600' },
  { id: 'INSTAGRAM', name: 'Instagram', description: 'Connect a new Business Instagram account', icon: <FaInstagram className="h-5 w-5" />, color: 'bg-pink-600' },
  // { id: 'MASTODON', name: 'Mastodon', description: 'Connect a new Mastodon profile', icon: <Share2 className="h-5 w-5" />, color: 'bg-indigo-600' },
  // { id: 'BLUESKY', name: 'Bluesky', description: 'Connect a new Bluesky profile', icon: <Globe className="h-5 w-5" />, color: 'bg-blue-400' },
  { id: 'YOUTUBE', name: 'YouTube', description: 'Connect a new YouTube profile', icon: <FaYoutube className="h-5 w-5" />, color: 'bg-red-600' },
  { id: 'GOOGLE_BUSINESS', name: 'Google Business Profile', description: 'Connect a new Google Business Profile account', icon: <Building className="h-5 w-5" />, color: 'bg-blue-500' },
  // { id: 'PINTEREST', name: 'Pinterest', description: 'Connect a new Pinterest profile', icon: <Share2 className="h-5 w-5" />, color: 'bg-red-700' },
  { id: 'LINKEDIN', name: 'LinkedIn Profile', description: 'Connect a new LinkedIn profile', icon: <FaLinkedin className="h-5 w-5" />, color: 'bg-blue-700' },
  { id: 'LINKEDIN_PAGE', name: 'LinkedIn Page', description: 'Connect a new LinkedIn company page', icon: <FaLinkedin className="h-5 w-5" />, color: 'bg-blue-800' },
  { id: 'TIKTOK', name: 'TikTok', description: 'Connect a new TikTok profile', icon: <Share2 className="h-5 w-5" />, color: 'bg-black' },
];

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string | null;
}

export function AccountModal({ isOpen, onClose, businessId }: AccountModalProps) {
  const handleConnect = (platformId: string) => {
    // Determine the active business ID, giving priority to props then localStorage
    const activeBusinessId = businessId || (typeof window !== 'undefined' ? localStorage.getItem('last_business_id') : null);

    if (!activeBusinessId) {
      toast.error("Business context missing. Please select a business from the switcher.");
      return;
    }

    // Trigger the backend OAuth initiation route
    const authUrl = `/api/social/auth/${platformId}?businessId=${activeBusinessId}`;

    window.location.href = authUrl;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
          >
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Connect Account</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Select a platform to start automating.</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              <div className="grid gap-2">
                {platforms?.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleConnect(platform.id)}
                    className="cursor-pointer group flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left outline-none border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                  >
                    <div className={`${platform.color} h-10 w-10 min-w-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                      {platform.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {platform.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {platform.description}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-all group-hover:rotate-90" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Secure OAuth 2.0 Integration
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
