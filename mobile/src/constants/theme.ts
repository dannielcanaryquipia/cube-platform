import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Exact port of the web design system in `src/index.css`.
 * Light + dark palettes, Rubik type scale, spacing, radii and shadows.
 * Do not add one-off values in screens — extend this file instead.
 */

const light = {
  bg: '#f5f3ee',
  surface: '#ffffff',
  surface2: '#ece9e1',
  ink: '#1c232d',
  muted: '#646b75',
  line: '#dcd7cc',
  accent: '#1f6f5c',
  accentInk: '#ffffff',
  accentSoft: '#dcefe8',
  learning: '#d99a1e',
  learningSoft: '#f6ecd5',
  learned: '#1f6f5c',
  danger: '#dc2626',
  star: '#f5b301',
} as const;

const dark = {
  bg: '#12161c',
  surface: '#1a2029',
  surface2: '#242c37',
  ink: '#e8ebef',
  muted: '#9aa3ae',
  line: '#2d3642',
  accent: '#52b79a',
  accentInk: '#0d1a16',
  accentSoft: '#1d3a33',
  learning: '#e5b04a',
  learningSoft: '#3a3320',
  learned: '#52b79a',
  danger: '#f87171',
  star: '#f5b301',
} as const;

/** Semantic palette plus the legacy aliases the earlier screens still use. */
export const Colors = {
  light: {
    ...light,
    text: light.ink,
    background: light.bg,
    backgroundElement: light.surface,
    backgroundSelected: light.surface2,
    textSecondary: light.muted,
    border: light.line,
  },
  dark: {
    ...dark,
    text: dark.ink,
    background: dark.bg,
    backgroundElement: dark.surface,
    backgroundSelected: dark.surface2,
    textSecondary: dark.muted,
    border: dark.line,
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Palette = typeof Colors.light;

/** Rubik, loaded at runtime in `src/app/_layout.tsx`. */
export const Rubik = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
  extrabold: 'Rubik_800ExtraBold',
} as const;

export const FontFamily = {
  sans: Rubik.regular,
  medium: Rubik.medium,
  semibold: Rubik.semibold,
  bold: Rubik.bold,
  extrabold: Rubik.extrabold,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'ui-monospace, "SF Mono", "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace',
  }) as string,
} as const;

/** Web type scale: body 15/1.55, page title 30/750, eyebrow 12/600/.06em. */
export const Type = {
  hero: {
    fontFamily: Rubik.bold,
    fontSize: 30,
    lineHeight: 37,
    letterSpacing: -0.6,
  },
  h1: {
    fontFamily: Rubik.bold,
    fontSize: 26,
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: Rubik.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  h3: {
    fontFamily: Rubik.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: Rubik.regular,
    fontSize: 15,
    lineHeight: 23,
  },
  bodyMedium: {
    fontFamily: Rubik.medium,
    fontSize: 15,
    lineHeight: 23,
  },
  supporting: {
    fontFamily: Rubik.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  small: {
    fontFamily: Rubik.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  smallMedium: {
    fontFamily: Rubik.medium,
    fontSize: 12.5,
    lineHeight: 18,
  },
  smallBold: {
    fontFamily: Rubik.semibold,
    fontSize: 12.5,
    lineHeight: 18,
  },
  eyebrow: {
    fontFamily: Rubik.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
  fieldLabel: {
    fontFamily: Rubik.bold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: Rubik.semibold,
    fontSize: 15,
    lineHeight: 20,
  },
  buttonSmall: {
    fontFamily: Rubik.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  chip: {
    fontFamily: Rubik.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  chipSmall: {
    fontFamily: Rubik.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: FontFamily.mono,
    fontSize: 15,
    lineHeight: 20,
  },
  monoSmall: {
    fontFamily: FontFamily.mono,
    fontSize: 12.5,
    lineHeight: 17,
  },
  monoLarge: {
    fontFamily: FontFamily.mono,
    fontSize: 22,
    lineHeight: 28,
  },
  timer: {
    fontFamily: Rubik.bold,
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -1.28,
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 40,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  button: 11,
  field: 12,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

/** Web shadow-sm / shadow-md / shadow-lg, as CSS boxShadow (New Architecture). */
export function shadow(level: 'sm' | 'md' | 'lg', isDark = false): ViewStyle {
  // CSS boxShadow on Android has been crashing Expo Go after first paint.
  if (Platform.OS === 'android') {
    return { elevation: level === 'sm' ? 1 : level === 'md' ? 3 : 6 };
  }
  if (level === 'sm') {
    return { boxShadow: isDark ? '0 1px 2px rgba(0, 0, 0, 0.30)' : '0 1px 2px rgba(20, 25, 33, 0.05)' };
  }
  if (level === 'md') {
    return { boxShadow: isDark ? '0 4px 16px rgba(0, 0, 0, 0.34)' : '0 4px 14px rgba(20, 25, 33, 0.07)' };
  }
  return { boxShadow: isDark ? '0 16px 48px rgba(0, 0, 0, 0.50)' : '0 14px 40px rgba(20, 25, 33, 0.12)' };
}

/** Focus ring: `0 0 0 3px var(--accent-soft)`. */
export function ring(color: string): ViewStyle {
  return { boxShadow: `0 0 0 3px ${color}` };
}

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;

/** Gesture / 3-button nav inset. Android edge-to-edge sometimes reports 0. */
export function bottomSafe(inset: number) {
  if (inset > 0) return inset;
  return Platform.OS === 'android' ? 48 : 0;
}
export const MaxContentWidth = 1240;
