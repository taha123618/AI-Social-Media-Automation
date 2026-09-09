import React from 'react';
import { ColorValue } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import {
  Sparkles as LucideSparkles,
  Calendar as LucideCalendar,
  Inbox as LucideInbox,
  TrendingUp as LucideTrendingUp,
  BarChart3 as LucideBarChart3,
  Layers as LucideLayers,
  Mic as LucideMic,
  ShieldCheck as LucideShieldCheck,
  Bot as LucideBot,
  Check as LucideCheck,
  X as LucideX,
  ChevronRight as LucideChevronRight,
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  ChevronUp as LucideChevronUp,
  Plus as LucidePlus,
  RotateCw as LucideRotateCw,
  Trash2 as LucideTrash2,
  Edit3 as LucideEdit3,
  Copy as LucideCopy,
  Send as LucideSend,
  Lock as LucideLock,
  Key as LucideKey,
  Webhook as LucideWebhook,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  Search as LucideSearch,
  Settings as LucideSettings,
  User as LucideUser,
  Users as LucideUsers,
  Building2 as LucideBuilding2,
  CreditCard as LucideCreditCard,
  Image as LucideImage,
  Video as LucideVideo,
  Sun as LucideSun,
  Moon as LucideMoon,
  Monitor as LucideMonitor,
  LogOut as LucideLogOut,
  Menu as LucideMenu,
  LayoutGrid as LucideLayoutGrid,
  Folder as LucideFolder,
  Compass as LucideCompass,
  FileText as LucideFileText,
  Target as LucideTarget,
  MapPin as LucideMapPin,
  Sliders as LucideSliders,
  Mail as LucideMail,
  Radio as LucideRadio,
  Star as LucideStar,
  Swords as LucideSwords,
  Flame as LucideFlame,
  CheckCircle2 as LucideCheckCircle2,
  AlertCircle as LucideAlertCircle,
  Clock as LucideClock,
  Share2 as LucideShare2,
  Activity as LucideActivity,
  Zap as LucideZap,
  HelpCircle as LucideHelpCircle,
  ArrowRight as LucideArrowRight,
  ArrowLeft as LucideArrowLeft,
  Filter as LucideFilter,
  MoreHorizontal as LucideMoreHorizontal,
  MoreVertical as LucideMoreVertical,
  WifiOff as LucideWifiOff,
  Bookmark as LucideBookmark,
  MessageCircle as LucideMessageCircle,
  MessageSquare as LucideMessageSquare,
  Volume2 as LucideVolume2,
  Play as LucidePlay,
  Pause as LucidePause,
  ExternalLink as LucideExternalLink,
  Heart as LucideHeart,
  Repeat as LucideRepeat,
  Gauge as LucideGauge,
  Workflow as LucideWorkflow,
  ArrowUpRight as LucideArrowUpRight,
  LayoutDashboard as LucideLayoutDashboard,
  LucideIcon,
} from 'lucide-react-native';

export interface IconProps {
  size?: number;
  color?: ColorValue | string | any;
  strokeWidth?: number;
  style?: any;
}

function wrapLucide(IconComponent: LucideIcon, defaultColor = '#7C3AED') {
  return function WrappedLucideIcon({
    size = 24,
    color = defaultColor,
    strokeWidth = 2,
    style,
  }: IconProps) {
    const stringColor = typeof color === 'string' ? color : (color ? String(color) : defaultColor);
    return (
      <IconComponent
        size={size}
        color={stringColor}
        strokeWidth={strokeWidth}
        style={style}
      />
    );
  };
}

