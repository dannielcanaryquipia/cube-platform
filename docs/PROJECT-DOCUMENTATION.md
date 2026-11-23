# Layer by Layer — Complete Project Documentation

> Generated: 2026-11-23  
> Repo: `cube-platform` (`layer-by-layer`, v0.0.0)  
> HEAD: `44b691b590669a34a35f9cf3fdb2d2616fff1ae2`  
> Purpose: detailed reference for understanding the current web app and planning a meaningful mobile application port.

## 1. Executive Summary

**Layer by Layer** is a static, client-side React application for learning 3x3 Rubik's Cube CFOP (Cross, F2L, OLL, PLL). It combines:

- **Verified algorithm data** (OLL/PLL + left-hand mirrors, generated F2L sets).
- **A sticker-level 3x3 simulator** (`src/lib/cube.js`) used as ground truth for diagrams, recognition, verification, and solving.
- **A staged CFOP solver** (`src/lib/solve.js`) that uses IDA* for Cross/F2L and the site's verified OLL/PLL sets for last layer.
- **Interactive 3D playback** via `cubing.js` TwistyPlayer, with move stepping, speed control, phase labels, and finger-trick guidance.
- **Practice tools**: searchable case library, progress tracking, starred cases, scramble/paint-to-solve, and a timer with inspection/Ao5/Ao12.

The app has **no backend**. All persistence is browser `localStorage`. Build output is static (`dist/`) and deployable anywhere.

## 2. Requested Pre-Mobile Actions

| Action | Status | Evidence |
|---|---|---|
| `graphify update .` | Completed | `graphify update .` rebuilt graph: 349 nodes, 669 edges, 27 communities; updated `graphify-out/graph.json`, `graph.html`, `GRAPH_REPORT.md`. Uncommitted graphify-out changes exist from this update. |
| Archify diagram/connection map | Completed | `.archify/architecture-cube-platform-20261123-142552/cube-platform-architecture.html` (finalize gates: validate/deliver/check/browser-check pass). Visual review not requested; automated layout review reported route crossings to inspect before claiming visual quality. |
| Detailed complete documentation | This document | Covers files, architecture, data models, logic, UI, state, scripts, and mobile-port plan. |

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| UI framework | React 19.3.1 | Functional components, hooks, `useSyncExternalStore` for local stores. |
| Routing | React Router DOM 7.18.6 | `HashRouter` for static-host compatibility. |
| Build/dev | Vite 8.3.6 + `@vitejs/plugin-react` | `base: "./"` for subpath/static hosting. |
| Design system | Astryx (`@astryxdesign/core`, theme-neutral, cli) + custom `cube` theme | Astryx components for layout/text/buttons/inputs/cards; custom CSS for app-specific layout. |
| 3D cube | `cubing` 0.66.1 (`TwistyPlayer`) | 3D move playback, setup alg, stickering masks, tempo. |
| Icons | `@phosphor-icons/react` | UI icons. |
| Lint | `oxlint` | `npm run lint`. |
| UI smoke test | `playwright-core` | `scripts/ui-check.mjs`, requires dev server. |
| Verification | Node ESM scripts | Algorithm correctness and solver stress tests. |

## 4. Architecture

### 4.1 High-Level Diagram

- Archify HTML: `.archify/architecture-cube-platform-20261123-142552/cube-platform-architecture.html`
- Candidate: `.archify/architecture-cube-platform-20261123-142552/candidate.json`

### 4.2 Runtime Flow

```text
Browser
  -> main.jsx (React root, Astryx reset/css, app css)
  -> App.jsx (Theme + LinkProvider + HashRouter + Shell)
      -> BootLoader (3D scramble-solve intro, then onDone)
      -> Shell (sidebar, top search, routes)
          -> Pages
              -> Components
                  -> Core lib (cube/recognize/solve/search)
                  -> Domain data (sets/ll/f2l/notation/fingers/colors)
                  -> Browser stores (progress/stars/cubeColors/timer localStorage)
                  -> cubing.js TwistyPlayer (3D)
```

