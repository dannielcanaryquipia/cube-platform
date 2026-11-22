// Small 3x3 sticker model used for case images and for checking algorithms.
// Axes: x = right (R), y = up (U), z = front (F). White cross on D, yellow on U, green on F.

const VALS = [-1, 0, 1];
export const SLOTS = []; // { p:[x,y,z], n:[nx,ny,nz] }
for (const x of VALS) for (const y of VALS) for (const z of VALS) {
  const p = [x, y, z];
  for (let a = 0; a < 3; a++) {
    if (p[a] === 0) continue;
    const n = [0, 0, 0];
    n[a] = p[a];
    SLOTS.push({ p, n });
  }
}
const keyOf = (p, n) => `${p.join(",")}|${n.join(",")}`;
const SLOT_INDEX = new Map(SLOTS.map((s, i) => [keyOf(s.p, s.n), i]));

function rot(v, axis, s) {
  const [x, y, z] = v;
  if (axis === 0) return [x, -s * z, s * y];
  if (axis === 1) return [s * z, y, -s * x];
  return [-s * y, s * x, z];
}

const ALL = [-1, 0, 1];
const DEFS = {
  R: [0, [1], -1], L: [0, [-1], 1], M: [0, [0], 1], x: [0, ALL, -1], r: [0, [0, 1], -1], l: [0, [-1, 0], 1],
  U: [1, [1], -1], D: [1, [-1], 1], E: [1, [0], 1], y: [1, ALL, -1], u: [1, [0, 1], -1], d: [1, [-1, 0], 1],
  F: [2, [1], -1], B: [2, [-1], 1], S: [2, [0], -1], z: [2, ALL, -1], f: [2, [0, 1], -1], b: [2, [-1, 0], 1],
};

const PERMS = {};
for (const [name, [axis, layers, s]] of Object.entries(DEFS)) {
  PERMS[name] = SLOTS.map(({ p, n }) =>
    layers.includes(p[axis]) ? SLOT_INDEX.get(keyOf(rot(p, axis, s), rot(n, axis, s))) : SLOT_INDEX.get(keyOf(p, n)));
}

// Parse "R U R' U' (r U2) Rw x2'" into [{face, amount}] with amount in {1,2,3}.
export function parseAlg(alg) {
  const out = [];
  const re = /([URFDLBMESxyz])(w?)(\d*)('?)|([urfdlb])(\d*)('?)/g;
  const clean = alg.replace(/[()[\]]/g, " ");
  let m;
  while ((m = re.exec(clean))) {
    let face, num, prime;
    if (m[1]) { face = m[2] ? m[1].toLowerCase() : m[1]; num = m[3]; prime = m[4]; }
    else { face = m[5]; num = m[6]; prime = m[7]; }
    let amt = (num ? parseInt(num, 10) : 1) * (prime ? -1 : 1);
    amt = ((amt % 4) + 4) % 4;
    if (amt) out.push({ face, amount: amt });
  }
  return out;
}
export const moveToString = ({ face, amount }) => face + (amount === 2 ? "2" : amount === 3 ? "'" : "");
export const movesToString = (moves) => moves.map(moveToString).join(" ");
export const invertMoves = (moves) => moves.slice().reverse().map((m) => ({ face: m.face, amount: (4 - m.amount) % 4 }));

// Mirror across the plane between L and R. R<->L (and r<->l) swap faces; every move reverses
// direction EXCEPT M and x, which keep their own letter so their direction is unchanged.
// e.g. "R U R' U'" -> "L' U' L U" (the left-hand sexy move); "M" -> "M"; "x" -> "x".
const MIRROR_FACE = { R: "L", L: "R", r: "l", l: "r" };
const MIRROR_KEEPS_DIR = new Set(["M", "x"]);
export const mirrorMoves = (moves) => moves.map(({ face, amount }) => ({
  face: MIRROR_FACE[face] || face,
  amount: MIRROR_KEEPS_DIR.has(face) ? amount : (4 - amount) % 4,
}));
export const mirrorAlg = (alg) => movesToString(mirrorMoves(parseAlg(alg)));

// loc[stickerId] = slot where that sticker currently sits. Sticker ids = their solved slot.
export const solved = () => SLOTS.map((_, i) => i);
export function applyMoves(loc, moves) {
  let cur = loc.slice();
  for (const { face, amount } of moves) {
    const perm = PERMS[face];
    for (let k = 0; k < amount; k++) for (let i = 0; i < cur.length; i++) cur[i] = perm[cur[i]];
  }
  return cur;
}
export const applyAlg = (loc, alg) => applyMoves(loc, parseAlg(alg));
export const caseFromAlg = (alg) => applyMoves(solved(), invertMoves(parseAlg(alg)));

// facelets: slot -> original sticker id
export function facelets(loc) {
  const f = new Array(loc.length);
  loc.forEach((slot, id) => { f[slot] = id; });
  return f;
}

export const FACE_COLOR = { "0,1,0": "U", "0,-1,0": "D", "0,0,1": "F", "0,0,-1": "B", "1,0,0": "R", "-1,0,0": "L" };
export const faceOfSlot = (i) => FACE_COLOR[SLOTS[i].n.join(",")];
export const slotAt = (p, n) => SLOT_INDEX.get(keyOf(p, n));

// Rotate the whole cube so centres are back home (algs with y, d, x... leave the cube turned).
const ROTS = [];
for (const a of ["", "x", "x2", "x'", "z", "z'"]) for (const b of ["", "y", "y2", "y'"]) ROTS.push(`${a} ${b}`);
const isCenter = (i) => SLOTS[i].p.filter((v) => v !== 0).length === 1;
export function normalize(loc) {
  for (const r of ROTS) {
    const t = applyAlg(loc, r);
    if (t.every((slot, id) => !isCenter(id) || slot === id)) return t;
  }
  return loc;
}
export const caseState = (alg) => normalize(caseFromAlg(alg));
