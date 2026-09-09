import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Returns the currently active effective color scheme ('light' | 'dark').
 * Reacts dynamically to user-selected theme mode in useAuthStore ('system' | 'light' | 'dark')
 * as well as OS-level system theme changes.
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  const themeMode = useAuthStore((state) => state.themeMode);

  if (themeMode === 'light') return 'light';
  if (themeMode === 'dark') return 'dark';

  // For 'system' mode
  return systemScheme === 'dark' ? 'dark' : 'light';
}
