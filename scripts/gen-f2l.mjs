// Finds every F2L case for the front-right slot and picks a short, finger-trick friendly alg for each.
import { writeFileSync } from "node:fs";
import { SLOTS, solved, applyMoves, parseAlg, moveToString, invertMoves, caseState } from "../src/lib/cube.js";

const cubieOf = (i) => SLOTS[i].p.join(",");
const PAIR = new Set(["1,-1,1", "1,0,1"]);
const fixedIds = SLOTS.map((_, i) => i).filter((i) => SLOTS[i].p[1] <= 0 && !PAIR.has(cubieOf(i)));
const pairIds = SLOTS.map((_, i) => i).filter((i) => PAIR.has(cubieOf(i)));
const isCase = (loc) => fixedIds.every((id) => loc[id] === id);
const U = [1, 2, 3].map((a) => [{ face: "U", amount: a }]);
const canon = (loc) => {
  let best = pairIds.map((id) => loc[id]).join(",");
  for (const u of U) { const k = applyMoves(loc, u); const s = pairIds.map((id) => k[id]).join(","); if (s < best) best = s; }
  return best;
};

// Algs I know well; used when they solve a case.
const KNOWN = [
  "U R U' R'", "U' F' U F", "F' U' F", "R U R'", "U' R U R' U2 R U' R'", "U F' U' F U2 F' U F",
  "U' R U2 R' U2 R U' R'", "U F' U2 F U2 F' U F", "U' R U' R' U F' U' F", "U' R U R' U R U R'",
  "U F' U' F U' F' U' F", "U' R U2 R' U F' U' F", "R U' R' U R U' R' U2 R U' R'", "U F' U F U' F' U' F",
  "U' R U' R' U R U R'", "R U' R' U2 F' U' F", "R U2 R' U' R U R'", "F' U2 F U F' U' F", "U R U2 R' U R U' R'",
  "U' F' U2 F U' F' U F", "U2 R U R' U R U' R'", "U2 F' U' F U' F' U F", "U R U' R' U' R U' R' U R U' R'",
  "U2 R2 U2 R' U' R U' R2", "R U' R' U R U' R'", "F' U F U' F' U F", "R U R' U' R U R'", "F' U' F U F' U' F",
  "R U R' U' R U R' U' R U R'", "U' R U' R' U2 R U' R'", "U R U R' U2 R U R'", "U' R U R' U F' U' F",
  "R2 U2 F R2 F' U2 R' U R'", "R U' R' U' R U R' U2 R U' R'", "R U' R' U R U2 R' U R U' R'",
  "R U' R' U' R U R' U' R U2 R'", "R U R' U2 R U' R' U R U R'", "R U' R' U R U' R' U2 F' U' F",
  "U R U' R' U' F' U F", "U' F' U F U R U' R'", "U F' U' F U' R U R'", "R U' R' U' R U2 R' U R U' R'",
  "U R U2 R2 F R F'", "U' F' U2 F2 R' F' R", "R F U R U' R' F' U' R'", "R U F R U R' U' F' R'", "R U' R' d R' U2 R U2 R' U R",
  "R U2 R2 F R F'", "F' U2 F2 R' F' R", "U2 R U' R' U' F' U' F",
  // Standard algs for the awkward cases (R2/F2 and all) — these are the recognised solutions.
  "R' U2 R2 U R2 U R", "F' U F U2 R U R'", "R U R' F' U' F", "F2 U2 F U F' U F2", "F' U F R U2 R'",
];

const MOVES = ["R", "U", "F"].flatMap((f) => [1, 2, 3].map((a) => ({ face: f, amount: a })));
// Fingertrick cost: short is good; F turns and double turns on R/F need regrips; switching
// between the R hand and the F hand mid-alg (a regrip) is the slowest part of all.
const score = (ms) => {
  let s = ms.length;
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i];
    if (m.face === "F") s += 0.8;                         // F is less fingertrick-friendly than R/U
    if (m.amount === 2 && m.face !== "U") s += 0.5;       // R2/F2 are slower than quarter turns
    if (i > 0 && m.face !== "U" && ms[i - 1].face !== "U" && m.face !== ms[i - 1].face) s += 0.7; // R<->F regrip
  }
  return s;
};

const best = new Map(); // canon -> [{alg, score, known, len}] best-first, up to 3
const consider = (loc, moves, known) => {
  if (!isCase(loc) || pairIds.every((id) => loc[id] === id)) return;
  const k = canon(loc);
  const alg = moves.map(moveToString).join(" ");
  const sc = score(moves) - (known ? 2 : 0);
  let list = best.get(k);
  if (!list) { list = []; best.set(k, list); }
  if (list.some((c) => c.alg === alg)) return;
  list.push({ alg, score: sc, known, len: moves.length });
  list.sort((a, b) => a.score - b.score);
  if (list.length > 48) list.length = 48; // keep a wide pool; trimmed to distinct algs later
};

// Cancel adjacent same-face turns ("U U'" -> nothing, "U2 U2" -> nothing).
const simplify = (alg) => {
  let ms = parseAlg(alg), changed = true;
  while (changed) {
    changed = false; const out = [];
    for (const m of ms) {
      const last = out[out.length - 1];
      if (last && last.face === m.face) { const a = (last.amount + m.amount) % 4; out.pop(); if (a) out.push({ face: m.face, amount: a }); changed = true; }
      else out.push(m);
    }
    ms = out;
  }
  return ms.map(moveToString).join(" ");
};
for (const a of KNOWN) { const m = parseAlg(a); consider(applyMoves(solved(), invertMoves(m)), m, true); }

