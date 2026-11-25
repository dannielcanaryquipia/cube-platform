import { View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

import { SLOTS, faceOfSlot, facelets, slotAt } from '@/lib/cube';

type Pt = [number, number];

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function cell(p0: Pt, p1: Pt, p2: Pt, p3: Pt, i: number, j: number, n = 3, gap = 0.1): Pt[] {
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
  fills,
  plastic,
}: {
  corners: [Pt, Pt, Pt, Pt];
  fills: string[];
  plastic: string;
}) {
  const [p0, p1, p2, p3] = corners;
  return (
    <>
      <Polygon points={[p0, p1, p2, p3].map((p) => p.join(',')).join(' ')} fill={plastic} />
      {fills.map((fill, k) => {
        const pts = cell(p0, p1, p2, p3, k % 3, Math.floor(k / 3));
        return <Polygon key={k} points={pts.map((p) => p.join(',')).join(' ')} fill={fill} />;
      })}
    </>
  );
}

const SLOT_FACES: Record<string, { top: string; left: string; right: string }> = {
  FR: { top: 'U', left: 'F', right: 'R' },
  FL: { top: 'U', left: 'L', right: 'F' },
  BR: { top: 'U', left: 'R', right: 'B' },
  BL: { top: 'U', left: 'B', right: 'L' },
};

const FACE_N: Record<string, [number, number, number]> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  R: [1, 0, 0],
  L: [-1, 0, 0],
};

function slotsForFace(face: string): number[] {
  const n = FACE_N[face];
  const out: number[] = [];
  if (face === 'U' || face === 'D') {
    const y = face === 'U' ? 1 : -1;
    for (const z of [-1, 0, 1]) for (const x of [-1, 0, 1]) {
      const s = slotAt([x, y, z], n);
      if (s != null) out.push(s);
    }
  } else if (face === 'F' || face === 'B') {
    const z = face === 'F' ? 1 : -1;
    for (const y of [1, 0, -1]) for (const x of [-1, 0, 1]) {
      const s = slotAt([x, y, z], n);
      if (s != null) out.push(s);
    }
  } else {
    const x = face === 'R' ? 1 : -1;
    for (const y of [1, 0, -1]) for (const z of face === 'R' ? [1, 0, -1] : [-1, 0, 1]) {
      const s = slotAt([x, y, z], n);
      if (s != null) out.push(s);
    }
  }
  return out;
}

function stickerHex(
  slot: number,
  loc: number[],
  stickering: string,
  colors: Record<string, string>
) {
  const f = facelets(loc);
  const id = f[slot];
  const faceHex = colors[faceOfSlot(id)] || '#888888';
  const grey = colors.X || '#7c8591';
  const plastic = '#1c232d';
  const onLastLayer = SLOTS[id].p[1] === 1;
  const faceKey = faceOfSlot(slot);
  if (stickering === 'F2L') return onLastLayer ? grey : faceHex;
  if (stickering === 'OLL') {
    if (faceKey === 'D') return plastic;
    if (onLastLayer && faceKey !== 'U') return grey;
    return faceHex;
  }
  if (stickering === 'PLL') {
    if (faceKey === 'U') return faceHex;
    if (onLastLayer) return grey;
    return plastic;
  }
  return faceHex;
}

function fillsFor(face: string, loc: number[], stickering: string, colors: Record<string, string>) {
  return slotsForFace(face).map((slot) => stickerHex(slot, loc, stickering, colors));
}

export function StickerCube({
  loc,
  colors,
  stickering = 'full',
  slot = 'FR',
  size = 220,
}: {
  loc: number[];
  colors: Record<string, string>;
  stickering?: string;
  slot?: string;
  size?: number;
}) {
  const faces = SLOT_FACES[slot] ?? SLOT_FACES.FR;
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

  return (
    <View accessible={false} style={{ width: size, height: size * 1.12, alignSelf: 'center' }}>
      <Svg width={size} height={size * 1.12} viewBox="0 0 100 110">
        <Face corners={[T, R, C, L]} fills={fillsFor(faces.top, loc, stickering, colors)} plastic={plastic} />
        <Face corners={[L, C, Fd, Ld]} fills={fillsFor(faces.left, loc, stickering, colors)} plastic={plastic} />
        <Face corners={[C, R, Rd, Fd]} fills={fillsFor(faces.right, loc, stickering, colors)} plastic={plastic} />
      </Svg>
    </View>
  );
}
