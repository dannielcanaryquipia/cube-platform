# Layer by Layer

A clean, ad-free learning site for the 3x3 Rubik's Cube **CFOP** method (Cross → F2L → OLL → PLL), built with React and Vite. Every algorithm is verified by a sticker-level cube simulator, every case has a recognition diagram, and a 3D player walks through each solution move by move with a finger-trick guide.

Orientation is the same everywhere on the site: **white cross on the bottom, yellow on top, green in front.**

---

## Contents

- [Features](#features)
- [The learning path](#the-learning-path)
- [Running it](#running-it)
- [Project layout](#project-layout)
- [How it fits together](#how-it-fits-together)
- [Data model](#data-model)
- [Verification & scripts](#verification--scripts)
- [Deployment](#deployment)
- [Tech stack](#tech-stack)

---

## Features

- **Full CFOP coverage** — Notation, Cross, F2L (41 cases), Advanced F2L (123 cases across every slot, no rotations), OLL (57 cases) and PLL (21 cases).
- **Verified algorithms** — every OLL/PLL algorithm and its left-hand mirror is checked by the built-in simulator (`npm run verify`); the solver is stress-tested against hundreds of random scrambles (`npm run verify:solve`).
- **Recognition diagrams** — each case renders its own 2D diagram (top-face view for OLL, arrows for PLL piece movement, slot view for F2L) straight from the sticker simulator.
- **3D playback** — a reusable [cubing.js](https://js.cubing.net/cubing/) twisty player with play, pause, step, jump-to-move and speed control. It shows the current **CFOP phase** and a **finger guide** — a two-hand diagram highlighting which of your ten fingers executes the next move.
- **Left-hand mirrors** — OLL and PLL cases carry a verified left-hand alternate you can pick from a list.
- **Paint-and-solve** — on the Solve page, paint a scramble onto a 2D net (or type one in standard notation) and get a staged CFOP solution that plays on the 3D cube, with the OLL and PLL stages linking back to their lessons.
- **Search everything** — by name (`T perm`, `OLL 27`), by shape (`fish`), by group (`corner in slot`) or by algorithm text (`R U R' U'`). Press `/` to focus the search box from anywhere.
- **Progress tracking** — mark any case as *Learning* or *Learned*; progress persists in your browser (`localStorage`). Filter each set by category and by progress.
- **Fully responsive** — on phones the sidebar becomes a slide-in drawer and the 3D simulation pins to the top while the algorithm list scrolls beneath it.
- **Icons** from [Phosphor](https://phosphoricons.com/).

## The learning path

The sidebar lays the site out as a numbered path:

1. **Notation** — every face, prime, double, wide, slice (`M E S`) and rotation (`x y z`) move, plus common triggers (sexy move, sledgehammer, Sune…). Moves are grouped into tabs; pick a group, then a move, and the 3D cube stays pinned beside it with a finger-trick tip. You can type your own moves and watch them play.
2. **Cross** — building the white cross: planning, inspection and efficient insertion, with worked examples plus a scrambler (random or typed) that solves the cross on the 3D cube.
3. **F2L** — pair a white corner with its middle-layer edge and insert the pair into its slot. Short, finger-trick-friendly algorithms (mostly `R`, `U`, `F`) for the front-right slot with the cross solved on the bottom.
4. **Advanced F2L** — the same pairs solved straight into the front-left and back slots instead of rotating the cube (no rotations, 123 cases).
5. **OLL** — orient the last layer: make the whole top face yellow, recognised from the yellow stickers on top and on the sides of the top layer.
6. **PLL** — permute the last layer: move the top pieces to their solved spots; diagram arrows show where each piece travels.
7. **Solve** — paint or type a scramble and get the full staged solution.

## Running it

Requires Node.js (ESM, Vite 8). Install and start:

```bash
npm install
npm run dev      # http://localhost:5173
```

Build and preview a production bundle:

```bash
npm run build    # static site in dist/
npm run preview  # serve the built site locally
```

The build is a fully static site. It uses **hash routing** and **relative asset paths** (`base: "./"`), so `dist/` works from any folder or sub-path without server configuration.

## Project layout

```
cube-platform/
├── index.html
├── vite.config.js            # React plugin, base: "./"
├── public/                   # favicon and static assets
├── scripts/
│   ├── gen-f2l.mjs           # generates src/data/f2l.json
│   ├── verify.mjs            # checks every OLL/PLL alg + left-hand mirror
│   ├── solve-check.mjs       # end-to-end solver test over random scrambles
│   └── ui-check.mjs          # headless-browser page smoke test
└── src/
    ├── main.jsx              # React entry
    ├── App.jsx               # HashRouter, shell, sidebar, search box
    ├── index.css             # all styles
    ├── components/
    │   ├── CubePlayer.jsx    # 3D twisty player (cubing.js)
    │   ├── CaseCard.jsx      # one case: diagram + alg + controls
    │   ├── CaseGrid.jsx      # grid/list of cases with filters
    │   ├── CaseImage.jsx     # 2D recognition diagram
    │   ├── Hands.jsx         # two-hand finger guide
    │   └── NetEditor.jsx     # paintable 2D cube net
    ├── data/
    │   ├── sets.js           # the four algorithm sets + helpers
    │   ├── ll.js             # OLL & PLL algorithms (+ computed mirrors)
    │   ├── f2l.json          # F2L cases (generated)
    │   ├── notation.js       # move groups, triggers, descriptions
    │   ├── colors.js         # sticker colours
    │   └── fingers.js        # finger assignments per move
    ├── lib/
    │   ├── cube.js           # sticker-level 3x3 simulator
    │   ├── recognize.js      # last-layer recognition + mirror finder
    │   ├── solve.js          # staged CFOP solver + net reconstruction
    │   ├── search.js         # search index/matching
    │   └── progress.js       # localStorage progress store
    └── pages/
        ├── Home.jsx
        ├── Notation.jsx
        ├── Cross.jsx
        ├── AlgSet.jsx        # renders any of the four sets
        ├── CasePage.jsx      # single-case deep link (/case/:id)
        ├── Search.jsx
        └── Solve.jsx
```

## How it fits together

- **`src/lib/cube.js`** — a small sticker-level 3x3 simulator. It draws the case diagrams, applies and mirrors algorithms, and is the ground truth behind every verification check.
- **`src/lib/recognize.js`** — last-layer recognition (AUF, orientation, solved detection) and the left-hand alternate finder, shared by the data, the verifier and the solver.
- **`src/lib/solve.js`** — the staged CFOP solver. Cross and F2L are found by **IDA\*** over face moves (clean, computer-shortest solutions); OLL and PLL reuse the site's own verified algorithm sets, so those stages are exactly the algorithms the site teaches. Also handles reconstructing a cube state from a painted net.
- **`src/data/sets.js`** — defines the four sets (F2L, Advanced F2L, OLL, PLL): title, path, recognition view, intro, category groups, and the case list. `ALL_CASES` and `findCase(id)` flatten them for search and deep links.
- **`src/data/ll.js`** — OLL and PLL algorithms, each a common speedcubing choice picked for finger tricks, with left-hand mirrors computed via `altFor` from `recognize.js`.
- **`src/data/f2l.json`** — F2L cases, generated by `scripts/gen-f2l.mjs` (run `npm run gen:f2l`).
- **`src/components/CubePlayer.jsx`** — the 3D player, built on the cubing.js twisty player, sticky on small screens.
- **`src/lib/progress.js`** — a tiny `useSyncExternalStore`-backed store that persists each case's status (`learning` / `learned`) to `localStorage` under `cube-progress-v1`.
- **`src/App.jsx`** — `HashRouter`, the responsive shell (sidebar → drawer on mobile), and the global search box with the `/` keyboard shortcut.

## Data model

A **case** carries an id, a category group, its algorithm, and the data needed to render a recognition diagram. The four sets differ only in their recognition `view` and `stickering`:

| Set            | Cases | View  | Recognition                              |
|----------------|-------|-------|------------------------------------------|
| F2L            | 41    | `f2l` | Corner + edge in the top layer / slot    |
| Advanced F2L   | 123   | `f2l` | Same pairs, mirrored into the other slots|
| OLL            | 57    | `oll` | Yellow stickers on top and top-layer sides|
| PLL            | 21    | `pll` | Arrows showing where pieces travel       |

OLL/PLL entries are `[number, group, algorithm]` tuples in `ll.js`; left-hand mirrors are derived, not hand-written. F2L cases live in the generated `f2l.json`.

## Verification & scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `verify`       | `npm run verify`       | Applies every OLL/PLL algorithm and its left-hand mirror in the simulator and confirms each solves its case. |
| `verify:solve` | `npm run verify:solve` | Solves 200 random scrambles end-to-end (Cross → F2L → OLL → PLL) and checks the cube ends solved. |
| `verify:ui`    | `npm run verify:ui`    | Smoke-tests the pages in a headless browser. **Start the dev server first** (`npm run dev`). |
| `gen:f2l`      | `npm run gen:f2l`      | Regenerates `src/data/f2l.json`. Run with extra heap: the script sets `--max-old-space-size=4096`. |
| `lint`         | `npm run lint`         | Lints the source with [oxlint](https://oxc.rs/docs/guide/usage/linter). |

Because the simulator and the recognition logic are shared between the app and the scripts, the algorithms the site shows are the same ones the verifier proves correct.

## Deployment

`npm run build` emits a static `dist/`. With hash routing and relative paths, it can be hosted on any static host (GitHub Pages, Netlify, Vercel, S3, a sub-folder on an existing site) with no routing configuration or server-side rewrites.

## Tech stack

- **[React 19](https://react.dev/)** + **[React Router 7](https://reactrouter.com/)** (hash routing)
- **[Vite 8](https://vite.dev/)** for dev server and build
- **[cubing.js](https://js.cubing.net/cubing/)** twisty player for 3D playback
- **[Phosphor Icons](https://phosphoricons.com/)** for UI icons
- **[oxlint](https://oxc.rs/)** for linting; **[playwright-core](https://playwright.dev/)** for the headless UI check
- A hand-written sticker-level cube simulator and IDA\* solver (no external solving engine)
