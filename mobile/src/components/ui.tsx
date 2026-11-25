import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { type ComponentProps, type ReactNode, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type PressableProps,
  type ScrollViewProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { bottomSafe, MaxContentWidth, Radius, Spacing, Type, shadow } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { goBack } from '@/lib/nav';

/* ------------------------------------------------------------------ layout */

export function Screen({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View collapsable={false} style={[{ flex: 1, backgroundColor: c.bg }, style]}>
      {children}
    </View>
  );
}

export function PageScroll({ children, contentContainerStyle, style, ...rest }: ScrollViewProps) {
  const { gutter, isWide } = useLayout();
  const bottom = bottomSafe(useSafeAreaInsets().bottom);
  return (
    <ScrollView
      style={[{ flex: 1 }, style]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        {
          padding: gutter,
          gap: isWide ? Spacing.five : Spacing.four,
          paddingBottom: Spacing.six + bottom,
          width: '100%',
          maxWidth: MaxContentWidth,
          alignSelf: 'center',
        },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}

export function Row({ children, gap = 0, style, ...rest }: { children?: ReactNode; gap?: number; style?: StyleProp<ViewStyle> } & Omit<ComponentProps<typeof View>, 'style' | 'children'>) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]} {...rest}>{children}</View>;
}

export function Col({ children, gap = 0, style, ...rest }: { children?: ReactNode; gap?: number; style?: StyleProp<ViewStyle> } & Omit<ComponentProps<typeof View>, 'style' | 'children'>) {
  return <View style={[{ flexDirection: 'column', gap }, style]} {...rest}>{children}</View>;
}

export function Wrap({ children, gap = Spacing.two, style }: { children?: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap }, style]}>{children}</View>;
}

/* -------------------------------------------------------------------- text */

export function PageHeader({
  eyebrow,
  title,
  suffix,
  lede,
  right,
  children,
}: {
  eyebrow?: string;
  title?: string;
  suffix?: string;
  lede?: string;
  right?: ReactNode;
  children?: ReactNode;
}) {
  const c = useTheme();
  return (
    <View style={{ gap: Spacing.two }}>
      {!!eyebrow && <Text style={[Type.eyebrow, { color: c.accent }]}>{eyebrow}</Text>}
      {(!!title || right) && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.three }}>
          {!!title && (
            <Text style={[Type.h1, { color: c.ink, flexShrink: 1 }]}>
              {title}
              {!!suffix && <Text style={[Type.h3, { color: c.muted }]}> {suffix}</Text>}
            </Text>
          )}
          {right}
        </View>
      )}
      {!!lede && <Text style={[Type.body, { color: c.muted }]}>{lede}</Text>}
      {children}
    </View>
  );
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return <Text style={[Type.eyebrow, { color: c.accent }, style]}>{children}</Text>;
}

