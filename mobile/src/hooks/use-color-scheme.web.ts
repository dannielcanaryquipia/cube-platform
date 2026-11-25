import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useThemeMode } from '@/lib/themeMode';

const emptySub = () => () => {};

export function useColorScheme() {
  const hydrated = useSyncExternalStore(emptySub, () => true, () => false);
  const system = useRNColorScheme();
  const mode = useThemeMode();
  const resolved = mode === 'system' ? (system ?? 'light') : mode;
  return hydrated ? resolved : 'light';
}
