import { SLOTS, solved, applyAlg, caseState, facelets } from "../src/lib/cube.js";
import { OLL, PLL } from "../src/data/ll.js";
const isLL = (i) => SLOTS[i].p[1] === 1;
const AUF = ["", "U", "U2", "U'"];
const f2lSolved = (loc) => loc.every((slot, id) => isLL(id) || slot === id);
const oriented = (loc) => f2lSolved(loc) && loc.every((slot, id) => !(isLL(id) && SLOTS[id].n[1] === 1) || SLOTS[slot].n[1] === 1);
const upSlots = SLOTS.map((_, i) => i).filter((i) => isLL(i));
const ollSig = (loc) => { const f = facelets(loc); return upSlots.map((s) => (SLOTS[f[s]].n[1] === 1 ? 1 : 0)).join(""); };
const pllSig = (loc) => { const f = facelets(loc); return upSlots.map((s) => f[s]).join(","); };
function check(set, ok, sig) {
  const seen = new Map(); let bad = 0;
  for (const c of set) {
    const st = caseState(c.alg);
    if (!ok(st)) { console.log("INVALID", c.name, c.alg); bad++; continue; }
    let best = null;
    for (const a of AUF) for (const b of AUF) {
      const s = sig(applyAlg(applyAlg(applyAlg(solved(), a), ""), "") && applyAlg(applyAlg(st, a), "")); // pre-AUF only
      const s2 = sig(applyAlg(applyAlg(applyAlg(solved(), b + " " ), ""), "")) ; void s2;
      if (best === null || s < best) best = s;
    }
    if (seen.has(best)) { console.log("DUP", c.name, "=", seen.get(best)); bad++; }
    seen.set(best, c.name);
  }
  console.log(set.length, "checked, problems:", bad);
}
check(OLL, f2lSolved, ollSig);
// PLL signature must be invariant to both pre and post AUF: conjugate-normalize
function pllCanon(st) {
  let best = null;
  for (const a of AUF) for (const b of AUF) {
    // relabel: apply pre-AUF a to state, then compare permutation after relabeling by b
    const t = applyAlg(applyAlg(st, a), "");
    const relabel = applyAlg(solved(), b); // where solved sticker goes under b
    const f = facelets(t).map((id) => relabel[id]);
    const s = upSlots.map((x) => f[x]).join(",");
    if (best === null || s < best) best = s;
  }
  return best;
}
const seen = new Map(); let bad = 0;
for (const c of PLL) {
  const st = caseState(c.alg);
  if (!oriented(st)) { console.log("INVALID", c.name); bad++; continue; }
  const k = pllCanon(st);
  if (seen.has(k)) { console.log("DUP", c.name, seen.get(k)); bad++; }
  seen.set(k, c.name);
}
console.log(PLL.length, "PLL checked, problems:", bad);
