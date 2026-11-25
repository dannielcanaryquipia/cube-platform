import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Btn, Card, FieldLabel, PageScroll, Screen, SectionTitle, Wrap } from '@/components/ui';
import { Radius, Rubik, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { THEME_MODES, setThemeMode, useThemeMode } from '@/lib/themeMode';
import { DEFAULT_COLORS, FACE_KEYS, FACE_NAME, resetCubeColors, setCubeColor, useCubeColors } from '@/lib/cubeColors';

const COLOR_PRESETS = ['#facc15', '#f4f4f2', '#22c55e', '#3b82f6', '#f97316', '#ef4444', '#111827', '#a855f7', '#14b8a6', '#f472b6'];

const TECH = [
  ['React Native / Expo', 'Cross-platform mobile runtime'],
  ['Expo Router', 'File-based navigation'],
  ['TypeScript', 'Typed app and solver logic'],
  ['@expo/ui', 'Native SwiftUI/Compose controls'],
  ['AsyncStorage', 'Local progress, timer, settings'],
  ['expo-gl + three.js', 'Native 3D cube player, offline'],
  ['Layer by Layer CFOP data', 'Verified algorithm sets'],
];

export default function SettingsScreen() {
  const c = useTheme();
  const mode = useThemeMode();
  const cubeColors = useCubeColors() as Record<string, string>;
  const [editFace, setEditFace] = useState<string | null>(null);
  const year = new Date().getFullYear();

  return (
    <Screen>
    <PageScroll>
      <Card style={{ gap: Spacing.three }}>
        <SectionTitle title="Appearance" />
        <View style={{ flexDirection: 'row', gap: Spacing.two }}>
          {THEME_MODES.map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setThemeMode(m)}
                style={({ pressed }) => ({
                  flex: 1,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: Radius.sm,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: active ? c.accent : c.line,
                  backgroundColor: active ? c.accentSoft : c.bg,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text style={[Type.smallBold, { color: active ? c.accent : c.ink }]}>
                  {m[0].toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={{ gap: Spacing.four }}>
        <SectionTitle title="Cube colours" />
        <Text style={[Type.body, { color: c.muted }]}>
          Match sticker colours to your physical cube. Tap a face to change it, then pick a preset. Affects every cube in the app.
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
          {(FACE_KEYS as string[]).map((face) => {
            const name = (FACE_NAME as Record<string, string>)[face] ?? face;
            const def = (DEFAULT_COLORS as Record<string, string>)[face];
            const selected = editFace === face;
            const changed = def && cubeColors[face].toLowerCase() !== def.toLowerCase();
            return (
              <Pressable
                key={face}
                onPress={() => setEditFace(selected ? null : face)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  minWidth: 150,
                  minHeight: 44,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: Radius.sm,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: selected ? c.accent : c.line,
                  backgroundColor: selected ? c.accentSoft : c.bg,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ width: 32, height: 32, borderRadius: 8, borderCurve: 'continuous', borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)', backgroundColor: cubeColors[face] }} />
                <Text style={[Type.body, { flex: 1, fontFamily: selected ? Rubik.semibold : Rubik.medium, color: c.ink }]}>{name}</Text>
                {changed && !selected && <Text style={[Type.small, { color: c.muted }]}>custom</Text>}
              </Pressable>
            );
          })}
        </View>

        {editFace && (
          <View style={{ gap: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: c.line }}>
            <FieldLabel>Pick colour for {(FACE_NAME as Record<string, string>)[editFace]?.toUpperCase()}</FieldLabel>
            <Wrap gap={Spacing.two}>
              {COLOR_PRESETS.map((p) => {
                const active = cubeColors[editFace]?.toLowerCase() === p.toLowerCase();
                return (
                  <Pressable
                    key={p}
                    onPress={() => setCubeColor(editFace, p)}
                    accessibilityRole="button"
                    accessibilityLabel={`Set ${(FACE_NAME as Record<string, string>)[editFace]} to ${p}`}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: p,
                      borderWidth: active ? 3 : 1,
                      borderColor: active ? c.accent : 'rgba(0,0,0,0.12)',
                    }}
                  />
                );
              })}
            </Wrap>
            <Pressable onPress={() => { const def = (DEFAULT_COLORS as Record<string, string>)[editFace]; if (def) setCubeColor(editFace, def); }} hitSlop={8}>
              <Text style={[Type.small, { color: c.muted, textDecorationLine: 'underline' }]}>Reset this face</Text>
            </Pressable>
          </View>
        )}

        <Btn label="Reset all colours" variant="ghost" size="sm" onPress={resetCubeColors} />
      </Card>

      <Card style={{ gap: Spacing.three }}>
        <SectionTitle title="About" />
        <Text style={[Type.h3, { color: c.ink }]}>Layer by Layer</Text>
        <Text style={[Type.body, { color: c.muted }]}>
          A clean CFOP 3x3 Rubik&apos;s Cube learning platform. Learn Cross, F2L, OLL, and PLL with clear visuals, algorithms, and practice tools.
        </Text>
      </Card>

      <Card padded={false}>
        <View style={{ paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: Spacing.two }}>
          <SectionTitle title="Tech stack" />
        </View>
        {TECH.map(([name, detail], i) => (
          <View
            key={name}
            style={{
              paddingVertical: Spacing.three,
              paddingHorizontal: Spacing.four,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: c.line,
              gap: 2,
            }}
          >
            <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.ink }]}>{name}</Text>
            <Text style={[Type.supporting, { color: c.muted }]}>{detail}</Text>
          </View>
        ))}
      </Card>

      <Card style={{ gap: Spacing.three }}>
        <SectionTitle title="Creator" />
        <Text style={[Type.h3, { color: c.ink }]}>Danniel Canary Quipia</Text>
        <Text selectable style={[Type.supporting, { color: c.muted }]}>dannielcanaryquipia</Text>
      </Card>

      <View style={{ alignItems: 'center', paddingVertical: Spacing.two }}>
        <Text style={[Type.small, { color: c.muted }]}>© {year} Danniel Canary Quipia. All rights reserved.</Text>
      </View>
    </PageScroll>
    </Screen>
  );
}
