# Graph Report - cube-platform  (2026-11-23)

## Corpus Check
- 79 files · ~578,233 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 406 nodes · 741 edges · 29 communities (26 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44b691b5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib/cube.js
- gen-f2l.mjs
- scripts
- CubeTimer.jsx
- solve.js
- App.jsx
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
- Layer by Layer — Complete Project Documentation
- themeMode.js

## God Nodes (most connected - your core abstractions)
1. `react` - 18 edges
2. `useCubeColors()` - 16 edges
3. `parseAlg()` - 15 edges
4. `applyAlg()` - 15 edges
5. `Layer by Layer — Complete Project Documentation` - 15 edges
6. `movesToString()` - 14 edges
7. `solve()` - 14 edges
8. `applyMoves()` - 13 edges
9. `normalize()` - 13 edges
10. `caseState()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `consider()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `simplify()` --indirect_call--> `moveToString()`  [INFERRED]
  scripts/gen-f2l.mjs → src/lib/cube.js
- `dedup()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js
- `checkAlts()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js
- `checkF2L()` --calls--> `caseState()`  [EXTRACTED]
  scripts/verify.mjs → src/lib/cube.js

## Import Cycles
- None detected.

## Communities (29 total, 3 thin omitted)

### Community 0 - "lib/cube.js"
Cohesion: 0.12
Nodes (26): checkF2L(), dedup(), FirstTwoLayers(), isLLPiece(), LastLayer(), PAIR, VIEW, cell() (+18 more)

### Community 1 - "gen-f2l.mjs"
Cohesion: 0.07
Nodes (39): adv, AUF, best, canon(), cases, consider(), cornerIds, cubeEdge (+31 more)

### Community 2 - "scripts"
Cohesion: 0.07
Nodes (26): oxlint, devDependencies, oxlint, playwright-core, @types/react, @types/react-dom, vite, @vitejs/plugin-react (+18 more)

### Community 3 - "CubeTimer.jsx"
Cohesion: 0.38
Nodes (9): aoN(), CubeTimer(), effectiveMs(), FACES, format(), loadJSON(), normalizeHistory(), randomScramble() (+1 more)

### Community 4 - "solve.js"
Cohesion: 0.08
Nodes (49): cornerPos, corrupt, cr, cs, FACES, good, N, checkAlts() (+41 more)

### Community 5 - "App.jsx"
Cohesion: 0.07
Nodes (38): react, App(), defaultThemeSlug, themes, CaseCard(), CaseGrid(), FACES, NOTATION (+30 more)

### Community 7 - "dependencies"
Cohesion: 0.11
Nodes (19): @astryxdesign/cli, @astryxdesign/core, @astryxdesign/theme-neutral, cubing, dependencies, @astryxdesign/cli, @astryxdesign/core, @astryxdesign/theme-neutral (+11 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.25
Nodes (7): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, warn

### Community 9 - "Solve.jsx"
Cohesion: 0.12
Nodes (24): BootLoader(), CubeColorSettings(), CubePlayer(), LONGITUDE, MASKS, SPEEDS, CENTER, FACES (+16 more)

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

### Community 27 - "Layer by Layer — Complete Project Documentation"
Cohesion: 0.05
Nodes (39): 10. Build, Run, Verify, 11. Graphify Insights, 12.1 Recommended Product Direction, 12.2 Platform Strategy, 12.3 What to Reuse Directly, 12.4 What Needs Mobile Reimplementation, 12.5 Mobile UX Improvements, 12.6 Suggested Mobile Data/Module Architecture (+31 more)

### Community 28 - "themeMode.js"
Cohesion: 0.19
Nodes (14): emit(), getThemeMode(), listeners, load(), mode, MODES, setThemeMode(), subscribe() (+6 more)

## Knowledge Gaps
- **174 isolated node(s):** `$schema`, `oxc`, `react/rules-of-hooks`, `warn`, `name` (+169 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App.jsx` to `lib/cube.js`, `gen-f2l.mjs`, `CubeTimer.jsx`, `.oxlintrc.json`, `Solve.jsx`, `themeMode.js`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Why does `plugins` connect `.oxlintrc.json` to `App.jsx`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `parseAlg()` connect `gen-f2l.mjs` to `lib/cube.js`, `Solve.jsx`, `solve.js`, `App.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useCubeColors()` (e.g. with `getCubeColors()` and `subscribeCubeColors()`) actually correct?**
  _`useCubeColors()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `oxc`, `react/rules-of-hooks` to the rest of the system?**
  _174 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `lib/cube.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
- **Should `gen-f2l.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._