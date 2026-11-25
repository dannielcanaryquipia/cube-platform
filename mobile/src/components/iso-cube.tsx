import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { DEFAULT_COLORS } from '@/lib/cubeColors';

type Pt = [number, number];

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function cell(p0: Pt, p1: Pt, p2: Pt, p3: Pt, i: number, j: number, n = 3, gap = 0.08): Pt[] {
  const u0 = (i + gap) / n;
  const u1 = (i + 1 - gap) / n;
  const v0 = (j + gap) / n;
  const v1 = (j + 1 - gap) / n;
  const a = lerp(lerp(p0, p1, u0), lerp(p3, p2, u0), v0);
  const b = lerp(lerp(p0, p1, u1), lerp(p3, p2, u1), v0);
  const c = lerp(lerp(p0, p1, u1), lerp(p3, p2, u1), v1);
  const d = lerp(lerp(p0, p1, u0), lerp(p3, p2, u0), v1);
  return [a, b, c, d];
}

function Face({
  corners,
  color,
  plastic,
}: {
  corners: [Pt, Pt, Pt, Pt];
  color: string;
  plastic: string;
}) {
  const [p0, p1, p2, p3] = corners;
  return (
    <>
      <Polygon points={[p0, p1, p2, p3].map((p) => p.join(',')).join(' ')} fill={plastic} />
      {Array.from({ length: 9 }, (_, k) => {
        const pts = cell(p0, p1, p2, p3, k % 3, Math.floor(k / 3));
        return <Polygon key={k} points={pts.map((p) => p.join(',')).join(' ')} fill={color} />;
      })}
    </>
  );
}

export function IsoCube({
  size = 88,
  colors = DEFAULT_COLORS as Record<string, string>,
  spinning = false,
}: {
  size?: number;
  colors?: Record<string, string>;
  spinning?: boolean;
}) {
  const [bounce] = useState(() => new Animated.Value(0));
  const plastic = '#1c232d';
  const s = 42;
  const cx = 50;
  const cy = 56;
  const ux = s * 0.866;
  const uy = s * 0.5;
  const T: Pt = [cx, cy - s];
  const R: Pt = [cx + ux, cy - uy];
  const C: Pt = [cx, cy];
  const L: Pt = [cx - ux, cy - uy];
  const Fd: Pt = [cx, cy + s];
  const Rd: Pt = [cx + ux, cy - uy + s];
  const Ld: Pt = [cx - ux, cy - uy + s];

  useEffect(() => {
    if (!spinning) {
      bounce.setValue(0);
      return;
    }
    let loop: Animated.CompositeAnimation | null = null;
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!alive || reduce) return;
      // Native driver + SVG crashes Expo Go on some Android GPUs after splash hide.
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounce, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(bounce, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ]),
      );
      loop.start();
    });
    return () => {
      alive = false;
      loop?.stop();
    };
  }, [bounce, spinning]);

  const cube = (
    <Svg width={size} height={size * 1.12} viewBox="0 0 100 110">
      <Face corners={[T, R, C, L]} color={colors.U} plastic={plastic} />
      <Face corners={[L, C, Fd, Ld]} color={colors.F} plastic={plastic} />
      <Face corners={[C, R, Rd, Fd]} color={colors.R} plastic={plastic} />
    </Svg>
  );

  if (!spinning) {
    return (
      <View accessible={false} style={{ width: size, height: size * 1.12 }}>
        {cube}
      </View>
    );
  }

  return (
    <Animated.View
      accessible={false}
      style={{
        width: size,
        height: size * 1.12,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [
          {
            translateY: bounce.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
          },
        ],
      }}
    >
      {cube}
    </Animated.View>
  );
}
