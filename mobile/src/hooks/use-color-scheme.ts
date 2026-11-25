import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeMode } from '@/lib/themeMode';

export function useColorScheme() {
  const system = useRNColorScheme();
  const mode = useThemeMode();
  if (mode === 'system') return system ?? 'light';
  return mode;
}
