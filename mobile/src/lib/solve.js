// A staged CFOP solver: Cross -> F2L -> OLL -> PLL.
// Cross and F2L are found by IDA* (clean face-move solutions, computer-shortest, not hand-tuned).
// OLL and PLL reuse the site's own verified algorithm sets, so those stages are the taught algs.
import { SLOTS, solved, applyMoves, applyAlg, parseAlg, moveToString, movesToString, normalize, faceOfSlot, facelets } from "./cube.js";
import { AUF, oriented, isSolved } from "./recognize.js";
import { OLL, PLL } from "../data/ll.js";

// ---- Piece geometry ---------------------------------------------------------
const posKey = (p) => p.join(",");
const homeIdsByPos = new Map();
SLOTS.forEach(({ p }, i) => {
  const k = posKey(p);
  if (!homeIdsByPos.has(k)) homeIdsByPos.set(k, []);
  homeIdsByPos.get(k).push(i);
});
const idsAt = (p) => homeIdsByPos.get(posKey(p));

// White cross lives on D (bottom). Its four edges:
const CROSS = [[0, -1, 1], [1, -1, 0], [0, -1, -1], [-1, -1, 0]].map(idsAt);
// F2L pairs: a bottom (white) corner + its middle-layer edge, per slot.
const PAIRS = [
  { corner: [1, -1, 1], edge: [1, 0, 1] },   // front-right
  { corner: [-1, -1, 1], edge: [-1, 0, 1] }, // front-left
  { corner: [1, -1, -1], edge: [1, 0, -1] }, // back-right
  { corner: [-1, -1, -1], edge: [-1, 0, -1] },
].map(({ corner, edge }) => [idsAt(corner), idsAt(edge)]);

// ---- IDA* over face moves (typed arrays, integer keys for speed) ------------
const FACES = ["U", "D", "L", "R", "F", "B"];
const MOVES = FACES.flatMap((f) => [1, 2, 3].map((amount) => ({ face: f, amount })));
const AXIS = { U: 0, D: 0, L: 1, R: 1, F: 2, B: 2 };
const ORD = { U: 0, D: 1, L: 0, R: 1, F: 0, B: 1 }; // canonical order on each axis
const IDENTITY = Int16Array.from(solved());
// Full permutation for each move: applying it means out[i] = PERM[loc[i]].
const PERMS = MOVES.map((mv) => Int16Array.from(applyMoves(solved(), [mv])));
// Encode a piece's current location as one integer (6 bits per sticker, <=3 stickers).
const enc = (loc, ids) => ids.length === 3
  ? (loc[ids[0]] << 12) | (loc[ids[1]] << 6) | loc[ids[2]]
  : (loc[ids[0]] << 6) | loc[ids[1]];

// Distance-to-home table for a single piece (<=24 states), by BFS from solved.
function distTable(ids) {
  const table = new Int8Array(1 << 18).fill(-1);
  table[enc(IDENTITY, ids)] = 0;
  let frontier = [IDENTITY], d = 0;
  while (frontier.length) {
    const next = [];
    for (const loc of frontier) for (const perm of PERMS) {
      const nl = new Int16Array(54);
      for (let i = 0; i < 54; i++) nl[i] = perm[loc[i]];
      const k = enc(nl, ids);
      if (table[k] < 0) { table[k] = d + 1; next.push(nl); }
    }
    frontier = next; d++;
  }
  return table;
}
const pieceOf = (ids) => ({ ids, table: distTable(ids), solvedKey: enc(IDENTITY, ids) });

// Solve so that every piece in `pieces` is home, by IDA*. Returns a move list.
function idaSolve(startLoc, pieces, greedy = false) {
  const n = pieces.length;
  const tabs = pieces.map((p) => p.table), idss = pieces.map((p) => p.ids), goals = pieces.map((p) => p.solvedKey);
  const h = (loc) => {
    let m = 0, s = 0;
    for (let i = 0; i < n; i++) { const d = tabs[i][enc(loc, idss[i])]; if (d > m) m = d; s += d; }
    return greedy ? Math.max(m, Math.ceil(s / 2)) : m;
  };
  const goal = (loc) => { for (let i = 0; i < n; i++) if (enc(loc, idss[i]) !== goals[i]) return false; return true; };
  const buf = []; for (let i = 0; i < 48; i++) buf.push(new Int16Array(54));
  const path = [];
  const dfs = (loc, g, bound, prevFace) => {
    const f = g + h(loc);
    if (f > bound) return f;
    if (goal(loc)) return "FOUND";
    let min = Infinity;
    for (let mi = 0; mi < 18; mi++) {
      const mv = MOVES[mi];
      if (mv.face === prevFace) continue;                                              // no two turns of one face
      if (prevFace && AXIS[mv.face] === AXIS[prevFace] && ORD[mv.face] < ORD[prevFace]) continue; // commuting pair: fix order
      const perm = PERMS[mi], nl = buf[g];
      for (let i = 0; i < 54; i++) nl[i] = perm[loc[i]];
      path.push(mv);
      const t = dfs(nl, g + 1, bound, mv.face);
      if (t === "FOUND") return "FOUND";
      if (t < min) min = t;
      path.pop();
    }
    return min;
  };
  const start = Int16Array.from(startLoc);
  let bound = h(start);
  for (let guard = 0; guard < 40; guard++) {
    const t = dfs(start, 0, bound, null);
    if (t === "FOUND") return path.slice();
    if (t === Infinity) throw new Error("no solution");
    bound = t;
  }
  throw new Error("search too deep");
}

