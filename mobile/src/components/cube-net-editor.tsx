import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { slotAt } from '@/lib/cube';
import { useCubeColors } from '@/lib/cubeColors';

const FACES = ['U', 'L', 'F', 'R', 'B', 'D'] as const;
type Face = typeof FACES[number];

function cell(face: Face, r: number, c: number): number {
  switch (face) {
    case 'F': return slotAt([c - 1, 1 - r, 1], [0, 0, 1])!;
    case 'U': return slotAt([c - 1, 1, r - 1], [0, 1, 0])!;
    case 'D': return slotAt([c - 1, -1, 1 - r], [0, -1, 0])!;
    case 'R': return slotAt([1, 1 - r, 1 - c], [1, 0, 0])!;
    case 'L': return slotAt([-1, 1 - r, c - 1], [-1, 0, 0])!;
    default:  return slotAt([1 - c, 1 - r, -1], [0, 0, -1])!;
  }
}

const GRID = Object.fromEntries(FACES.map((f) => [f, [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => cell(f, r, c)))])) as Record<Face, number[]>;
const CENTER = Object.fromEntries(FACES.map((f) => [f, GRID[f][4]])) as Record<Face, number>;

const FACE_GAP = 8;
const STICKER_GAP = 3;
const FACE_PAD = 3;
const CELL_MAX = 30;
const CELL_MIN = 14;

function faceSize(cellSize: number) {
  return cellSize * 3 + STICKER_GAP * 2 + FACE_PAD * 2;
}

/** Website `.net-cell` clamp: keep four middle faces (12 stickers) inside the editor. */
function cellSizeFor(width: number) {
  if (width <= 0) return 22;
  const perFace = (width - FACE_GAP * 3) / 4;
  let size = Math.floor((perFace - FACE_PAD * 2 - STICKER_GAP * 2) / 3);
  size = Math.min(CELL_MAX, Math.max(CELL_MIN, size));
  while (size > CELL_MIN && 4 * faceSize(size) + 3 * FACE_GAP > width) size -= 1;
  return size;
}

function FaceNet({
  face,
  cellSize,
  color,
  onPaint,
}: {
  face: Face;
  cellSize: number;
  color: string[];
  onPaint: (slot: number) => void;
}) {
  const COLORS = useCubeColors() as Record<string, string>;
  const t = useTheme();
  const size = faceSize(cellSize);
  const rows = [0, 1, 2];

  return (
    <View
      accessibilityLabel={`${face} face`}
      style={{
        width: size,
        height: size,
        padding: FACE_PAD,
        gap: STICKER_GAP,
        backgroundColor: t.surface2,
        borderRadius: 7,
        overflow: 'hidden',
      }}
    >
      {rows.map((r) => (
        <View key={r} style={{ flexDirection: 'row', gap: STICKER_GAP }}>
          {rows.map((c) => {
            const i = r * 3 + c;
            const slot = GRID[face][i];
            const fixed = slot === CENTER[face];
            return (
              <Pressable
                key={slot}
                disabled={fixed}
                onPress={() => onPaint(slot)}
                accessibilityLabel={fixed ? `${face} centre` : `Paint ${face} sticker ${i + 1}`}
                style={({ pressed }) => ({
                  width: cellSize,
                  height: cellSize,
                  flexGrow: 0,
                  flexShrink: 0,
                  borderRadius: 4,
                  overflow: 'hidden',
                  backgroundColor: COLORS[color[slot]] || t.muted,
                  opacity: pressed && !fixed ? 0.8 : 1,
                })}
              >
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    borderWidth: fixed ? 2 : 1,
                    borderColor: fixed ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.18)',
                    borderRadius: 4,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function CubeNetEditor({ color, onPaint }: { color: string[]; onPaint: (slot: number) => void }) {
  const { contentWidth } = useLayout();
  const [measured, setMeasured] = useState(0);
  const width = measured || Math.max(0, contentWidth - 36);
  const cellSize = cellSizeFor(width);
  const spacer = faceSize(cellSize);

  return (
    <View
      accessibilityLabel="Cube net — tap a sticker to paint it"
      onLayout={(e) => {
        const next = Math.floor(e.nativeEvent.layout.width);
        if (next > 0 && next !== measured) setMeasured(next);
      }}
      style={{ width: '100%', maxWidth: '100%', gap: FACE_GAP }}
    >
      <View style={{ flexDirection: 'row', gap: FACE_GAP }}>
        <View style={{ width: spacer }} />
        <FaceNet face="U" cellSize={cellSize} color={color} onPaint={onPaint} />
      </View>
      <View style={{ flexDirection: 'row', gap: FACE_GAP }}>
        {(['L', 'F', 'R', 'B'] as const).map((f) => (
          <FaceNet key={f} face={f} cellSize={cellSize} color={color} onPaint={onPaint} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: FACE_GAP }}>
        <View style={{ width: spacer }} />
        <FaceNet face="D" cellSize={cellSize} color={color} onPaint={onPaint} />
      </View>
    </View>
  );
}
