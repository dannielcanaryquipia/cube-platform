import { VStack } from "@astryxdesign/core/Stack";
import { fingersFor, describeFingers } from "../data/fingers.js";

// A right hand drawn fingers-up; the left hand is the same shape flipped.
// finger ids: 0 thumb · 1 index · 2 middle · 3 ring · 4 pinky.
const FINGERS = [
  { i: 0, x: 8, y: 70, w: 13, h: 34, rot: "rotate(-26 15 104)" },
  { i: 1, x: 30, y: 32, w: 12, h: 46 },
  { i: 2, x: 44, y: 22, w: 12, h: 56 },
  { i: 3, x: 58, y: 28, w: 12, h: 50 },
  { i: 4, x: 72, y: 40, w: 12, h: 38 },
];
const ALL = new Set([0, 1, 2, 3, 4]);

function HandShape({ flip, active }) {
  return (
    <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
      <rect x="24" y="64" width="60" height="54" rx="16" style={{ fill: "var(--surface-2)", stroke: "var(--line)", strokeWidth: 1.5 }} />
      {FINGERS.map((f) => (
        <rect key={f.i}
          x={f.x} y={f.y} width={f.w} height={f.h} rx="6.5" transform={f.rot}
          className={`hand-finger ${active.has(f.i) ? "hand-finger--on" : ""}`}
          style={{ fill: active.has(f.i) ? "var(--accent)" : "var(--surface-2)", stroke: active.has(f.i) ? "var(--accent)" : "var(--line)", strokeWidth: 1.5, transition: "fill .15s, stroke .15s" }} />
      ))}
    </g>
  );
}

export default function Hands({ move }) {
  const act = fingersFor(move);
  const whole = act.some((a) => a.finger === -1);
  const L = new Set(), R = new Set();
  if (!whole) act.forEach((a) => (a.hand === "L" ? L : R).add(a.finger));
  return (
    <VStack className="hands">
      <svg viewBox="0 0 220 146" className="hands__svg" role="img"
        aria-label={move ? `${move}: ${describeFingers(move)}` : "cube solved"}>
        <g><HandShape flip active={whole ? ALL : L} /></g>
        <g transform="translate(120 0)"><HandShape active={whole ? ALL : R} /></g>
        <text x="50" y="140" style={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--sans)", textAnchor: "middle", textTransform: "uppercase", letterSpacing: "0.05em" }}>left</text>
        <text x="170" y="140" style={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--sans)", textAnchor: "middle", textTransform: "uppercase", letterSpacing: "0.05em" }}>right</text>
      </svg>
      <p className="hands__label">
        {move ? <><b className="mono">{move}</b> — {describeFingers(move)}</> : "Cube solved — nicely done"}
      </p>
    </VStack>
  );
}
