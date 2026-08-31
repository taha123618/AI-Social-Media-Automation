export type SlideLayout = 'TITLE' | 'CONTENT' | 'QUOTE' | 'STATISTIC' | 'STEPS' | 'CTA';

export type CarouselTheme =
  | 'DARK_GLASS'
  | 'CYBER_NEON'
  | 'MINIMAL_LIGHT'
  | 'SUNSET_CORAL'
  | 'EMERALD_GROWTH'
  | 'CORPORATE_BLUE';

export type CarouselAspectRatio = '1:1' | '4:5' | '16:9';

export interface CarouselSlide {
  id: string;
  slideNumber: number;
  layout: SlideLayout;
  headline: string;
  subheadline?: string;
  bodyText?: string;
  highlightText?: string;
  bulletPoints?: string[];
  statValue?: string;
  statLabel?: string;
  authorOrAttribution?: string;
  ctaButtonText?: string;
  bgImageUrl?: string;
  iconName?: string;
}

export interface CarouselThemeConfig {
  id: CarouselTheme;
  name: string;
  bgClass: string;
  cardBg: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  accentColor: string;
  accentBg: string;
  badgeBg: string;
  borderColor: string;
}

export const CAROUSEL_THEMES: Record<CarouselTheme, CarouselThemeConfig> = {
  DARK_GLASS: {
    id: 'DARK_GLASS',
    name: 'Dark Glassmorphic',
    bgClass: 'bg-slate-950 text-slate-100',
    cardBg: 'bg-slate-900/80 backdrop-blur-md',
    primaryTextColor: 'text-white',
    secondaryTextColor: 'text-slate-400',
    accentColor: 'text-cyan-400',
    accentBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    badgeBg: 'bg-cyan-950/80 text-cyan-400 border-cyan-800',
    borderColor: 'border-slate-800',
  },
  CYBER_NEON: {
    id: 'CYBER_NEON',
    name: 'Cyber Neon Purple',
    bgClass: 'bg-zinc-950 text-zinc-100',
    cardBg: 'bg-zinc-900/90',
    primaryTextColor: 'text-white',
    secondaryTextColor: 'text-zinc-400',
    accentColor: 'text-fuchsia-400',
    accentBg: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    badgeBg: 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-800',
    borderColor: 'border-fuchsia-900/40',
  },
  MINIMAL_LIGHT: {
    id: 'MINIMAL_LIGHT',
    name: 'Minimal Clean Light',
    bgClass: 'bg-slate-50 text-slate-900',
    cardBg: 'bg-white shadow-sm',
    primaryTextColor: 'text-slate-900',
    secondaryTextColor: 'text-slate-600',
    accentColor: 'text-indigo-600',
    accentBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    borderColor: 'border-slate-200',
  },
  SUNSET_CORAL: {
    id: 'SUNSET_CORAL',
    name: 'Sunset Orange & Coral',
    bgClass: 'bg-stone-950 text-stone-100',
    cardBg: 'bg-stone-900/90',
    primaryTextColor: 'text-white',
    secondaryTextColor: 'text-stone-300',
    accentColor: 'text-orange-400',
    accentBg: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    badgeBg: 'bg-orange-950/80 text-orange-400 border-orange-800',
    borderColor: 'border-orange-900/30',
  },
  EMERALD_GROWTH: {
    id: 'EMERALD_GROWTH',
    name: 'Emerald Growth',
    bgClass: 'bg-neutral-950 text-neutral-100',
    cardBg: 'bg-neutral-900/90',
    primaryTextColor: 'text-white',
    secondaryTextColor: 'text-neutral-400',
    accentColor: 'text-emerald-400',
    accentBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    badgeBg: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    borderColor: 'border-emerald-900/30',
  },
  CORPORATE_BLUE: {
    id: 'CORPORATE_BLUE',
    name: 'Executive Blue',
    bgClass: 'bg-slate-900 text-white',
    cardBg: 'bg-slate-800/90',
    primaryTextColor: 'text-white',
    secondaryTextColor: 'text-slate-300',
    accentColor: 'text-blue-400',
    accentBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    badgeBg: 'bg-blue-950/80 text-blue-400 border-blue-800',
    borderColor: 'border-blue-900/30',
  },
};

export interface CarouselDeck {
  id: string;
  businessId: string;
  title: string;
  topic: string;
  targetPlatform: 'LINKEDIN' | 'INSTAGRAM' | 'TWITTER';
  aspectRatio: CarouselAspectRatio;
  theme: CarouselTheme;
  slides: CarouselSlide[];
  caption: string;
  hashtags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCarouselInput {
  businessId: string;
  topic: string;
  sourceText?: string;
  slideCount?: number;
  targetPlatform?: 'LINKEDIN' | 'INSTAGRAM' | 'TWITTER';
  aspectRatio?: CarouselAspectRatio;
  theme?: CarouselTheme;
  brandVoiceTone?: string;
}
