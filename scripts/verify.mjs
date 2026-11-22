// Checks every OLL and PLL alg is valid, that no two solve the same case,
// that each case's left-hand alternate really solves it, and that every
// alternative F2L alg solves the same case as its primary.
import { readFileSync } from "node:fs";
import { OLL, PLL } from "../src/data/ll.js";
import { caseState, applyAlg, normalize } from "../src/lib/cube.js";
import { oriented, isSolved, f2lSolved, ollKey, pllKey } from "../src/lib/recognize.js";

const f2lData = JSON.parse(readFileSync(new URL("../src/data/f2l.json", import.meta.url)));

function dedup(set, label, ok, key) {
  const seen = new Map(); let bad = 0;
  for (const c of set) {
    const st = caseState(c.alg);
    if (!ok(st)) { console.log("INVALID", c.name, c.alg); bad++; continue; }
    const k = key(st);
    if (seen.has(k)) { console.log("DUP", c.name, "=", seen.get(k)); bad++; }
    seen.set(k, c.name);
  }
  console.log(set.length, label, "checked, problems:", bad);
}

function checkAlts() {
  let bad = 0;
  for (const c of OLL) {
    if (!c.alt || !oriented(normalize(applyAlg(caseState(c.alg), c.alt)))) { console.log("BAD OLL ALT", c.name, c.alt); bad++; }
  }
  for (const c of PLL) {
    if (!c.alt || !isSolved(normalize(applyAlg(caseState(c.alg), c.alt)))) { console.log("BAD PLL ALT", c.name, c.alt); bad++; }
  }
  console.log(OLL.length + PLL.length, "left-hand alts checked, problems:", bad);
}

function checkF2L() {
  let bad = 0, n = 0;
  for (const set of [f2lData.f2l, f2lData.advanced]) for (const c of set) {
    const ref = caseState(c.alg).join(",");
    for (const a of c.algs) { n++; if (caseState(a.alg).join(",") !== ref) { console.log("F2L ALG MISMATCH", c.id, a.alg); bad++; } }
  }
  console.log(n, "F2L algs checked, problems:", bad);
}

dedup(OLL, "OLL", f2lSolved, ollKey);
dedup(PLL, "PLL", oriented, pllKey);
checkAlts();
checkF2L();
