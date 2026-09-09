import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#7C3AED',
    primaryLight: '#EDE9FE',
    primaryGlow: 'rgba(124, 58, 237, 0.15)',
    secondary: '#6366F1',
    text: '#09090B',
    textSecondary: '#71717A',
    textMuted: '#A1A1AA',
    background: '#FFFFFF',
    backgroundElement: '#F4F4F5',
    backgroundSelected: '#E4E4E7',
    card: '#FFFFFF',
    cardElevated: '#F4F4F5',
    border: '#E4E4E7',
    borderFocus: '#7C3AED',
    borderSubtle: '#F4F4F5',
    // Status colors
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    destructive: '#EF4444',
    destructiveBg: '#FEF2F2',
    info: '#3B82F6',
    infoBg: '#EFF6FF',
    // Badges & overlays
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(228, 228, 231, 0.6)',
  },
  dark: {
    primary: '#8B5CF6', //oklch(0.65 0.22 275) #8B5CF6
    primaryLight: '#311F5A',
    primaryGlow: 'rgba(139, 92, 246, 0.25)',
    secondary: '#818CF8',
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    background: '#09090B',
    backgroundElement: '#18181B',
    backgroundSelected: '#27272A',
    card: '#121215',
    cardElevated: '#18181B',
    border: '#27272A',
    borderFocus: '#8B5CF6',
    borderSubtle: '#18181B',
    // Status colors
    success: '#10B981',
    successBg: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    destructive: '#EF4444',
    destructiveBg: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.15)',
    // Badges & overlays
    glassBg: 'rgba(18, 18, 21, 0.85)',
    glassBorder: 'rgba(39, 39, 42, 0.7)',
  },
} as const;

export const PlatformColors = {
  instagram: '#E1306C',
  linkedin: '#0A66C2',
  twitter: '#1DA1F2',
  x: '#000000',
  tiktok: '#FE2C55',
  youtube: '#FF0000',
  facebook: '#1877F2',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'ui-serif',
    rounded: 'System',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
    serif: 'var(--font-serif, Georgia, serif)',
    rounded: 'var(--font-rounded, system-ui)',
    mono: 'var(--font-mono, ui-monospace, monospace)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 64,
} as const;

export const Radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 88, android: 72 }) ?? 72;
export const MaxContentWidth = 800;