export function FieldLabel({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return <Text style={[Type.fieldLabel, { color: c.muted }, style]}>{children}</Text>;
}

export function SectionTitle({ title, count, style }: { title: string; count?: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return (
    <Text style={[Type.h3, { color: c.ink, flexShrink: 1 }, style]}>
      {title}
      {count != null && <Text style={[Type.supporting, { color: c.muted, fontFamily: Type.body.fontFamily }]}>  {count}</Text>}
    </Text>
  );
}

export function Hint({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return <Text style={[Type.supporting, { color: c.muted }, style]}>{children}</Text>;
}

export function Empty({ children }: { children: ReactNode }) {
  const c = useTheme();
  return <Text style={[Type.body, { color: c.muted, paddingVertical: Spacing.five }]}>{children}</Text>;
}

export function AlgText({ children, big = false, style }: { children: ReactNode; big?: boolean; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return (
    <Text
      style={[
        big ? Type.bodyMedium : Type.monoSmall,
        { color: big ? c.ink : c.muted, flexShrink: 1, minWidth: 0, width: '100%' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* ------------------------------------------------------------------ surfaces */

export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
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
          minWidth: 0,
          overflow: 'hidden',
          ...shadow('sm', c.isDark),
        },
        padded && { padding: Spacing.four },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ListRow({
  title,
  sub,
  left,
  right,
  last = false,
  disclosure = true,
  onPress,
  style,
  ...rest
}: {
  title: string;
  sub?: string;
  left?: ReactNode;
  right?: ReactNode;
  last?: boolean;
  disclosure?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, 'onPress' | 'style' | 'children'>) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 56,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.three,
          paddingVertical: Spacing.three,
          paddingHorizontal: Spacing.four,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: c.line,
          backgroundColor: pressed ? c.surface2 : 'transparent',
        },
        style,
      ]}
      {...rest}
    >
      {left}
      <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
        <Text style={[Type.body, { fontFamily: Type.bodyMedium.fontFamily, color: c.ink }]} numberOfLines={1}>
          {title}
        </Text>
        {!!sub && (
          <Text style={[Type.small, { color: c.muted }]} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
      {right}
      {disclosure && <Ionicons name="chevron-forward" size={16} color={c.muted} />}
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return <View style={[{ height: 1, backgroundColor: c.line }, style]} />;
}

export function Note({ children, tone = 'default', style }: { children: ReactNode; tone?: 'default' | 'warn'; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View style={[{ backgroundColor: tone === 'warn' ? c.learningSoft : c.surface2, borderRadius: Radius.sm, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2 }, style]}>
      <Text style={[Type.supporting, { color: tone === 'warn' ? c.ink : c.muted }]}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ controls */

type ButtonVariant = 'primary' | 'ghost' | 'ink' | 'subtle';

export function Btn({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  endIcon,
  disabled = false,
  fullWidth = false,
  style,
  labelStyle,
  accessibilityLabel,
  ...rest
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: ReactNode;
  endIcon?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
} & Omit<PressableProps, 'onPress' | 'style' | 'children'>) {
  const c = useTheme();
  const bg = variant === 'primary' ? c.accent : variant === 'ink' ? c.ink : variant === 'subtle' ? c.surface2 : c.surface;
  const fg = variant === 'primary' ? c.accentInk : variant === 'ink' ? c.bg : c.ink;
  const borderColor = variant === 'ghost' ? c.line : variant === 'subtle' ? 'transparent' : bg;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: size === 'sm' ? 6 : 7,
          height: size === 'sm' ? 38 : 42,
          paddingHorizontal: size === 'sm' ? 14 : 18,
          borderRadius: Radius.button,
          borderCurve: 'continuous',
          backgroundColor: bg,
          borderWidth: 1,
          borderColor,
          opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
          ...(variant === 'primary' ? shadow('sm', c.isDark) : null),
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
      {...rest}
    >
      {icon}
      <Text style={[size === 'sm' ? Type.buttonSmall : Type.button, { color: fg }, labelStyle]} numberOfLines={1}>
        {label}
      </Text>
      {endIcon}
    </Pressable>
  );
}

export function Chip({
  label,
  count,
  active = false,
  onPress,
  small = false,
  icon,
  disabled = false,
  style,
}: {
  label: string;
  count?: number | string;
  active?: boolean;
  onPress?: () => void;
  small?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          borderWidth: 1,
          borderColor: active ? c.ink : c.line,
          backgroundColor: active ? c.ink : c.surface,
          borderRadius: Radius.pill,
          paddingHorizontal: small ? 10 : 12,
          paddingVertical: small ? 3 : 5,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text numberOfLines={1} style={[small ? Type.chipSmall : Type.chip, { color: active ? c.bg : c.ink }]}>{label}</Text>
      {count != null && <Text style={[Type.chipSmall, { color: active ? c.bg : c.muted, opacity: active ? 0.7 : 1 }]}>{count}</Text>}
    </Pressable>
  );
}

export function Progress({ label, value, showPercent = true, style }: { label?: string; value: number; showPercent?: boolean; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={[{ gap: Spacing.one }, style]}>
      {!!label && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two }}>
          <Text style={[Type.supporting, { color: c.muted }]}>{label}</Text>
          {showPercent && <Text style={[Type.supporting, { color: c.muted }]}>{Math.round(pct)}%</Text>}
        </View>
      )}
      <View style={{ height: 5, maxWidth: 320, borderRadius: 9, backgroundColor: c.surface2, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: c.accent }} />
      </View>
    </View>
  );
}

export function SearchField({
  value,
  onChangeText,
  placeholder,
  style,
  inputStyle,
  editable = true,
  onPress,
  ...rest
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  editable?: boolean;
  onPress?: () => void;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'style' | 'editable' | 'autoFocus'>) {
  const c = useTheme();
  const isInput = editable && !onPress;

  const rowStyle: StyleProp<ViewStyle> = [
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two + 2,
      height: 44,
      maxWidth: 520,
      width: '100%',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
      borderRadius: Radius.field,
      paddingHorizontal: Spacing.three,
    },
    style,
  ];

  if (!isInput) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={placeholder ?? 'Search'}
        onPress={onPress}
        android_ripple={{ color: 'transparent' }}
        style={[rowStyle, { opacity: 1 }]}
      >
        <Ionicons name="search" size={18} color={c.muted} />
        <Text numberOfLines={1} style={[Type.body, { flex: 1, minWidth: 0, color: value ? c.ink : c.muted }]}>
          {value || placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={rowStyle}>
      <Ionicons name="search" size={18} color={c.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        {...rest}
        autoFocus={false}
        showSoftInputOnFocus
        cursorColor={c.ink}
        selectionColor={c.ink}
        underlineColorAndroid="transparent"
        keyboardAppearance={c.isDark ? 'dark' : 'light'}
        caretHidden={false}
        style={[
          {
            flex: 1,
            minWidth: 0,
            paddingVertical: 0,
            margin: 0,
            color: c.ink,
            backgroundColor: 'transparent',
            textAlignVertical: 'center',
          },
          Platform.OS === 'web' ? ({ outlineWidth: 0 } as TextStyle) : null,
          Type.body,
          inputStyle,
        ]}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        spellCheck={false}
        textContentType="none"
        importantForAutofill="no"
        clearButtonMode="never"
        returnKeyType="search"
        blurOnSubmit
      />
    </View>
  );
}

/** Home/Learn search: opens the search screen. No keyboard until the field on that screen is tapped. */
export function SearchLaunch({
  placeholder = 'Search cases or algs',
  style,
}: {
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SearchField
      value=""
      onChangeText={() => {}}
      placeholder={placeholder}
      editable={false}
      onPress={() => router.push('/search' as any)}
      style={[{ maxWidth: '100%' }, style]}
    />
  );
}

export function Input({
  value,
  onChangeText,
  placeholder,
  style,
  ...rest
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'style'>) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={c.muted}
      autoFocus={false}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          height: 42,
          borderWidth: 1,
          borderColor: focused ? c.accent : c.line,
          backgroundColor: c.surface,
          color: c.ink,
          borderRadius: Radius.sm,
          paddingHorizontal: Spacing.three,
        },
        Type.body,
        style,
      ]}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------- pieces */

export function Stat({ label, value, style }: { label: string; value: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View style={[{ gap: 2 }, style]}>
      <Text style={[Type.fieldLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[Type.h1, { color: c.ink }]}>{value}</Text>
    </View>
  );
}

export function SettingsRow({
  icon,
  title,
  sub,
  right,
  first = false,
  last = false,
  style,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  right?: ReactNode;
  first?: boolean;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.three,
          paddingVertical: Spacing.three,
          borderTopWidth: first ? 0 : 1,
          borderTopColor: c.line,
        },
        last && { paddingBottom: 0 },
        style,
      ]}
    >
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[Type.bodyMedium, { color: c.ink }]}>{title}</Text>
        {!!sub && <Text style={[Type.supporting, { color: c.muted }]}>{sub}</Text>}
      </View>
      {right}
    </View>
  );
}

export function Dot({ status }: { status?: string }) {
  const c = useTheme();
  if (!status) return null;
  const color = status === 'learned' ? c.learned : status === 'learning' ? c.learning : c.muted;
  return <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }} />;
}