### 4.3 Key Architectural Decisions

- **Simulator as truth**: `src/lib/cube.js` defines sticker geometry, move parsing, application, inversion, mirroring, normalization. Diagrams, recognition, solver validation, and scripts all rely on it.
- **Teaching-aligned last layer**: Cross/F2L are computer-searched (IDA*), while OLL/PLL solutions use the site's verified case sets so users learn the same algs shown in lessons.
- **Static deployment**: Hash routing + relative base means no server rewrites.
- **Client-only state**: progress/stars/colors/timer are local to browser; no accounts/sync.
- **Astryx + custom theme**: Astryx provides primitives; `src/themes/cube` and `src/index.css` provide product-specific visual behavior.

## 5. Directory and File Map

### 5.1 Root

| File/Dir | Purpose |
|---|---|
| `index.html` | Vite HTML shell, root loading placeholder, mounts `src/main.jsx`. |
| `package.json` | Scripts, deps, project metadata (`name: layer-by-layer`). |
| `vite.config.js` | React plugin, `base: "./"`. |
| `README.md` | User-facing project overview. |
| `AGENTS.md` | Agent/project instructions (Astryx block). |
| `GEMINI.md` | Additional agent instructions if present. |
| `public/` | Static assets (favicon etc.). |
| `scripts/` | Data generation and verification scripts. |
| `src/` | Application source. |
| `themes/` | Theme artifacts (project-level). |
| `graphify-out/` | Generated knowledge graph/report/cache. |
| `.archify/` | Archify diagram candidates/outputs/receipts. |
| `docs/` | Documentation (this file). |

### 5.2 Source (`src/`)

| Path | Role | Key exports/behavior |
|---|---|---|
| `main.jsx` | App entry | Imports Astryx reset/css + `index.css`, renders `<App />` in `StrictMode`. |
| `App.jsx` | App shell/routing | `SearchBox`, `Shell`, `App`; routes, sidebar drawer, global `/` search shortcut, boot loader gate. |
| `astryx-themes.js` | Generated theme registry | Exports `themes` and `defaultThemeSlug = "cube"`. |
| `index.css` | Global styles | Layout, sidebar, cards, case/player, net, timer, responsive rules, focus styles. |
| `themes/cube/*` | Custom Astryx theme | `cubeTheme` tokens/components/adaptations; generated CSS/fonts/TS declarations. |

### 5.3 Pages (`src/pages/`)

| Page | Route | Responsibility | Key dependencies |
|---|---|---|---|
| `Home.jsx` | `/` | Learning path overview, progress bars per set, links to start. | `SETS`, `useProgress`, `CaseImage`, `NOTATION`. |
| `Notation.jsx` | `/notation` | Move groups/tabs, move details, finger tricks, custom alg tryout with 3D player. | `NOTATION`, `TIPS`, `CubePlayer`. |
| `Cross.jsx` | `/cross` | Cross theory/tips, worked examples, random/typed scramble, cross solution via solver. | `solveCross`, `cube.js`, `CubePlayer`. |
| `AlgSet.jsx` | `SETS[].path` | Case list for F2L/Advanced F2L/OLL/PLL with category, status, starred, text filter. | `matchCase`, `useProgress`, `useStars`, `CaseGrid`. |
| `CasePage.jsx` | `/case/:id` | Single case detail: diagram, alg variants, star/status, prev/next, 3D player. | `findCase`, progress/stars stores, `CaseImage`, `CubePlayer`. |
| `Search.jsx` | `/search?q=` | Global search results grouped by set. | `SETS`, `matchCase`, `CaseGrid`. |
| `Solve.jsx` | `/solve` | Paint/type scramble, solve cube, staged CFOP playback, stage links, pace estimate. | `NetEditor`, `solveCube`, `colorsOf`, `CubePlayer`, `CubeColorSettings`. |
| `CubeTimer.jsx` | `/timer` | Timer with hold/inspection, scramble, penalties OK/+2/DNF, Ao5/Ao12, session history. | `localStorage`, random scramble. |

### 5.4 Components (`src/components/`)

