# Graph Report - cube-platform  (2026-11-23)

## Corpus Check
- 35 files · ~21,965 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 250 nodes · 523 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e1b76d98`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cube.js
- gen-f2l.mjs
- scripts
- solve.js
- recognize.js
- App.jsx
- ui-check.mjs
- devDependencies
- .oxlintrc.json
- Solve.jsx
- Layer by Layer
- Hands.jsx

## God Nodes (most connected - your core abstractions)
1. `parseAlg()` - 15 edges
2. `applyAlg()` - 15 edges
3. `solve()` - 14 edges
4. `applyMoves()` - 13 edges
5. `normalize()` - 13 edges
6. `caseState()` - 13 edges
7. `movesToString()` - 12 edges
8. `solved()` - 12 edges
9. `react` - 11 edges
10. `moveToString()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `consider()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `canon()` --calls--> `applyMoves()`  [EXTRACTED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `simplify()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `dedup()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js
- `checkF2L()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "cube.js"
Cohesion: 0.10
Nodes (30): FirstTwoLayers(), isLLPiece(), LastLayer(), PAIR, VIEW, cell(), CENTER, FACES (+22 more)

### Community 1 - "gen-f2l.mjs"
Cohesion: 0.08
Nodes (22): adv, AUF, best, canon(), cases, consider(), cornerIds, cubeEdge (+14 more)

### Community 2 - "scripts"
Cohesion: 0.08
Nodes (24): cubing, dependencies, cubing, @phosphor-icons/react, react, react-dom, react-router-dom, name (+16 more)

### Community 3 - "solve.js"
Cohesion: 0.15
Nodes (18): AXIS, CROSS, distTable(), enc(), FACES, homeIdsByPos, idaSolve(), IDENTITY (+10 more)

### Community 4 - "recognize.js"
Cohesion: 0.13
Nodes (30): cornerPos, corrupt, cr, cs, FACES, good, N, checkAlts() (+22 more)

### Community 5 - "App.jsx"
Cohesion: 0.12
Nodes (25): react, App(), CaseCard(), CaseGrid(), NOTATION, TIPS, ALL_CASES, findCase() (+17 more)

### Community 7 - "devDependencies"
Cohesion: 0.15
Nodes (13): oxlint, devDependencies, oxlint, playwright-core, @types/react, @types/react-dom, vite, @vitejs/plugin-react (+5 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 9 - "Solve.jsx"
Cohesion: 0.15
Nodes (26): MIRROR, simplify(), CubePlayer(), LONGITUDE, MASKS, SPEEDS, applyMoves(), caseFromAlg() (+18 more)

### Community 10 - "Layer by Layer"
Cohesion: 0.50
Nodes (3): How it fits together, Layer by Layer, Run it

### Community 12 - "Hands.jsx"
Cohesion: 0.31
Nodes (7): ALL, FINGERS, Hands(), describeFingers(), FINGER_NAMES, fingersFor(), MAP

## Knowledge Gaps
- **96 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `.oxlintrc.json`, `cube.js`, `Solve.jsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `plugins` connect `.oxlintrc.json` to `App.jsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `parseAlg()` connect `Solve.jsx` to `cube.js`, `gen-f2l.mjs`, `solve.js`, `recognize.js`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cube.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0957983193277311 - nodes in this community are weakly interconnected._
- **Should `gen-f2l.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08262108262108261 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._