// BFS from solved; a path P reaches state S, so inverse(P) solves S.
let frontier = [{ loc: solved(), path: [] }];
const seen = new Set([solved().join(",")]);
for (let depth = 1; depth <= 8; depth++) {
  const next = [];
  for (const { loc, path } of frontier) for (const mv of MOVES) {
    const last = path[path.length - 1];
    if (last && last.face === mv.face) continue;
    const nl = applyMoves(loc, [mv]); const key = nl.join(",");
    if (seen.has(key)) continue; seen.add(key);
    const np = [...path, mv];
    consider(nl, invertMoves(np), false);
    next.push({ loc: nl, path: np });
  }
  frontier = next;
  console.error("depth", depth, frontier.length, "cases", best.size);
}

// Group by where the pieces are.
const cornerIds = pairIds.filter((i) => SLOTS[i].p[2] === 1 && SLOTS[i].p[1] === -1);
const whiteId = cornerIds.find((i) => SLOTS[i].n[1] === -1);
const cubeEdge = pairIds.filter((i) => SLOTS[i].p[1] === 0);
function group(loc) {
  const cornerInTop = SLOTS[loc[whiteId]].p[1] === 1;
  const edgeInTop = SLOTS[loc[cubeEdge[0]]].p[1] === 1;
  if (cornerInTop && edgeInTop) return SLOTS[loc[whiteId]].n[1] === 1 ? "White sticker on top" : "White sticker on the side";
  if (cornerInTop) return "Edge in slot";
  if (edgeInTop) return "Corner in slot";
  return "Both in slot";
}
const ORDER = ["White sticker on the side", "White sticker on top", "Corner in slot", "Edge in slot", "Both in slot"];
// Align every alternative to the primary's exact scramble (add an AUF) so all algs of a
// case solve the same diagram, not just the same case up to a U turn.
const AUF = ["", "U ", "U2 ", "U' "];
const isSolvedState = (loc) => loc.every((s, id) => s === id);
const cases = [...best.values()].map((list) => {
  const primary = list[0];
  const scr = applyMoves(solved(), invertMoves(parseAlg(primary.alg)));
  const algs = []; const seen = new Set();
  for (const cand of list) {                 // align each to the primary's scramble, simplify, keep distinct
    let aligned = null;
    for (const u of AUF) if (isSolvedState(applyMoves(scr, parseAlg(u + cand.alg)))) { aligned = simplify(u + cand.alg); break; }
    if (!aligned || seen.has(aligned)) continue;
    seen.add(aligned);
    algs.push({ alg: aligned, label: algs.length === 0 ? "Standard" : `Alt ${algs.length}` });
    if (algs.length === 3) break;
  }
  return { algs, group: group(caseState(primary.alg)), len: parseAlg(algs[0].alg).length, known: primary.known };
}).sort((a, b) => ORDER.indexOf(a.group) - ORDER.indexOf(b.group) || a.len - b.len);
const f2l = cases.map((c, i) => ({ id: `f2l-${i + 1}`, name: `F2L ${i + 1}`, group: c.group, alg: c.algs[0].alg, algs: c.algs, slot: "FR", generated: !c.known }));

// Advanced: every R/U/F case mirrored into each of the other three slots (no cube rotation).
const MIRROR = {
  FL: { R: ["L", true], U: ["U", true], F: ["F", true] },
  BR: { R: ["R", true], U: ["U", true], F: ["B", true] },
  BL: { R: ["L", false], U: ["U", false], F: ["B", false] },
};
const mirror = (alg, slot) => parseAlg(alg).map(({ face, amount }) => {
  const [nf, flip] = MIRROR[slot][face];
  return moveToString({ face: nf, amount: flip ? (4 - amount) % 4 : amount });
}).join(" ");
const isRUF = (alg) => /^[RUF2' ]+$/.test(alg);
const SLOTNAME = { FL: "Front-left slot", BR: "Back-right slot", BL: "Back-left slot" };
const adv = [];
for (const slot of ["FL", "BR", "BL"]) for (const c of f2l) {
  const src = c.algs.map((a) => a.alg).find(isRUF);  // mirror a pure R/U/F solution
  if (!src) continue;
  const malg = mirror(src, slot);
  adv.push({ id: `af2l-${slot.toLowerCase()}-${c.id.split("-")[1]}`, name: `${c.name} · ${slot}`, group: SLOTNAME[slot], alg: malg, algs: [{ alg: malg, label: "Standard" }], slot, basedOn: c.id });
}

// sanity: each advanced alg must only disturb its own slot's pair
for (const c of adv) {
  const st = caseState(c.alg);
  const bad = SLOTS.map((_, i) => i).filter((id) => SLOTS[id].p[1] <= 0 && st[id] !== id).map(cubieOf);
  const allowed = { FL: ["-1,-1,1", "-1,0,1"], BR: ["1,-1,-1", "1,0,-1"], BL: ["-1,-1,-1", "-1,0,-1"] }[c.slot];
  if (bad.some((b) => !allowed.includes(b))) console.error("BAD MIRROR", c.name, c.alg);
}
writeFileSync(new URL("../src/data/f2l.json", import.meta.url), JSON.stringify({ f2l, advanced: adv }, null, 1));
console.error("f2l", f2l.length, "generated", f2l.filter((c) => c.generated).length, "advanced", adv.length);
for (const c of f2l) console.error(c.id, c.group, "|", c.alg, c.generated ? "(gen)" : "");