// Brand-specific Social Platform Vectors
const TwitterIcon = ({ size = 20, color = '#1DA1F2', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </Svg>
);

const LinkedInIcon = ({ size = 20, color = '#0A66C2', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <Path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </Svg>
);

const FacebookIcon = ({ size = 20, color = '#1877F2', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </Svg>
);

const InstagramIcon = ({ size = 20, color = '#E4405F', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <Circle cx="17.5" cy="6.5" r="1.5" fill={color} stroke="none" />
  </Svg>
);

const TikTokIcon = ({ size = 20, color = '#000000', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <Path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.5 2.73 1.17-.03 2.25-.66 2.77-1.69.21-.44.3-1.03.3-1.64l.01-14.43z" />
  </Svg>
);

const YouTubeIcon = ({ size = 20, color = '#FF0000', style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <Path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </Svg>
);

export const Icons = {
  // Navigation Tabs & Core
  Feed: wrapLucide(LucideLayoutGrid),
  Sparkles: wrapLucide(LucideSparkles),
  Calendar: wrapLucide(LucideCalendar),
  Inbox: wrapLucide(LucideInbox),
  Analytics: wrapLucide(LucideBarChart3),
  Menu: wrapLucide(LucideMenu),
  Grid: wrapLucide(LucideLayoutGrid),
  Folder: wrapLucide(LucideFolder),
  Compass: wrapLucide(LucideCompass),
  FileText: wrapLucide(LucideFileText),
  Target: wrapLucide(LucideTarget),
  MapPin: wrapLucide(LucideMapPin),
  Sliders: wrapLucide(LucideSliders),
  Mail: wrapLucide(LucideMail),
  Radio: wrapLucide(LucideRadio),
  Star: wrapLucide(LucideStar),
  Swords: wrapLucide(LucideSwords),
  Flame: wrapLucide(LucideFlame),
  CheckCircle: wrapLucide(LucideCheckCircle2, '#10B981'),
  AlertCircle: wrapLucide(LucideAlertCircle, '#EF4444'),
  Clock: wrapLucide(LucideClock),
  BarChart: wrapLucide(LucideBarChart3),
  TrendingUp: wrapLucide(LucideTrendingUp),
  Share2: wrapLucide(LucideShare2),
  Activity: wrapLucide(LucideActivity),
  Zap: wrapLucide(LucideZap),
  HelpCircle: wrapLucide(LucideHelpCircle),
  ArrowRight: wrapLucide(LucideArrowRight),
  ArrowLeft: wrapLucide(LucideArrowLeft),
  Filter: wrapLucide(LucideFilter),
  MoreHorizontal: wrapLucide(LucideMoreHorizontal),
  MoreVertical: wrapLucide(LucideMoreVertical),
  WifiOff: wrapLucide(LucideWifiOff),
  Bookmark: wrapLucide(LucideBookmark),
  MessageCircle: wrapLucide(LucideMessageCircle),
  MessageSquare: wrapLucide(LucideMessageSquare),
  Volume2: wrapLucide(LucideVolume2),
  Play: wrapLucide(LucidePlay),
  Pause: wrapLucide(LucidePause),
  ExternalLink: wrapLucide(LucideExternalLink),
  Heart: wrapLucide(LucideHeart, '#EF4444'),
  Repeat: wrapLucide(LucideRepeat),
  Gauge: wrapLucide(LucideGauge),
  Workflow: wrapLucide(LucideWorkflow),
  ArrowUpRight: wrapLucide(LucideArrowUpRight),
  Dashboard: wrapLucide(LucideLayoutDashboard),

  // Studio & AI Agents
  Layers: wrapLucide(LucideLayers),
  Mic: wrapLucide(LucideMic),
  ShieldCheck: wrapLucide(LucideShieldCheck, '#10B981'),
  Bot: wrapLucide(LucideBot),
  Image: wrapLucide(LucideImage),
  Video: wrapLucide(LucideVideo),

  // UI Actions & Common
  Check: wrapLucide(LucideCheck, '#10B981'),
  Close: wrapLucide(LucideX, '#71717A'),
  ChevronRight: wrapLucide(LucideChevronRight, '#71717A'),
  ChevronDown: wrapLucide(LucideChevronDown, '#71717A'),
  ChevronLeft: wrapLucide(LucideChevronLeft, '#71717A'),
  ChevronUp: wrapLucide(LucideChevronUp, '#71717A'),
  Plus: wrapLucide(LucidePlus, '#FFFFFF'),
  Refresh: wrapLucide(LucideRotateCw),
  Trash: wrapLucide(LucideTrash2, '#EF4444'),
  Edit: wrapLucide(LucideEdit3),
  Copy: wrapLucide(LucideCopy),
  Send: wrapLucide(LucideSend),
  Lock: wrapLucide(LucideLock),
  Key: wrapLucide(LucideKey),
  Webhook: wrapLucide(LucideWebhook),
  Eye: wrapLucide(LucideEye),
  EyeOff: wrapLucide(LucideEyeOff),
  Search: wrapLucide(LucideSearch),
  Settings: wrapLucide(LucideSettings),
  User: wrapLucide(LucideUser),
  Users: wrapLucide(LucideUsers),
  Building: wrapLucide(LucideBuilding2),
  CreditCard: wrapLucide(LucideCreditCard),
  Sun: wrapLucide(LucideSun, '#F59E0B'),
  Moon: wrapLucide(LucideMoon, '#6366F1'),
  Monitor: wrapLucide(LucideMonitor, '#71717A'),
  LogOut: wrapLucide(LucideLogOut, '#EF4444'),

  // Social Platform Brand Badges
  Twitter: TwitterIcon,
  LinkedIn: LinkedInIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
  YouTube: YouTubeIcon,
};

// Re-export raw lucide-react-native icons for direct imports
export {
  LucideSparkles as SparklesIcon,
  LucideCalendar as CalendarIcon,
  LucideInbox as InboxIcon,
  LucideBarChart3 as BarChartIcon,
  LucideLayers as LayersIcon,
  LucideMic as MicIcon,
  LucideShieldCheck as ShieldCheckIcon,
  LucideBot as BotIcon,
  LucideCheck as CheckIcon,
  LucideX as XIcon,
  LucideChevronRight as ChevronRightIcon,
  LucideChevronDown as ChevronDownIcon,
  LucidePlus as PlusIcon,
  LucideRotateCw as RefreshIcon,
  LucideTrash2 as TrashIcon,
  LucideEdit3 as EditIcon,
  LucideCopy as CopyIcon,
  LucideSend as SendIcon,
  LucideLock as LockIcon,
  LucideKey as KeyIcon,
  LucideWebhook as WebhookIcon,
  LucideEye as EyeIcon,
  LucideEyeOff as EyeOffIcon,
  LucideSearch as SearchIcon,
  LucideSettings as SettingsIcon,
  LucideUser as UserIcon,
  LucideUsers as UsersIcon,
  LucideBuilding2 as BuildingIcon,
  LucideCreditCard as CreditCardIcon,
  LucideImage as ImageIcon,
  LucideVideo as VideoIcon,
  LucideSun as SunIcon,
  LucideMoon as MoonIcon,
  LucideMonitor as MonitorIcon,
  LucideLogOut as LogOutIcon,
  LucideMenu as MenuIcon,
  LucideLayoutGrid as GridIcon,
  LucideFolder as FolderIcon,
  LucideCompass as CompassIcon,
  LucideFileText as FileTextIcon,
  LucideTarget as TargetIcon,
  LucideMapPin as MapPinIcon,
  LucideSliders as SlidersIcon,
  LucideMail as MailIcon,
  LucideRadio as RadioIcon,
  LucideStar as StarIcon,
  LucideSwords as SwordsIcon,
  LucideFlame as FlameIcon,
  LucideCheckCircle2 as CheckCircleIcon,
  LucideAlertCircle as AlertCircleIcon,
  LucideClock as ClockIcon,
  LucideShare2 as ShareIcon,
  LucideActivity as ActivityIcon,
  LucideZap as ZapIcon,
  LucideHelpCircle as HelpCircleIcon,
  LucideArrowRight as ArrowRightIcon,
  LucideArrowLeft as ArrowLeftIcon,
  LucideFilter as FilterIcon,
  LucideMoreHorizontal as MoreHorizontalIcon,
  LucideMoreVertical as MoreVerticalIcon,
  LucideWifiOff as WifiOffIcon,
  LucideBookmark as BookmarkIcon,
  LucideMessageCircle as MessageCircleIcon,
  LucideMessageSquare as MessageSquareIcon,
  LucideVolume2 as Volume2Icon,
  LucidePlay as PlayIcon,
  LucidePause as PauseIcon,
  LucideExternalLink as ExternalLinkIcon,
  LucideHeart as HeartIcon,
  LucideRepeat as RepeatIcon,
};
