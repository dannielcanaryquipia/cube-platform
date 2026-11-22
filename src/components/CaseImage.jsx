import { memo, useMemo } from "react";
import { SLOTS, caseState, facelets, faceOfSlot, slotAt } from "../lib/cube.js";
import { COLORS } from "../data/colors.js";

const isLLPiece = (id) => SLOTS[id].p[1] === 1;

function LastLayer({ alg, mode }) {
  const { cells, arrows } = useMemo(() => {
    const loc = caseState(alg);
    const f = facelets(loc);
    const color = (slot) => {
      const id = f[slot];
      const face = faceOfSlot(id);
      if (mode === "oll") return face === "U" ? COLORS.U : COLORS.X;
      return COLORS[face];
    };
    const S = 26, G = 3, T = 9, O = T + G + 2;
    const cells = [];
    for (const x of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
      const slot = slotAt([x, 1, z], [0, 1, 0]);
      cells.push({ x: O + (x + 1) * (S + G), y: O + (z + 1) * (S + G), w: S, h: S, fill: color(slot) });
      const edgeLen = 3 * S + 2 * G;
      if (z === -1) cells.push({ x: O + (x + 1) * (S + G), y: O - T - G, w: S, h: T, fill: color(slotAt([x, 1, z], [0, 0, -1])) });
      if (z === 1) cells.push({ x: O + (x + 1) * (S + G), y: O + edgeLen + G, w: S, h: T, fill: color(slotAt([x, 1, z], [0, 0, 1])) });
      if (x === -1) cells.push({ x: O - T - G, y: O + (z + 1) * (S + G), w: T, h: S, fill: color(slotAt([x, 1, z], [-1, 0, 0])) });
      if (x === 1) cells.push({ x: O + edgeLen + G, y: O + (z + 1) * (S + G), w: T, h: S, fill: color(slotAt([x, 1, z], [1, 0, 0])) });
    }
    const arrows = [];
    if (mode === "pll") {
      // For each top sticker of a top-layer piece: it sits at loc[id] now and belongs at id.
      SLOTS.forEach((s, id) => {
        if (!isLLPiece(id) || s.n[1] !== 1 || (s.p[0] === 0 && s.p[2] === 0)) return;
        const from = SLOTS[loc[id]].p;
        if (from[0] === s.p[0] && from[2] === s.p[2]) return;
        const c = (p) => [O + (p[0] + 1) * (S + G) + S / 2, O + (p[2] + 1) * (S + G) + S / 2];
        arrows.push({ a: c(from), b: c(s.p) });
      });
    }
    return { cells, arrows };
  }, [alg, mode]);

  return (
    <svg viewBox="0 0 118 118" className="case-svg" role="img" aria-label="Top view of the case">
      <defs>
        <marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#1b1f27" />
        </marker>
      </defs>
      {cells.map((c, i) => <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} rx="3" fill={c.fill} />)}
      {arrows.map(({ a, b }, i) => {
        const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), k = 7 / len;
        return <line key={i} x1={a[0] + dx * k} y1={a[1] + dy * k} x2={b[0] - dx * k} y2={b[1] - dy * k}
          stroke="#1b1f27" strokeWidth="2.4" strokeLinecap="round" markerEnd="url(#ah)" />;
      })}
    </svg>
  );
}

const VIEW = { FR: [1, 1], FL: [-1, 1], BR: [1, -1], BL: [-1, -1] };
const PAIR = { FR: ["1,-1,1", "1,0,1"], FL: ["-1,-1,1", "-1,0,1"], BR: ["1,-1,-1", "1,0,-1"], BL: ["-1,-1,-1", "-1,0,-1"] };

function FirstTwoLayers({ alg, slot = "FR" }) {
  const polys = useMemo(() => {
    const loc = caseState(alg);
    const f = facelets(loc);
    const [vx, vz] = VIEW[slot];
    const pair = PAIR[slot];
    const proj = ([x, y, z]) => [(vz * x - vx * z) * 0.866 * 15, ((vx * x + vz * z) * 0.5 - y) * 15];
    const out = [];
    SLOTS.forEach(({ p, n }, s) => {
      const visible = n[1] === 1 || n[0] === vx || n[2] === vz;
      if (!visible) return;
      const id = f[s];
      const home = SLOTS[id].p.join(",");
      const colored = pair.includes(home) || !isLLPiece(id);
      const fill = colored ? COLORS[faceOfSlot(id)] : COLORS.X;
      const c = p.map((v, i) => v + n[i] * 0.5);
      const ax = [0, 1, 2].filter((i) => n[i] === 0);
      const h = 0.44;
      const pts = [[h, h], [h, -h], [-h, -h], [-h, h]].map(([a, b]) => {
        const q = c.slice(); q[ax[0]] += a; q[ax[1]] += b; return proj(q);
      });
      out.push({ pts: pts.map((q) => q.join(",")).join(" "), fill, dim: colored && !pair.includes(home) });
    });
    return out;
  }, [alg, slot]);
  return (
    <svg viewBox="-42 -46 84 92" className="case-svg" role="img" aria-label="3D view of the F2L case">
      {polys.map((p, i) => <polygon key={i} points={p.pts} fill={p.fill} opacity={p.dim ? 0.55 : 1} stroke="rgba(0,0,0,.18)" strokeWidth=".5" strokeLinejoin="round" />)}
    </svg>
  );
}

export default memo(function CaseImage({ alg, view, slot }) {
  if (view === "f2l") return <FirstTwoLayers alg={alg} slot={slot} />;
  return <LastLayer alg={alg} mode={view} />;
});
