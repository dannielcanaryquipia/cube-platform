# Graph Report - cube-platform  (2026-11-23)

## Corpus Check
- 64 files · ~497,986 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 349 nodes · 669 edges · 27 communities (24 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44b691b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib/cube.js
- gen-f2l.mjs
- scripts
- App.jsx
- solve.js
- CasePage.jsx
- ui-check.mjs
- dependencies
- .oxlintrc.json
- Solve.jsx
- Layer by Layer
- Hands.jsx
- cube.settings.ts
- src/themes/cube/cube.variants.d.ts
- themes/cube/cube.variants.d.ts
- responsive-check.mjs
- cube.palette.ts
- colors.js
- themes/cube/cube.js

## God Nodes (most connected - your core abstractions)
1. `react` - 16 edges
2. `useCubeColors()` - 16 edges
3. `parseAlg()` - 15 edges
4. `applyAlg()` - 15 edges
5. `movesToString()` - 14 edges
6. `solve()` - 14 edges
7. `applyMoves()` - 13 edges
8. `normalize()` - 13 edges
9. `caseState()` - 13 edges
10. `solved()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `consider()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `simplify()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `dedup()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js
- `checkF2L()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js
- `canon()` --calls--> `applyMoves()`  [EXTRACTED]
  scripts/gen-f2l.mjs → src/lib/cube.js

## Import Cycles
- None detected.

## Communities (27 total, 3 thin omitted)

### Community 0 - "lib/cube.js"
Cohesion: 0.11
Nodes (25): FirstTwoLayers(), isLLPiece(), LastLayer(), PAIR, VIEW, cell(), CENTER, FACES (+17 more)

### Community 1 - "gen-f2l.mjs"
Cohesion: 0.07
Nodes (40): adv, AUF, best, canon(), cases, consider(), cornerIds, cubeEdge (+32 more)

### Community 2 - "scripts"
Cohesion: 0.07
Nodes (26): oxlint, devDependencies, oxlint, playwright-core, @types/react, @types/react-dom, vite, @vitejs/plugin-react (+18 more)

### Community 3 - "App.jsx"
Cohesion: 0.13
Nodes (18): App(), defaultThemeSlug, themes, NOTATION, TIPS, SETS, aoN(), CubeTimer() (+10 more)

### Community 4 - "solve.js"
Cohesion: 0.07
Nodes (57): cornerPos, corrupt, cr, cs, FACES, good, N, checkAlts() (+49 more)

### Community 5 - "CasePage.jsx"
Cohesion: 0.13
Nodes (23): CaseCard(), CaseGrid(), ALL_CASES, findCase(), emit(), NEXT, setStatus(), state (+15 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): @astryxdesign/cli, @astryxdesign/core, @astryxdesign/theme-neutral, cubing, dependencies, @astryxdesign/cli, @astryxdesign/core, @astryxdesign/theme-neutral (+11 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 9 - "Solve.jsx"
Cohesion: 0.12
Nodes (22): react, BootLoader(), CubeColorSettings(), LONGITUDE, MASKS, SPEEDS, NetEditor(), FACES (+14 more)

### Community 10 - "Layer by Layer"
Cohesion: 0.17
Nodes (11): Contents, Data model, Deployment, Features, How it fits together, Layer by Layer, Project layout, Running it (+3 more)

### Community 12 - "Hands.jsx"
Cohesion: 0.31
Nodes (7): ALL, FINGERS, Hands(), describeFingers(), FINGER_NAMES, fingersFor(), MAP

### Community 13 - "cube.settings.ts"
Cohesion: 0.47
Nodes (3): cubeSettings, cubeTheme, cubePaletteRefs

### Community 14 - "src/themes/cube/cube.variants.d.ts"
Cohesion: 0.40
Nodes (4): @astryxdesign/core/Badge, @astryxdesign/core/ProgressBar, BadgeVariantMap, ProgressBarVariantMap

### Community 15 - "themes/cube/cube.variants.d.ts"
Cohesion: 0.40
Nodes (4): @astryxdesign/core/Badge, @astryxdesign/core/ProgressBar, BadgeVariantMap, ProgressBarVariantMap

### Community 16 - "responsive-check.mjs"
Cohesion: 0.50
Nodes (3): errors, routes, widths

### Community 17 - "cube.palette.ts"
Cohesion: 0.50
Nodes (3): black, palette, white

## Knowledge Gaps
- **136 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Solve.jsx` to `lib/cube.js`, `gen-f2l.mjs`, `App.jsx`, `CasePage.jsx`, `.oxlintrc.json`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `plugins` connect `.oxlintrc.json` to `Solve.jsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `parseAlg()` connect `gen-f2l.mjs` to `lib/cube.js`, `Solve.jsx`, `solve.js`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useCubeColors()` (e.g. with `getCubeColors()` and `subscribeCubeColors()`) actually correct?**
  _`useCubeColors()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _136 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib/cube.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10591133004926108 - nodes in this community are weakly interconnected._
- **Should `gen-f2l.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07246376811594203 - nodes in this community are weakly interconnected._