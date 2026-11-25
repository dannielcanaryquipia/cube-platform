import { Text, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

import { Rubik, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { describeFingers, fingersFor } from '@/data/fingers';

const FINGERS = [
  { i: 0, x: 8, y: 70, w: 13, h: 34, rot: '-26 15 104' },
  { i: 1, x: 30, y: 32, w: 12, h: 46, rot: undefined },
  { i: 2, x: 44, y: 22, w: 12, h: 56, rot: undefined },
  { i: 3, x: 58, y: 28, w: 12, h: 50, rot: undefined },
  { i: 4, x: 72, y: 40, w: 12, h: 38, rot: undefined },
] as const;
const ALL = new Set([0, 1, 2, 3, 4]);

function HandShape({ flip, active }: { flip?: boolean; active: Set<number> }) {
  const c = useTheme();
  const body = (
    <G>
      <Rect x={24} y={64} width={60} height={54} rx={16} fill={c.surface2} stroke={c.line} strokeWidth={1.5} />
      {FINGERS.map((f) => {
        const on = active.has(f.i);
        return (
          <Rect
            key={f.i}
            x={f.x}
            y={f.y}
            width={f.w}
            height={f.h}
            rx={6.5}
            transform={f.rot ? `rotate(${f.rot})` : undefined}
            fill={on ? c.accent : c.surface2}
            stroke={on ? c.accent : c.line}
            strokeWidth={1.5}
          />
        );
      })}
    </G>
  );

  return flip ? <G transform="translate(100 0) scale(-1 1)">{body}</G> : body;
}

export default function Hands({ move }: { move?: string }) {
  const c = useTheme();
  const act = fingersFor(move);
  const whole = act.some((a: any) => a.finger === -1);
  const L = new Set<number>();
  const R = new Set<number>();
  if (!whole) act.forEach((a: any) => (a.hand === 'L' ? L : R).add(a.finger));

  return (
    <View style={{ alignItems: 'center', gap: 2, borderTopWidth: 1, borderTopColor: c.line, paddingTop: Spacing.three }}>
      <Svg width={188} height={128} viewBox="0 0 220 146">
        <HandShape flip active={whole ? ALL : L} />
        <G transform="translate(120 0)">
          <HandShape active={whole ? ALL : R} />
        </G>
        <SvgText x={50} y={140} fill={c.muted} fontSize={11} fontFamily={Rubik.regular} textAnchor="middle" letterSpacing={0.55}>LEFT</SvgText>
        <SvgText x={170} y={140} fill={c.muted} fontSize={11} fontFamily={Rubik.regular} textAnchor="middle" letterSpacing={0.55}>RIGHT</SvgText>
      </Svg>
      <Text style={[Type.supporting, { color: c.muted, textAlign: 'center' }]}>
        {move ? (
          <>
            <Text style={[Type.monoSmall, { color: c.ink, fontFamily: Rubik.bold }]}>{move}</Text>
            {' — '}{describeFingers(move)}
          </>
        ) : (
          'Cube solved — nicely done'
        )}
      </Text>
    </View>
  );
}