export function MovePill({ label, state = 'idle' }: { label: string; state?: 'idle' | 'done' | 'next' }) {
  const c = useTheme();
  return (
    <View
      style={{
        minWidth: 40,
        height: 36,
        paddingHorizontal: Spacing.two,
        borderRadius: 9,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: state === 'done' ? c.accentSoft : c.bg,
        borderColor: state === 'next' ? c.ink : state === 'done' ? 'transparent' : c.line,
      }}
    >
      <Text style={[Type.mono, { color: state === 'done' ? c.accent : c.ink }, state === 'next' && { fontFamily: 'Rubik_700Bold' }]}>{label}</Text>
    </View>
  );
}

export function StageMove({ label, empty = false }: { label: string; empty?: boolean }) {
  const c = useTheme();
  return (
    <View
      style={{
        minWidth: 30,
        height: 26,
        paddingHorizontal: 7,
        borderRadius: 7,
        borderWidth: 1,
        borderStyle: empty ? 'dashed' : 'solid',
        borderColor: c.line,
        backgroundColor: c.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[Type.monoSmall, { color: empty ? c.muted : c.ink }]}>{label}</Text>
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  size = 42,
  main = false,
  disabled = false,
  accessibilityLabel,
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  size?: number;
  main?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: main ? c.ink : c.line,
        backgroundColor: main ? c.ink : c.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
        ...(main ? shadow('md', c.isDark) : null),
      })}
    >
      <Ionicons name={name} size={main ? 25 : 21} color={main ? c.bg : c.ink} />
    </Pressable>
  );
}

export function BackLink({ label, onPress, fallback = '/' }: { label: string; onPress?: () => void; fallback?: Href }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Back to ${label}`}
      onPress={onPress ?? (() => goBack(fallback))}
      hitSlop={8}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        alignSelf: 'flex-start',
        minHeight: 44,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name="arrow-back" size={16} color={c.muted} />
      <Text style={[Type.supporting, { color: c.muted }]}>{label}</Text>
    </Pressable>
  );
}