// ---- Last layer via the verified case sets ----------------------------------
function solveOLL(loc) {
  if (oriented(normalize(loc))) return { alg: "", id: null, name: "Already oriented" };
  for (const a of AUF) for (const c of OLL) {
    const seq = (a ? a + " " : "") + c.alg;
    if (oriented(normalize(applyAlg(loc, seq)))) return { alg: seq.trim(), id: c.id, name: c.name };
  }
  return null;
}
function solvePLL(loc) {
  for (const a of AUF) {
    if (isSolved(normalize(applyAlg(loc, a)))) return { alg: a, id: null, name: a ? "Final AUF" : "Already solved" };
  }
  for (const a of AUF) for (const c of PLL) for (const b of AUF) {
    const seq = [a, c.alg, b].filter(Boolean).join(" ");
    if (isSolved(normalize(applyAlg(loc, seq)))) return { alg: seq.trim(), id: c.id, name: c.name };
  }
  return null;
}

// ---- Public solve -----------------------------------------------------------
// Lazily built because the tables cost a moment; reused across solves.
let PIECES = null;
const yieldToUI = () => new Promise((r) => setTimeout(r, 0));

function pieces() {
  if (!PIECES) PIECES = { cross: CROSS.map(pieceOf), pairs: PAIRS.map(([c, e]) => [pieceOf(c), pieceOf(e)]) };
  return PIECES;
}

/** Build IDA* tables one piece at a time so Hermes can paint "Solving…". */
export async function ensureTablesAsync(onProgress) {
  if (PIECES) return PIECES;
  onProgress?.("Preparing solver…");
  const cross = [];
  for (const ids of CROSS) {
    await yieldToUI();
    cross.push(pieceOf(ids));
  }
  const pairs = [];
  for (const [c, e] of PAIRS) {
    await yieldToUI();
    onProgress?.("Preparing F2L tables…");
    pairs.push([pieceOf(c), pieceOf(e)]);
  }
  PIECES = { cross, pairs };
  return PIECES;
}

function runStage(loc, pieceSet, greedy, label, meta = {}) {
  const moves = idaSolve(loc, pieceSet, greedy);
  const next = applyMoves(loc, moves);
  const stage = { stage: label, alg: movesToString(moves), moves: moves.map(moveToString), ...meta };
  return { loc: next, stage };
}

export function solve(startLoc) {
  const P = pieces();
  const stages = [];
  let loc = startLoc.slice();

  const first = runStage(loc, P.cross, false, "Cross");
  loc = first.loc;
  stages.push(first.stage);

  const solvedSoFar = [...P.cross];
  P.pairs.forEach(([corner, edge], i) => {
    solvedSoFar.push(corner, edge);
    const step = runStage(loc, solvedSoFar.slice(), true, `F2L ${i + 1}`);
    loc = step.loc;
    stages.push(step.stage);
  });

  const oll = solveOLL(loc);
  if (!oll) throw new Error("Not a solvable cube (OLL)");
  loc = applyAlg(loc, oll.alg);
  stages.push({ stage: "OLL", alg: oll.alg, moves: parseAlg(oll.alg).map(moveToString), caseId: oll.id, caseName: oll.name });

  const pll = solvePLL(loc);
  if (!pll) throw new Error("Not a solvable cube (PLL)");
  loc = applyAlg(loc, pll.alg);
  stages.push({ stage: "PLL", alg: pll.alg, moves: parseAlg(pll.alg).map(moveToString), caseId: pll.id, caseName: pll.name });

  if (!isSolved(normalize(loc))) throw new Error("Not a solvable cube");
  const full = stages.map((s) => s.alg).filter(Boolean).join(" ");
  return { stages, alg: full, moveCount: parseAlg(full).length };
}

