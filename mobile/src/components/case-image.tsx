import { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Polygon, Line, Defs, Marker, Path } from 'react-native-svg';
import { SLOTS, caseState, facelets, faceOfSlot, slotAt } from '@/lib/cube';
import { useCubeColors } from '@/lib/cubeColors';

const isLLPiece = (id: number) => SLOTS[id].p[1] === 1;

function LastLayer({ alg, mode }: { alg: string; mode: string }) {
  const COLORS = useCubeColors() as Record<string, string>;
  const { cells, arrows } = useMemo(() => {
    const loc = caseState(alg);
    const f = facelets(loc);
    const color = (slot: number) => {
      const id = f[slot];
      const face = faceOfSlot(id);
      if (mode === 'oll') return face === 'U' ? COLORS.U : COLORS.X;
      return COLORS[face];
    };
    const S = 26, G = 3, T = 9, O = T + G + 2;
    const cells: any[] = [];
    for (const x of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
      const slot = slotAt([x, 1, z], [0, 1, 0])!;
      cells.push({ x: O + (x + 1) * (S + G), y: O + (z + 1) * (S + G), w: S, h: S, fill: color(slot) });
      const edgeLen = 3 * S + 2 * G;
      if (z === -1) cells.push({ x: O + (x + 1) * (S + G), y: O - T - G, w: S, h: T, fill: color(slotAt([x, 1, z], [0, 0, -1])!) });
      if (z === 1) cells.push({ x: O + (x + 1) * (S + G), y: O + edgeLen + G, w: S, h: T, fill: color(slotAt([x, 1, z], [0, 0, 1])!) });
      if (x === -1) cells.push({ x: O - T - G, y: O + (z + 1) * (S + G), w: T, h: S, fill: color(slotAt([x, 1, z], [-1, 0, 0])!) });
      if (x === 1) cells.push({ x: O + edgeLen + G, y: O + (z + 1) * (S + G), w: T, h: S, fill: color(slotAt([x, 1, z], [1, 0, 0])!) });
    }
    const arrows: any[] = [];
    if (mode === 'pll') {
      SLOTS.forEach((s: any, id: number) => {
        if (!isLLPiece(id) || s.n[1] !== 1 || (s.p[0] === 0 && s.p[2] === 0)) return;
        const from = SLOTS[loc[id]].p;
        if (from[0] === s.p[0] && from[2] === s.p[2]) return;
        const c = (p: number[]) => [O + (p[0] + 1) * (S + G) + S / 2, O + (p[2] + 1) * (S + G) + S / 2];
        arrows.push({ a: c(from), b: c(s.p) });
      });
    }
    return { cells, arrows };
  }, [alg, mode, COLORS]);

  return (
    <Svg viewBox="0 0 118 118" width="100%" height="100%">
      <Defs>
        <Marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <Path d="M0 0 L10 5 L0 10 z" fill="#1b1f27" />
        </Marker>
      </Defs>
      {cells.map((c: any, i: number) => <Rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="3" fill={c.fill} />)}
      {arrows.map(({ a, b }: any, i: number) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), k = 7 / len;
        return <Line key={i} x1={a[0] + dx * k} y1={a[1] + dy * k} x2={b[0] - dx * k} y2={b[1] - dy * k}
          stroke="#1b1f27" strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#ah)" />;
      })}
    </Svg>
  );
}

const VIEW: Record<string, [number, number]> = { FR: [1, 1], FL: [-1, 1], BR: [1, -1], BL: [-1, -1] };
const PAIR: Record<string, string[]> = { FR: ['1,-1,1', '1,0,1'], FL: ['-1,-1,1', '-1,0,1'], BR: ['1,-1,-1', '1,0,-1'], BL: ['-1,-1,-1', '-1,0,-1'] };

function FirstTwoLayers({ alg, slot = 'FR' }: { alg: string; slot?: string }) {
  const COLORS = useCubeColors() as Record<string, string>;
  const polys = useMemo(() => {
    const loc = caseState(alg);
    const f = facelets(loc);
    const [vx, vz] = VIEW[slot] || VIEW.FR;
    const pair = PAIR[slot] || PAIR.FR;
    const proj = ([x, y, z]: number[]) => [(vz * x - vx * z) * 0.866 * 15, ((vx * x + vz * z) * 0.5 - y) * 15];
    const out: any[] = [];
    SLOTS.forEach(({ p, n }: any, s: number) => {
      const visible = n[1] === 1 || n[0] === vx || n[2] === vz;
      if (!visible) return;
      const id = f[s];
      const home = SLOTS[id].p.join(',');
      const colored = pair.includes(home) || !isLLPiece(id);
      const fill = colored ? COLORS[faceOfSlot(id)] : COLORS.X;
      const c = p.map((v: number, i: number) => v + n[i] * 0.5);
      const ax = [0, 1, 2].filter((i) => n[i] === 0);
      const h = 0.44;
      const pts = [[h, h], [h, -h], [-h, -h], [-h, h]].map(([a, b]) => {
        const q = c.slice(); q[ax[0]] += a; q[ax[1]] += b; return proj(q);
      });
      out.push({ pts: pts.map((q) => q.join(',')).join(' '), fill, dim: colored && !pair.includes(home) });
    });
    return out;
  }, [alg, slot, COLORS]);
  return (
    <Svg viewBox="-42 -46 84 92" width="100%" height="100%">
      {polys.map((p: any, i: number) => <Polygon key={i} points={p.pts} fill={p.fill} opacity={p.dim ? 0.55 : 1} stroke="rgba(0,0,0,.18)" strokeWidth=".5" strokeLinejoin="round" />)}
    </Svg>
  );
}

const CaseImage = memo(function CaseImage({
  alg,
  view,
  slot,
  size = 88,
  fill = false,
}: {
  alg: string;
  view: string;
  slot?: string;
  size?: number;
  fill?: boolean;
}) {
  const isF2l = view === 'f2l';
  return (
    <View style={fill ? { width: '100%', aspectRatio: isF2l ? 84 / 92 : 1 } : { width: size, height: size }}>
      {isF2l ? <FirstTwoLayers alg={alg} slot={slot} /> : <LastLayer alg={alg} mode={view} />}
    </View>
  );
});

export default CaseImage;
