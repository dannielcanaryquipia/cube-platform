import { StyleSheet, Text, type TextProps } from 'react-native';

import { Type, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextType =
  | 'default'
  | 'title'
  | 'subtitle'
  | 'h2'
  | 'h3'
  | 'small'
  | 'smallBold'
  | 'supporting'
  | 'eyebrow'
  | 'button'
  | 'link'
  | 'linkPrimary'
  | 'code'
  | 'timer';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const defaultColor: ThemeColor = type === 'linkPrimary' ? 'accent' : type === 'eyebrow' ? 'accent' : 'ink';

  return <Text style={[{ color: theme[themeColor ?? defaultColor] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: Type.body,
  title: Type.hero,
  subtitle: Type.h1,
  h2: Type.h2,
  h3: Type.h3,
  small: Type.supporting,
  smallBold: Type.smallBold,
  supporting: Type.supporting,
  eyebrow: Type.eyebrow,
  button: Type.button,
  link: Type.body,
  linkPrimary: Type.bodyMedium,
  code: Type.mono,
  timer: Type.timer,
});