| Component | Responsibility | Notable details |
|---|---|---|
| `BootLoader.jsx` | Startup animation before shell | TwistyPlayer scramble->solve, custom cube color application, fallback timeout. |
| `CubePlayer.jsx` | Reusable 3D algorithm player | Controls: restart, prev/next, play/pause, speed, jump-to-move; phase label; keyboard shortcuts; custom cube color mapping into cubing.js materials. |
| `CaseImage.jsx` | 2D recognition diagram | OLL/PLL top view + side stickers + PLL arrows; F2L 3D-ish projected SVG; uses `caseState`/`facelets`. |
| `CaseCard.jsx` | Case preview card | Diagram, name, star indicator, progress dot, alg, alg count. |
| `CaseGrid.jsx` | Grid of case cards | Empty state, reads progress store. |
| `Hands.jsx` | Finger-trick visualization | Highlights active fingers for current move based on `fingers.js`. |
| `NetEditor.jsx` | Paintable 2D cube net | 54 stickers mapped to slot indices; centers fixed; used by Solve page. |
| `CubeColorSettings.jsx` | Sticker color customization UI | Color inputs per face, reset individual/all, backed by `cubeColors` store. |
| `RubiksLoader.jsx` | Generic loading cube visual | CSS/markup cube face animation (available component). |

### 5.5 Data (`src/data/`)

| File | Purpose | Shape |
|---|---|---|
| `sets.js` | Defines the 4 CFOP sets and helpers | `SETS`, `ALL_CASES`, `findCase`; enriches cases with mirrors/algs. |
| `ll.js` | OLL (57) and PLL (21) definitions | Tuples mapped to case objects; adds left-hand/alt algs via `recognize.altFor` and wiki alt lists. |
| `f2l.json` | Generated F2L + Advanced F2L cases | `f2l` (41) and `advanced` (123); each case has id/name/group/alg/algs/slot/generated. |
| `notation.js` | Notation lessons and habits | `NOTATION` sections with move+description+trick; `TIPS`. |
| `fingers.js` | Finger mapping for moves | `fingersFor(move)`, `describeFingers(move)`. |
| `colors.js` | Default face colors/names | `COLORS`, `FACE_NAME`. (Runtime color customization uses `lib/cubeColors.js`). |

### 5.6 Core Lib (`src/lib/`)

| File | Responsibility | Key APIs |
|---|---|---|
| `cube.js` | Sticker-level 3x3 simulator | `parseAlg`, `applyMoves/applyAlg`, `invertMoves`, `mirrorMoves/mirrorAlg`, `caseState`, `facelets`, `normalize`, slot/face helpers. |
| `recognize.js` | Last-layer recognition and alternates | `AUF`, `isSolved/oriented/f2lSolved`, `ollSig/ollKey`, `pllKey`, `altFor`. |
| `solve.js` | CFOP solver and net reconstruction | `solveCross`, `solve`, `solveCube`, `reconstruct`, `colorsOf`; IDA* for Cross/F2L, case-set recognition for OLL/PLL. |
| `search.js` | Case search matching | `matchCase` by name/group/set/id tokens and compact alg substring. |
| `progress.js` | Learning progress store | `useProgress`, `setStatus`, statuses: `learning`, `learned`, absent. localStorage `cube-progress-v1`. |
| `stars.js` | Starred case store | `useStars`, `toggleStar`, `isStarred`. localStorage `cube-stars-v1`. |
| `cubeColors.js` | Custom sticker colors store | `useCubeColors`, `setCubeColor`, `resetCubeColors`. localStorage `cube-colors-v1`. |

### 5.7 Scripts (`scripts/`)

| Script | Command | Purpose |
|---|---|---|
| `verify.mjs` | `npm run verify` | Validates OLL/PLL algs and left-hand mirrors solve their cases. |
| `solve-check.mjs` | `npm run verify:solve [n]` | End-to-end random scramble CFOP solve checks. |
| `ui-check.mjs` | `npm run verify:ui` | Playwright smoke test for key pages/routes. Requires dev server. |
| `gen-f2l.mjs` | `npm run gen:f2l` | Generates `src/data/f2l.json` (F2L and Advanced F2L). Memory intensive. |

