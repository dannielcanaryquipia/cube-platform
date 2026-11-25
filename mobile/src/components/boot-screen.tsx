import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CubeView } from '@/components/cube-view';
import { Rubik, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { bootLog } from '@/lib/boot-log';
import { BOOT_ALG, BOOT_SETUP } from '@/lib/cube';
import { useCubeColors } from '@/lib/cubeColors';

const CUBE = 200;

const BOOT_3D = true;

/**
 * Website BootLoader: native three.js cube plays the scramble→solve, then yields.
 * Tap skips. GL failure or a 5s cap never blocks the app.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const c = useTheme();
  const colors = useCubeColors() as Record<string, string>;
  const insets = useSafeAreaInsets();
  const finished = useRef(false);
  const [mountCube, setMountCube] = useState(false);

  const dismiss = () => {
    if (finished.current) return;
    finished.current = true;
    bootLog('boot overlay dismissing');
    onDone();
  };

  useEffect(() => {
    bootLog('boot overlay mounted');
    if (!BOOT_3D) {
      const fallback = setTimeout(dismiss, 1200);
      return () => clearTimeout(fallback);
    }
    const show = setTimeout(() => setMountCube(true), 500);
    const fallback = setTimeout(dismiss, 5200);
    return () => {
      clearTimeout(show);
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: c.bg,
          zIndex: 50,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Skip intro"
        onPress={dismiss}
        android_ripple={{ color: 'transparent' }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: insets.top,
          paddingBottom: insets.bottom + Spacing.six,
          gap: Spacing.four,
        }}
      >
        <Text style={[Type.eyebrow, { color: c.accent }]}>Layer by Layer</Text>
        {BOOT_3D ? (
          <View collapsable={false} style={{ width: CUBE, height: CUBE }}>
            {mountCube ? (
              <CubeView
                alg={BOOT_ALG}
                setup={BOOT_SETUP}
                height={CUBE}
                colors={colors}
                autoPlay
                anchor="start"
                speed={10}
                interactive={false}
                onComplete={() => setTimeout(dismiss, 250)}
                onError={() => dismiss()}
              />
            ) : null}
          </View>
        ) : null}
        <Text style={[Type.smallBold, { color: c.muted, letterSpacing: 0.2 }]}>Solving…</Text>
        <Text style={[Type.small, { color: c.muted, fontFamily: Rubik.regular, position: 'absolute', bottom: insets.bottom + 28 }]}>
          Tap to skip
        </Text>
      </Pressable>
    </View>
  );
}
