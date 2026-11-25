import { Children, type ReactNode } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';

import { Radius, Spacing, shadow } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';

/** Website `Grid columns={{ minWidth, max }}` bento — 1 col on phones, up to `max` on wide screens. */
export function Bento({
  children,
  minWidth = 340,
  max = 2,
  gap = Spacing.three,
  style,
}: {
  children: ReactNode;
  minWidth?: number;
  max?: number;
  gap?: number;
  style?: ViewStyle;
}) {
  const { columns, contentWidth } = useLayout();
  const cols = columns(minWidth, max, gap);
  const items = Children.toArray(children);
  if (cols <= 1 || items.length <= 1) {
    return <View style={[{ gap }, style]}>{items}</View>;
  }
  const tile = Math.floor((contentWidth - gap * (cols - 1)) / cols);
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap, alignItems: 'stretch', width: '100%', maxWidth: '100%' }, style]}>
      {items.map((child, i) => (
        <View key={i} style={{ width: tile, maxWidth: '100%', minWidth: 0, flexGrow: 1 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

/** Website `.bento-cell`. */
export function BentoCell({ children, style }: { children?: ReactNode; style?: ViewStyle }) {
  const c = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: Radius.md,
          borderCurve: 'continuous',
          padding: 18,
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          // Android GLView (TextureView) native-crashes inside overflow-clipped / elevated parents.
          overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
          gap: Spacing.three,
          ...(Platform.OS === 'android' ? null : shadow('sm', c.isDark)),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
