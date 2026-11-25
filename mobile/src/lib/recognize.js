// Last-layer recognition: predicates, signatures and a left-hand alternate finder.
// Shared by the case pages (alternate algs), the verifier and the CFOP solver.
import { SLOTS, solved, applyAlg, caseState, facelets, mirrorAlg, normalize } from "./cube.js";

export const AUF = ["", "U", "U2", "U'"];
const withAuf = (a, alg) => (a ? a + " " : "") + alg;

export const isLL = (i) => SLOTS[i].p[1] === 1;              // piece sits in the top layer
export const upSlots = SLOTS.map((_, i) => i).filter(isLL);  // every sticker of a top-layer piece

export const isSolved = (loc) => loc.every((slot, id) => slot === id);
export const f2lSolved = (loc) => loc.every((slot, id) => isLL(id) || slot === id);
// F2L done and every top-layer piece's up-sticker actually faces up.
export const oriented = (loc) =>
  f2lSolved(loc) && upSlots.every((id) => SLOTS[id].n[1] !== 1 || SLOTS[loc[id]].n[1] === 1);

// OLL signature: for each top-layer sticker slot, 1 if a yellow (U-home) sticker shows there.
// Invariant to last-layer permutation, so it names the orientation case regardless of AUF offset.
export const ollSig = (loc) => { const f = facelets(loc); return upSlots.map((s) => (SLOTS[f[s]].n[1] === 1 ? 1 : 0)).join(""); };
export const ollKey = (loc) => AUF.map((a) => ollSig(applyAlg(loc, a))).sort()[0];

// PLL signature: where each top-layer sticker sits, canonicalised over pre- and post-AUF.
export function pllKey(loc) {
  let best = null;
  for (const a of AUF) for (const b of AUF) {
    const t = applyAlg(loc, a);
    const relabel = applyAlg(solved(), b);      // where a solved sticker lands under post-AUF b
    const f = facelets(t).map((id) => relabel[id]);
    const s = upSlots.map((x) => f[x]).join(",");
    if (best === null || s < best) best = s;
  }
  return best;
}

// Find a left-hand algorithm for a case: the mirror of the alg that solves its mirror case.
// We scan every case's mirrored alg and keep the one that actually solves THIS case's state.
// kind "oll" only needs to orient; kind "pll" must fully solve (pre- and post-AUF allowed).
export function altFor(c, cases, kind) {
  const start = caseState(c.alg);
  // Alts may use M-slices or rotations that leave the cube re-oriented; normalise before testing.
  for (const d of cases) {
    const m = mirrorAlg(d.alg);
    if (kind === "oll") {
      for (const a of AUF) if (oriented(normalize(applyAlg(start, withAuf(a, m))))) return withAuf(a, m).trim();
    } else {
      for (const a of AUF) for (const b of AUF) {
        const seq = withAuf(a, b ? m + " " + b : m);
        if (isSolved(normalize(applyAlg(start, seq)))) return seq.trim();
      }
    }
  }
  return null;
}
