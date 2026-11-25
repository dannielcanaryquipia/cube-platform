import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Rubik, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clearLastCrash, readLastCrash, type LastCrash } from '@/lib/crash-capture';

export function CrashReport() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const [crash, setCrash] = useState<LastCrash | null>(null);

  useEffect(() => {
    void readLastCrash().then(setCrash);
  }, []);

  if (!crash) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: c.bg,
          zIndex: 100,
          paddingTop: insets.top + Spacing.four,
          paddingBottom: insets.bottom + Spacing.four,
          paddingHorizontal: Spacing.four,
        },
      ]}
    >
      <Text style={[Type.h2, { color: c.danger, marginBottom: Spacing.two }]}>Last crash</Text>
      <Text style={[Type.bodyMedium, { color: c.ink, marginBottom: Spacing.three }]}>{crash.message}</Text>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: Spacing.four }}>
        <Text style={[Type.small, { color: c.muted, fontFamily: Rubik.regular }]}>
          {crash.time}
          {crash.isFatal ? ' · fatal' : ''}
          {'\n\n'}
          {crash.stack ?? '(no stack)'}
        </Text>
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss crash report"
        onPress={() => {
          void clearLastCrash();
          setCrash(null);
        }}
        style={{
          alignSelf: 'flex-start',
          backgroundColor: c.accent,
          paddingHorizontal: Spacing.four,
          paddingVertical: Spacing.three,
          borderRadius: 8,
        }}
      >
        <Text style={[Type.button, { color: c.accentInk }]}>Dismiss</Text>
      </Pressable>
    </View>
  );
}