## 6. Core Domain Model

### 6.1 Case Model

A case is an algorithm lesson unit. Common fields:

```ts
type Case = {
  id: string;              // e.g. "oll-21", "pll-t", "f2l-1", "af2l-fl-1"
  name: string;            // display name
  group: string;           // category/filter group
  alg: string;             // primary algorithm
  alt?: string;            // left-hand/mirror alternate
  algs?: { alg: string; label: string }[]; // selectable algorithm variants
  slot?: "FR" | "FL" | "BR" | "BL"; // F2L slot view
  generated?: boolean;     // computer-found alg note
  basedOn?: string;        // mirror/reference origin
  set: SetDef;             // attached in UI via sets/search flattening
}
```

### 6.2 Set Model

```ts
type SetDef = {
  id: "f2l" | "advanced-f2l" | "oll" | "pll";
  path: string;
  title: string;
  subtitle: string;
  stickering: "F2L" | "OLL" | "PLL" | "full";
  view: "f2l" | "oll" | "pll";
  intro: string;
  groups: string[];
  cases: Case[];
}
```

### 6.3 Cube/Move Model

- Stickers are indexed by `SLOTS` in `cube.js`; each slot has position `p=[x,y,z]` and normal `n`.
- Move parser accepts face turns, primes, double turns, wide moves (`r`, `Rw`), slices (`M,E,S`), rotations (`x,y,z`).
- `loc[stickerId] = currentSlotIndex` represents cube state.

## 7. Solver & Verification Details

### 7.1 Cube Simulator (`lib/cube.js`)

- Builds 54 sticker slots from 3x3 coordinates.
- Defines permutations for face/slice/wide/rotation moves.
- Supports parse, stringify, invert, mirror, apply, normalize.
- `caseState(alg)` produces a normalized case state for diagram rendering.

### 7.2 Recognition (`lib/recognize.js`)

- `oriented(loc)`: F2L solved and all top stickers facing up.
- `ollKey`: canonical OLL signature over AUF.
- `pllKey`: canonical PLL signature over pre/post AUF.
- `altFor`: finds left-hand alternate by testing mirrored algs against case state.

### 7.3 Solver (`lib/solve.js`)

- **Cross**: IDA* over face moves, solved by distance tables for 4 white edges.
- **F2L**: IDA* pair insertion in order FR/FL/BR/BL, greedy heuristic for speed.
- **OLL**: matches oriented state by applying AUF + verified OLL case algs.
- **PLL**: matches solved state by AUF + verified PLL case + AUF.
- `reconstruct(colors)`: validates painted net, checks piece consistency, returns loc or human error.
- `solveCube(colors)`: reconstruct + solve; unreachable physical states reported as friendly error.

### 7.4 Why this matters for mobile

The solver/simulator is pure logic and highly reusable. For a mobile app, this logic should be extracted into a shared package/module with no DOM dependencies.

## 8. State & Persistence

| Store | Key | Value | Used by |
|---|---|---|---|
| Progress | `cube-progress-v1` | `{[caseId]: "learning"|"learned"}` | Home, AlgSet, CasePage, CaseGrid/Card. |
| Stars | `cube-stars-v1` | `{[caseId]: true}` | AlgSet, CaseCard, CasePage. |
| Cube colors | `cube-colors-v1` | face->hex map + defaults | CubePlayer, CaseImage, NetEditor, Solve, BootLoader, CubeColorSettings. |
| Timer history | `cube-timer-history` | array of solves `{t, penalty, scramble, at}` | CubeTimer. |
| Timer settings | `cube-timer-inspection`, `cube-timer-hold`, `cube-timer-scramble` | booleans/string | CubeTimer. |
| Solve human speed | `cube-human-speed` | number | Solve pace estimate. |

All stores are local-only and browser-specific; mobile port needs migration/sync strategy if users expect cross-device continuity.

## 9. Styling and Theming

