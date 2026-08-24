import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaTiktok } from 'react-icons/fa';
import { SiGooglegemini } from 'react-icons/si';
import { cn } from '@/lib/utils';
import { Platform } from '@/app/generated/prisma/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SocialAccount {
  id: string;
  name: string;
  platform: Platform | string;
  avatar?: string;
}

interface SocialAccountIconsProps {
  accounts: SocialAccount[];
}

const platformIcons: Record<string, React.ReactNode> = {
  FACEBOOK: <FaFacebook className="text-blue-600" />,
  INSTAGRAM: <FaInstagram className="text-pink-600" />,
  TWITTER: <FaTwitter className="text-sky-400" />,
  LINKEDIN: <FaLinkedin className="text-blue-700" />,
  YOUTUBE: <FaYoutube className="text-red-600" />,
  TIKTOK: <FaTiktok className="text-black dark:text-white" />,
  GOOGLE_BUSINESS: <SiGooglegemini className="text-blue-500" />,
};

const SingleAccountIcon: React.FC<{ account: SocialAccount; index: number; total: number }> = ({ account, index, total }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <Tooltip key={account.id}>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative w-15 h-15 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center transition-all cursor-help group/avatar hover:z-30 hover:scale-110",
            "border-2 border-white dark:border-zinc-900 shadow-md",
            "ring-2 ring-transparent group-hover/avatar:ring-blue-500/30"
          )}
          style={{ zIndex: total - index }}
        >
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-800 border-[1.5px] border-blue-500/20">
            {account.avatar && !imgError ? (
              <img
                src={`/api/social/proxy-image?url=${encodeURIComponent(account.avatar)}`}
                alt={account.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-[10px] font-bold text-slate-400">
                {platformIcons[account.platform as string] || account.name[0]}
              </div>
            )}
          </div>

          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-[9px] border-[1.5px] border-white dark:border-zinc-900 z-20 shadow-sm">
            {platformIcons[account.platform as string]}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="rounded-xl p-3 border-none bg-zinc-900 text-white shadow-2xl">
        <p className="text-xs font-bold">{account.name}</p>
        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-0.5">{account.platform}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const SocialAccountIcons: React.FC<SocialAccountIconsProps> = ({ accounts }) => {
  if (!accounts || accounts.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex -space-x-3 items-center py-1">
        {accounts?.map((account, index) => (
          <SingleAccountIcon
            key={account.id}
            account={account}
            index={index}
            total={accounts.length}
          />
        ))}
      </div>
    </TooltipProvider>
  );
};
