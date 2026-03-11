/**
 * Theme hook wrapper that provides isDark boolean
 */

import { useTheme as useThemeContext } from '@/lib/theme-provider';

export function useTheme() {
  const context = useThemeContext();
  
  return {
    ...context,
    isDark: context.theme === 'dark',
  };
}
