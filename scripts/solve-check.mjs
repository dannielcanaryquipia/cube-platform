// End-to-end solver check: scramble -> solve -> replay -> must be solved.
import { solved, applyMoves, applyAlg, normalize } from "../src/lib/cube.js";
import { isSolved } from "../src/lib/recognize.js";
import { solve, reconstruct, solveCube, colorsOf } from "../src/lib/solve.js";

const FACES = ["U", "D", "L", "R", "F", "B"];
const scramble = (n = 25) => {
  const moves = [];
  let last = "";
  for (let i = 0; i < n; i++) {
    let f; do { f = FACES[(Math.random() * 6) | 0]; } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return moves;
};

const N = Number(process.argv[2] || 300);
let bad = 0, maxMoves = 0, sumMoves = 0, maxMs = 0;
for (let i = 0; i < N; i++) {
  const scr = applyMoves(solved(), scramble());
  const t0 = performance.now();
  let res;
  try { res = solve(scr); } catch (e) { console.log("THREW", e.message); bad++; continue; }
  const ms = performance.now() - t0;
  maxMs = Math.max(maxMs, ms);
  const end = applyAlg(scr, res.alg);
  if (!isSolved(normalize(end))) { console.log("NOT SOLVED after", res.alg); bad++; continue; }
  maxMoves = Math.max(maxMoves, res.moveCount);
  sumMoves += res.moveCount;
}
console.log(`solve: ${N} scrambles, failures: ${bad}, avg ${(sumMoves / N).toFixed(1)} moves, max ${maxMoves}, slowest ${maxMs.toFixed(0)}ms`);

// Reconstruct round-trip + parity rejection.
let rbad = 0;
for (let i = 0; i < 200; i++) {
  const scr = applyMoves(solved(), scramble());
  const r = reconstruct(colorsOf(scr));
  if (r.error) { console.log("RECON ERROR on valid state:", r.error); rbad++; continue; }
  if (!r.loc.every((v, j) => v === scr[j])) { console.log("RECON MISMATCH"); rbad++; }
}
// Deliberately corrupt: swap two stickers' colours -> should be rejected.
const good = colorsOf(applyMoves(solved(), scramble()));
const corrupt = good.slice();
// twist a corner by rotating its three sticker colours impossibly: find a corner's slots
import { SLOTS } from "../src/lib/cube.js";
const cornerPos = SLOTS.map((s) => s.p).find((p) => p.every((v) => v !== 0));
const cs = SLOTS.map((_, i) => i).filter((i) => SLOTS[i].p.join() === cornerPos.join());
[corrupt[cs[0]], corrupt[cs[1]], corrupt[cs[2]]] = [corrupt[cs[1]], corrupt[cs[2]], corrupt[cs[0]]];
const cr = solveCube(corrupt);
console.log(`reconstruct: round-trip failures: ${rbad}; twisted-corner rejected: ${cr.error ? "yes" : "NO (BUG)"}`);
