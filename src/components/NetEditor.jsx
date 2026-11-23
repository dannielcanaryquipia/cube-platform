import { VStack } from "@astryxdesign/core/Stack";
import { slotAt } from "../lib/cube.js";
import { COLORS } from "../data/colors.js";

// Map each cell of an unfolded net to its cube sticker (SLOTS index). Centres are fixed.
// Net layout:   U
//            L  F  R  B
//               D
const FACES = ["U", "L", "F", "R", "B", "D"];
function cell(face, r, c) {
  switch (face) {
    case "F": return slotAt([c - 1, 1 - r, 1], [0, 0, 1]);
    case "U": return slotAt([c - 1, 1, r - 1], [0, 1, 0]);
    case "D": return slotAt([c - 1, -1, 1 - r], [0, -1, 0]);
    case "R": return slotAt([1, 1 - r, 1 - c], [1, 0, 0]);
    case "L": return slotAt([-1, 1 - r, c - 1], [-1, 0, 0]);
    default:  return slotAt([1 - c, 1 - r, -1], [0, 0, -1]); // B, seen from behind
  }
}
const GRID = Object.fromEntries(FACES.map((f) => [f, [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => cell(f, r, c)))]));
const CENTER = Object.fromEntries(FACES.map((f) => [f, GRID[f][4]]));

export default function NetEditor({ color, onPaint }) {
  return (
    <VStack className="net" role="group" aria-label="Cube net — click a sticker to paint it">
      {FACES.map((f) => (
        <VStack className={`net-face net-face--${f}`} key={f}>
          {GRID[f].map((slot) => {
            const fixed = slot === CENTER[f];
            return (
              <button
                key={slot}
                type="button"
                className={`net-cell ${fixed ? "net-cell--fixed" : ""}`}
                style={{ background: COLORS[color[slot]] || "var(--surface-2)" }}
                disabled={fixed}
                onClick={() => onPaint(slot)}
                aria-label={fixed ? `${f} centre` : `sticker ${slot}`}
              />
            );
          })}
        </VStack>
      ))}
    </VStack>
  );
}