- `src/index.css` contains app layout/system styles (shell, cards, grid, player, net, timer, responsive behavior).
- Astryx theme tokens/components are used through `Theme` and Astryx primitives.
- Custom theme `src/themes/cube/cube.js` defines typography, motion, colors, component variants, and adaptation breakpoints.
- Mobile-port note: CSS will not transfer directly to React Native. Design tokens should be extracted into platform-agnostic theme objects.

## 10. Build, Run, Verify

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run verify
npm run verify:solve
npm run verify:ui   # dev server must be running
npm run gen:f2l
```

## 11. Graphify Insights

From `graphify-out/GRAPH_REPORT.md` (2026-11-23):

- 349 nodes, 669 edges, 27 communities.
- God nodes: `useCubeColors`, `parseAlg`, `applyAlg`, `movesToString`, `solve`, `applyMoves`, `normalize`, `caseState`.
- Core hubs: `lib/cube.js`, `solve.js`, data/scripts, App/pages/components.
- No import cycles detected.
- This confirms the architecture center: **cube engine + color/progress stores + page/component consumers**.

## 12. Mobile Application Port Plan (Meaningful & Useful)

### 12.1 Recommended Product Direction

Do **not** do a 1:1 web clone first. Build a mobile app around the highest-value cube-learning loops:

1. **Learn**: notation, cross, case recognition.
2. **Practice**: algorithm drills, starred/weak cases, spaced repetition.
3. **Solve**: camera/paint scramble input, staged CFOP solution.
4. **Time**: timer, scrambles, stats, trends.
5. **Progress**: daily goals, streaks, mastery heatmap.

### 12.2 Platform Strategy

| Option | Pros | Cons | Fit |
|---|---|---|---|
| Expo / React Native | Shares JS/TS logic, fast iteration, native navigation, good mobile UX | `cubing.js` DOM/WebGL integration needs wrapper/WebView or RN 3D alternative | Best first mobile path |
| Capacitor wrap of web app | Fastest to ship | Less native feel, performance/gesture limitations, not truly mobile-first | Short-term prototype only |
| Native Swift/Kotlin | Best platform polish | Duplicates logic, slower | Only if RN/Expo proves limiting |

**Recommendation:** Expo + React Native, with shared domain logic extracted from `src/lib` and `src/data`.

### 12.3 What to Reuse Directly

- `src/lib/cube.js`, `recognize.js`, `solve.js`, `search.js` — pure logic, portable.
- `src/data/*` — portable (convert JSON/JS modules as needed).
- Verification scripts concept — keep in CI for data correctness.

### 12.4 What Needs Mobile Reimplementation

| Web feature | Mobile replacement |
|---|---|
| Astryx web components/layout | Native UI components / design system tokens |
| `index.css` responsive layout | React Native StyleSheet / NativeWind / tokenized styles |
| `cubing.js` TwistyPlayer | WebView-wrapped player initially; evaluate native 3D later |
| `localStorage` stores | AsyncStorage/MMKV/SQLite + migration layer |
| HashRouter pages | React Navigation stack/tabs |
| Hover/keyboard shortcuts | Touch gestures, haptics, bottom sheets, accessible buttons |
| NetEditor click painting | Touch-friendly net editor with larger hit targets and undo |

### 12.5 Mobile UX Improvements

- **Bottom tab navigation**: Home, Learn, Practice, Timer, Profile.
- **Case practice mode**: flashcard/quiz, hide alg then reveal, recognition-first training.
- **Smart practice queue**: prioritize "learning", starred, and recently missed cases.
- **Offline-first**: all core content local; optional cloud sync later.
- **Timer-first ergonomics**: large touch area, haptics, inspection voice/countdown option.
- **3D player controls**: thumb-reachable controls, scrubber, slow-mo, step gestures.
- **Solve flow**: camera scan (future) or guided manual net input; save scramble history.
- **Accessibility**: Dynamic Type/font scaling, VoiceOver/TalkBack labels, colorblind-safe palettes.

### 12.6 Suggested Mobile Data/Module Architecture

```text
mobile-app/
  app/ (screens/routes)
  components/
  features/
    learn/
    practice/
    solve/
    timer/
    progress/
  domain/            # ported from web src/lib + src/data
    cube/
    solver/
    recognition/
    data/
  storage/           # AsyncStorage/MMKV adapters
  theme/             # tokenized design system
  tests/
```

### 12.7 Migration Risks

- **3D performance/integration**: cubing.js in mobile WebView may be acceptable initially but test on low-end devices.
- **IDA* solve time**: solver can be CPU-heavy; run in background thread / JS worker equivalent.
- **State migration**: define schema versions for progress/stars/colors/timer from day one.
- **Asset/legal**: verify icon/font/license compatibility for mobile distribution.
- **Algorithm data integrity**: keep `verify`/`solve-check` in CI before releasing data updates.

## 13. File-by-File Implementation Notes (Quick Reference)

| File | Implementation note |
|---|---|
| `src/App.jsx` | App shell, route table, drawer nav, global search shortcut `/`, boot gate. |
| `src/main.jsx` | React bootstrap and style imports. |
| `src/pages/Home.jsx` | Progress overview and learning-path cards. |
| `src/pages/Notation.jsx` | Move-group pedagogy + interactive 3D move demo. |
| `src/pages/Cross.jsx` | Cross training with example/random/typed scrambles. |
| `src/pages/AlgSet.jsx` | Filterable case catalog per CFOP set. |
| `src/pages/CasePage.jsx` | Deep-link case detail, alg selection, star/progress, 3D playback. |
| `src/pages/Search.jsx` | Cross-set search results. |
| `src/pages/Solve.jsx` | Net paint/typed scramble -> CFOP staged solve -> pace estimates. |
| `src/pages/CubeTimer.jsx` | WCA-style practice timer features (inspection, +2/DNF, Ao5/Ao12). |
| `src/components/CubePlayer.jsx` | TwistyPlayer wrapper, controls, timer, phase, custom sticker coloring. |
| `src/components/CaseImage.jsx` | SVG case recognizer (OLL/PLL top, F2L projection). |
| `src/components/NetEditor.jsx` | Sticker net input mapped to cube slots. |
| `src/components/CubeColorSettings.jsx` | User color calibration UI. |
| `src/components/Hands.jsx` | Finger-trick overlay for current move. |
| `src/lib/cube.js` | Canonical cube model/move math. |
| `src/lib/recognize.js` | LL recognition signatures and alt-alg discovery. |
| `src/lib/solve.js` | Cross/F2L IDA*, OLL/PLL case-set solve, reconstruction. |
| `src/lib/search.js` | Case text/alg matching. |
| `src/lib/progress.js` | Progress local store. |
| `src/lib/stars.js` | Starred local store. |
| `src/lib/cubeColors.js` | Color customization local store. |
| `src/data/sets.js` | Set definitions and case flattening helpers. |
| `src/data/ll.js` | OLL/PLL source data + alt enrichment. |
| `src/data/f2l.json` | Generated F2L/Advanced F2L corpus. |
| `src/data/notation.js` | Notation curriculum content. |
| `src/data/fingers.js` | Finger-trick mapping. |
| `src/data/colors.js` | Default color constants. |
| `scripts/*.mjs` | Generation and correctness/smoke verification. |

## 14. Recommended Next Steps

1. **Freeze domain core**: extract `src/lib` + `src/data` into a `packages/domain` (or shared folder) with tests.
2. **Define mobile MVP**: Timer + Case Practice + Progress + 3D player first; Solve camera later.
3. **Create design tokens**: map Astryx/cube theme tokens to mobile token system.
4. **Prototype 3D**: validate cubing.js TwistyPlayer inside Expo WebView on Android/iOS.
5. **Add persistence schema versioning**: prepare migration from web localStorage keys.
6. **Run verification in CI**: `lint`, `verify`, `verify:solve`, build.

---

*This documentation is based on source read from the repository at HEAD and generated artifacts (`graphify-out`, `.archify`) created during this session. The graphify update produced uncommitted changes in `graphify-out/`.*