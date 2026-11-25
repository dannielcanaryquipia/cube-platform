import { Ionicons } from '@expo/vector-icons';
import { type Href } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { goBack } from '@/lib/nav';

/** Native-feeling stack back that always calls `router.back()` when possible. */
export function HeaderBack({ fallback = '/' }: { fallback?: Href }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      onPress={() => goBack(fallback)}
      style={({ pressed }) => ({
        paddingHorizontal: Platform.OS === 'ios' ? 6 : 12,
        marginLeft: Platform.OS === 'android' ? 4 : 0,
        opacity: pressed ? 0.55 : 1,
        justifyContent: 'center',
        minWidth: 44,
        minHeight: 44,
      })}
    >
      <Ionicons
        name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
        size={Platform.OS === 'ios' ? 28 : 24}
        color={c.ink}
      />
    </Pressable>
  );
}
