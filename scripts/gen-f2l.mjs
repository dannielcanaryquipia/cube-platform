// Finds every F2L case for the front-right slot and picks a short, finger-trick friendly alg for each.
import { writeFileSync } from "node:fs";
import { SLOTS, solved, applyMoves, parseAlg, moveToString, invertMoves, caseState, applyAlg } from "../src/lib/cube.js";

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
];

const MOVES = ["R", "U", "F"].flatMap((f) => [1, 2, 3].map((a) => ({ face: f, amount: a })));
const score = (ms) => ms.length + ms.filter((m) => m.face === "F").length * 0.6 + ms.filter((m) => m.amount === 2 && m.face !== "U").length * 0.4;

const best = new Map(); // canon -> {moves, score, known}
const consider = (loc, moves, known) => {
  if (!isCase(loc) || pairIds.every((id) => loc[id] === id)) return;
  const k = canon(loc); const sc = score(moves) - (known ? 2 : 0);
  const cur = best.get(k);
  if (!cur || sc < cur.score) best.set(k, { moves, score: sc, known });
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
const cases = [...best.values()].map((v) => {
  const alg = v.moves.map(moveToString).join(" ");
  return { alg, known: v.known, group: group(caseState(alg)), len: v.moves.length };
}).sort((a, b) => ORDER.indexOf(a.group) - ORDER.indexOf(b.group) || a.len - b.len);
const f2l = cases.map((c, i) => ({ id: `f2l-${i + 1}`, name: `F2L ${i + 1}`, group: c.group, alg: c.alg, slot: "FR", generated: !c.known }));

// Advanced: the short R/U-only cases mirrored into the other three slots.
const MIRROR = {
  FL: { R: ["L", true], U: ["U", true], F: ["F", true] },
  BR: { R: ["R", true], U: ["U", true], F: ["B", true] },
  BL: { R: ["L", false], U: ["U", false], F: ["B", false] },
};
const mirror = (alg, slot) => parseAlg(alg).map(({ face, amount }) => {
  const [nf, flip] = MIRROR[slot][face];
  return moveToString({ face: nf, amount: flip ? (4 - amount) % 4 : amount });
}).join(" ");
const ru = f2l.filter((c) => /^[RU2' ]+$/.test(c.alg) && parseAlg(c.alg).length <= 8);
const SLOTNAME = { FL: "Front-left slot", BR: "Back-right slot", BL: "Back-left slot" };
const adv = [];
for (const slot of ["FL", "BR", "BL"]) for (const c of ru) adv.push({ id: `af2l-${slot.toLowerCase()}-${c.id.split("-")[1]}`, name: `${c.name} · ${slot}`, group: SLOTNAME[slot], alg: mirror(c.alg, slot), slot, basedOn: c.id });

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