export async function solveAsync(startLoc, onProgress) {
  const P = await ensureTablesAsync(onProgress);
  const stages = [];
  let loc = startLoc.slice();

  onProgress?.("Solving cross…");
  await yieldToUI();
  const cross = runStage(loc, P.cross, false, "Cross");
  loc = cross.loc;
  stages.push(cross.stage);

  const solvedSoFar = [...P.cross];
  for (let i = 0; i < P.pairs.length; i++) {
    const [corner, edge] = P.pairs[i];
    solvedSoFar.push(corner, edge);
    onProgress?.(`Solving F2L ${i + 1}…`);
    await yieldToUI();
    const step = runStage(loc, solvedSoFar.slice(), true, `F2L ${i + 1}`);
    loc = step.loc;
    stages.push(step.stage);
  }

  onProgress?.("Matching OLL…");
  await yieldToUI();
  const oll = solveOLL(loc);
  if (!oll) throw new Error("Not a solvable cube (OLL)");
  loc = applyAlg(loc, oll.alg);
  stages.push({ stage: "OLL", alg: oll.alg, moves: parseAlg(oll.alg).map(moveToString), caseId: oll.id, caseName: oll.name });

  onProgress?.("Matching PLL…");
  await yieldToUI();
  const pll = solvePLL(loc);
  if (!pll) throw new Error("Not a solvable cube (PLL)");
  loc = applyAlg(loc, pll.alg);
  stages.push({ stage: "PLL", alg: pll.alg, moves: parseAlg(pll.alg).map(moveToString), caseId: pll.id, caseName: pll.name });

  if (!isSolved(normalize(loc))) throw new Error("Not a solvable cube");
  const full = stages.map((s) => s.alg).filter(Boolean).join(" ");
  return { stages, alg: full, moveCount: parseAlg(full).length };
}

// Just the cross solution (white edges on D), as a move string. Used by the Cross lesson.
export function solveCross(startLoc) {
  return movesToString(idaSolve(startLoc.slice(), pieces().cross));
}

export async function solveCrossAsync(startLoc, onProgress) {
  const P = await ensureTablesAsync(onProgress);
  onProgress?.("Solving cross…");
  await yieldToUI();
  return movesToString(idaSolve(startLoc.slice(), P.cross));
}

// ---- Reconstruct a cube state from painted colours --------------------------
// color: array of 54 face letters (U/D/F/B/R/L) indexed by SLOTS order.
// Returns { loc } or { error } with a human-readable reason.
const SOLVED_SET = new Map();           // sorted colour-set of each piece -> that piece's home position
(() => {
  for (const [k, ids] of homeIdsByPos) {
    const set = ids.map((id) => faceOfSlot(id)).sort().join("");
    SOLVED_SET.set(set, { pos: k, ids });
  }
})();

// Colour showing at each slot for a given state (inverse of reconstruct).
export const colorsOf = (loc) => { const f = facelets(loc); return f.map((id) => faceOfSlot(id)); };

export function reconstruct(color) {
  if (!color || color.length !== 54 || color.some((c) => !c)) return { error: "Every sticker must be coloured." };
  const counts = {};
  for (const c of color) counts[c] = (counts[c] || 0) + 1;
  for (const f of ["U", "D", "F", "B", "R", "L"]) {
    if (counts[f] !== 9) return { error: `Need exactly 9 of each colour (${f}: ${counts[f] || 0}).` };
  }
  const loc = new Array(54).fill(-1);
  const used = new Set();
  for (const [k, slotIds] of homeIdsByPos) {
    const observed = slotIds.map((s) => color[s]).sort().join("");
    const piece = SOLVED_SET.get(observed);
    if (!piece) return { error: `An impossible piece is at ${k} (colours ${observed}).` };
    if (used.has(piece.pos)) return { error: `Two pieces look identical (${observed}). Check your colours.` };
    used.add(piece.pos);
    for (const homeId of piece.ids) {
      const target = slotIds.find((s) => color[s] === faceOfSlot(homeId));
      loc[homeId] = target;
    }
  }
  // Colours and pieces are consistent. Physical solvability (no lone twisted corner /
  // flipped edge / single swap) is confirmed by solve(), which fails to find an OLL/PLL
  // for an unreachable last layer — see solveCube().
  return { loc };
}

// Reconstruct and solve in one step, turning any failure into a friendly message.
export function solveCube(color) {
  const { loc, error } = reconstruct(color);
  if (error) return { error };
  try { return solve(loc); }
  catch { return { error: "That colouring can't be reached on a real cube — check for a twisted corner, a flipped edge, or two swapped pieces." }; }
}

export async function solveCubeAsync(color, onProgress) {
  const { loc, error } = reconstruct(color);
  if (error) return { error };
  try {
    return await solveAsync(loc, onProgress);
  } catch {
    return { error: "That colouring can't be reached on a real cube — check for a twisted corner, a flipped edge, or two swapped pieces." };
  }
}
