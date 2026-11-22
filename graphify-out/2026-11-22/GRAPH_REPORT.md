# Graph Report - cube-platform  (2026-11-22)

## Corpus Check
- 35 files · ~21,770 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 247 nodes · 519 edges · 13 communities (12 shown, 1 thin omitted)
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
- CubePlayer.jsx

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
- `canon()` --calls--> `applyMoves()`  [EXTRACTED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `consider()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `simplify()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `dedup()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js
- `checkAlts()` --calls--> `isSolved()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/recognize.js

## Import Cycles
- None detected.

## Communities (13 total, 1 thin omitted)

### Community 0 - "cube.js"
Cohesion: 0.13
Nodes (24): FirstTwoLayers(), isLLPiece(), LastLayer(), PAIR, VIEW, cell(), ALL, DEFS (+16 more)

### Community 1 - "gen-f2l.mjs"
Cohesion: 0.08
Nodes (27): adv, AUF, best, canon(), cases, consider(), cornerIds, cubeEdge (+19 more)

### Community 2 - "scripts"
Cohesion: 0.09
Nodes (22): cubing, dependencies, cubing, react, react-dom, react-router-dom, name, private (+14 more)

### Community 3 - "solve.js"
Cohesion: 0.08
Nodes (37): cornerPos, corrupt, cr, cs, FACES, good, N, movesToString() (+29 more)

### Community 4 - "recognize.js"
Cohesion: 0.20
Nodes (20): checkAlts(), checkF2L(), dedup(), f2lData, OLL, PLL, applyAlg(), caseState() (+12 more)

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
Cohesion: 0.21
Nodes (14): CENTER, FACES, GRID, NetEditor(), COLORS, FACE_NAME, applyMoves(), caseFromAlg() (+6 more)

### Community 10 - "Layer by Layer"
Cohesion: 0.50
Nodes (3): How it fits together, Layer by Layer, Run it

### Community 12 - "CubePlayer.jsx"
Cohesion: 0.21
Nodes (10): LONGITUDE, MASKS, SPEEDS, ALL, FINGERS, Hands(), describeFingers(), FINGER_NAMES (+2 more)

## Knowledge Gaps
- **94 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `cube.js`, `solve.js`, `.oxlintrc.json`, `Solve.jsx`, `CubePlayer.jsx`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `plugins` connect `.oxlintrc.json` to `App.jsx`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `parseAlg()` connect `gen-f2l.mjs` to `cube.js`, `solve.js`, `recognize.js`, `Solve.jsx`, `CubePlayer.jsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cube.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12535612535612536 - nodes in this community are weakly interconnected._
- **Should `gen-f2l.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08064516129032258 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._