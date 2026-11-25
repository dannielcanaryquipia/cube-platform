# Prompt: update the cube site's algorithms to finger-trick-friendly choices

Copy everything below the line into the AI agent.

---

You are updating the algorithm data of a React + Vite CFOP learning site (3x3 only). The repository is `github.com/dannielcanaryquipia/cube-platform`, branch `main`; the owner's local copy is the source of truth. Work on a new branch, run the checks below, and open a pull request. Do not push to `main` and do not merge.

## Goal

Replace the primary algorithm of 15 F2L cases, 7 OLL cases and 1 PLL case with faster, finger-trick-friendly algorithms recommended by the speedcubing community (SpeedCubeDB top votes and J Perm's lists, read 2026-11-25). Give every case a short, verified list of alternates with source labels, and fix the broken alternates data. The full data is in the JSON block at the end of this prompt. Every algorithm in it has already been checked against this site's own simulator.

## How the data is stored today (read these files first)

- `src/data/f2l.json`: `{ "f2l": [...41 cases], "advanced": [...123 cases] }`. Each case: `id` (`f2l-1`…`f2l-41`), `name`, `group`, `alg` (primary), `algs` (array of `{ alg, label }`), `slot` (`FR`), `generated`. Advanced cases have ids like `af2l-fl-9`, slots `FL` / `BR` / `BL`, and `basedOn: "f2l-9"`. They are mirrors of the basic case.
- `src/data/sets.js`: `withMirror()` appends a "Left hand mirror" entry to each F2L case's `algs` using `mirrorAlg()`.
- `src/data/ll.js`: `OLL` and `PLL` arrays of `[number-or-name, group, alg]`. After them, `OLL_WIKI` and `PLL_WIKI` objects feed extra alternates labelled `Alt 1`, `Alt 2`…; `altFor()` from `src/lib/recognize.js` adds a "Left hand" alternate.
- `src/components/CaseImage.jsx` draws every case diagram from the primary `alg` (it applies the inverse of the alg to a solved cube). Changing a primary alg therefore changes the picture. For OLL and PLL that only rotates the view by a U turn, which is fine. For F2L the JSON already includes the pre-AUF (leading U moves) that keeps the pair in the same place, so use the strings exactly as given.
- `src/pages/CasePage.jsx` shows `algs` as a pick list (`label: alg`) and plays the chosen one on the 3D cube.
- `src/lib/cube.js` + `src/lib/recognize.js` are the sticker simulator; `scripts/verify.mjs` (`npm run verify`) checks the data.
- Follow `AGENTS.md` in the repo (Astryx UI rules) if you touch any component. This task should only need data and script changes.

## What to change

1. **F2L (`src/data/f2l.json`, `f2l` array).** For each case set `alg` to `recommended`. Rebuild `algs` as `[{alg: recommended, label: "Recommended"}]` followed by each alternate as `{alg, label: "Alt N"}`. When a case has a `replaces` field, make sure the old alg is kept as one of the alternates (it already is in the data). Keep `id`, `name`, `group`, `slot` unchanged. Set `generated` to `false`.
2. **Advanced F2L (`advanced` array).** Regenerate each advanced case from its `basedOn` basic case with the same slot transformation the current data uses (compare existing pairs such as `f2l-9` with `af2l-fl-9`, `af2l-br-9`, `af2l-bl-9`, and look for the generator in `scripts/`). Three new primaries contain a `y'` (`f2l-15`, `f2l-17`, `f2l-20`); for those, build the advanced versions from the first rotation-free alternate instead, so back-slot algs do not stack rotations. Verify every generated alg solves its slot with the simulator.
3. **OLL (`src/data/ll.js`).** Set each case's alg to `recommended`. Delete `OLL_WIKI`. It currently holds the same 15 algs under all 57 keys, so most "Alt" algs shown on OLL pages do not solve that case. Replace it with the `alternates` from the JSON. Keep the "Left hand" alternate from `altFor()`.
4. **PLL (`src/data/ll.js`).** Set each case's alg to `recommended`. Replace `PLL_WIKI` with the `alternates` from the JSON, or keep only `PLL_WIKI` entries that pass the simulator check (30 of the current 262 fail).
5. **Labels and notes.** Use the label `"Recommended"` for the primary (rename the current `"Standard"` label in `sets.js`, `ll.js` and `CasePage.jsx`; CasePage checks `"Left hand"` / `"Left hand mirror"` labels, so keep those exact strings). Add `source` and `note` fields to each case object and show them on the case page under the alg list as small supporting text, for example "Source: SpeedCubeDB · Wide r keeps it in R/U grip". Use existing Astryx `Text` components, no new styling system.
6. **Verifier (`scripts/verify.mjs`).**
   - Change `checkF2L()`: an alternate passes when applying it to the primary's case state (`caseState(c.alg)`) leaves the F2L solved (`f2lSolved(normalize(applyAlg(state, a.alg)))`). Do not require identical full-cube states; two good algs for one pair usually leave the last layer differently.
   - Add checks that every OLL alternate orients the last layer of its case and every PLL alternate solves its case (same tests `checkAlts()` uses for the left-hand alternates).
   - Keep the duplicate-case checks.
7. **Rotations.** Algs that begin with `x`/`x'` must end with the opposite rotation (for example `x R2 F R F' R U2 r' U r U2 x'`). The simulator rejects them otherwise. Keep the strings exactly as given.

## Checks before you open the PR

- `npm run verify` reports 0 problems.
- `npm run lint` and `npm run build` pass.
- Open a few changed case pages in the dev server (`npm run dev`): `#/f2l` case 9 and 26, `#/oll` case 3 and 32, `#/pll` Ja. The diagram looks right, the 3D cube plays the recommended alg to a solved F2L/OLL/PLL state, and the alg list shows the alternates.

## Pull request

Title: "Use finger-trick-friendly CFOP algorithms". In the body, list the changed cases (15 F2L, 7 OLL, 1 PLL), the OLL_WIKI bug fix, the verifier change, and the sources: SpeedCubeDB (https://speedcubedb.com/a/3x3/F2L, /OLL, /PLL) and J Perm (https://jperm.net/algs/oll, https://jperm.net/algs/pll). Do not merge; the owner reviews first.

## Data (all algorithms verified against `src/lib/cube.js` on 2026-11-25)

`recommended` = new primary; `alternates` = verified alternates in order; `replaces` = the current primary when it changes. Case ids match the site's ids, which use the site's own F2L numbering, not SpeedCubeDB's.

```json
{
  "f2l": [
    {"id": "f2l-1", "recommended": "F' U' F", "alternates": ["y' R' U' R"], "source": "SpeedCubeDB", "note": "Use the rotation version if F moves feel slow."},
    {"id": "f2l-2", "recommended": "R U R'", "alternates": [], "source": "SpeedCubeDB", "note": "The basic insert: right index flicks U."},
    {"id": "f2l-3", "recommended": "U R U' R'", "alternates": ["R' F R F'"], "source": "SpeedCubeDB", "note": "Left index does U'."},
    {"id": "f2l-4", "recommended": "F R' F' R", "alternates": ["U' F' U F"], "source": "SpeedCubeDB", "note": "Sledgehammer backwards, no AUF needed.", "replaces": "U' F' U F"},
    {"id": "f2l-5", "recommended": "R' U2 R2 U R2 U R", "alternates": ["R U' R' U R U' R' U2 R U' R'"], "source": "SpeedCubeDB", "note": "Keep thumb on front; R2s are wrist turns."},
    {"id": "f2l-6", "recommended": "R U' R' U2 F' U' F", "alternates": [], "source": "SpeedCubeDB", "note": "Push F' with left thumb after the U2 double flick."},
    {"id": "f2l-7", "recommended": "F' U F U2 R U R'", "alternates": ["R U R' U2 R U' R' U R U' R'"], "source": "SpeedCubeDB", "note": "The pure R/U version avoids F if you prefer."},
    {"id": "f2l-8", "recommended": "U' R U R' U2 R U' R'", "alternates": ["U' R U R' U' R U2 R'"], "source": "SpeedCubeDB", "note": "All R/U; U2 as a right index + middle double flick."},
    {"id": "f2l-9", "recommended": "U' r U' R' U R U r'", "alternates": ["d R' U' R U2 R' U R", "U F' U' F U2 F' U F"], "source": "SpeedCubeDB", "note": "Wide r keeps it in R/U grip, replaces the old F' chain.", "replaces": "U F' U' F U2 F' U F"},
    {"id": "f2l-10", "recommended": "U' R U2 R' U' R U2 R'", "alternates": ["U' R U2 R' U2 R U' R'"], "source": "SpeedCubeDB", "note": "Two identical R U2 R' triggers.", "replaces": "U' R U2 R' U2 R U' R'"},
    {"id": "f2l-11", "recommended": "r' U2 R2 U R2 U r", "alternates": ["d R' U2 R U R' U2 R", "U F' U2 F U2 F' U F"], "source": "SpeedCubeDB", "note": "Wide-move twin of case 5; replaces the old F' chain.", "replaces": "U F' U2 F U2 F' U F"},
    {"id": "f2l-12", "recommended": "U' R U' R' U F' U' F", "alternates": ["U' R U' R' d R' U' R"], "source": "SpeedCubeDB", "note": "F' U' F with left thumb on F'."},
    {"id": "f2l-13", "recommended": "U' R U R' U R U R'", "alternates": ["U2 R U' R' U' R U R'"], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-14", "recommended": "U' R U2 R' U F' U' F", "alternates": ["U' R U2 R' d R' U' R"], "source": "SpeedCubeDB"},
    {"id": "f2l-15", "recommended": "y' U R' U R U' R' U' R", "alternates": ["d R' U R U' R' U' R", "U F' U F U' F' U' F"], "source": "SpeedCubeDB", "note": "Rotate once, then it is a back-slot style R'/U alg.", "replaces": "U F' U F U' F' U' F"},
    {"id": "f2l-16", "recommended": "U' R U' R' U R U R'", "alternates": ["U2 R2 U R' U R U2 R2"], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-17", "recommended": "y' R' U2 R U' R' U R", "alternates": ["R U' R2 F R F' R U' R'", "F' U2 F2 R' F' R"], "source": "SpeedCubeDB", "note": "Replaces F' U2 F2 R' F' R (F2 is slow).", "replaces": "F' U2 F2 R' F' R"},
    {"id": "f2l-18", "recommended": "R U R' F' U' F", "alternates": ["U2 r U' r' U2 r U r'"], "source": "SpeedCubeDB", "note": "Keep; the r version is the top vote but needs a U2."},
    {"id": "f2l-19", "recommended": "R U2 R' U' R U R'", "alternates": [], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-20", "recommended": "y' R' U2 R U R' U' R", "alternates": ["F' U2 F U F' U' F"], "source": "SpeedCubeDB", "note": "Rotation version avoids three F' turns.", "replaces": "F' U2 F U F' U' F"},
    {"id": "f2l-21", "recommended": "U2 F U R U' R' F' R U' R'", "alternates": ["U R U R2 F R F' R U' R'", "F2 U2 F U F' U F2"], "source": "SpeedCubeDB", "note": "Replaces F2 U2 F U F' U F2 (F2 turns are slow).", "replaces": "F2 U2 F U F' U F2"},
    {"id": "f2l-22", "recommended": "U R U2 R' U R U' R'", "alternates": ["U R U2 R2 F R F'"], "source": "SpeedCubeDB"},
    {"id": "f2l-23", "recommended": "U2 R U R' U R U' R'", "alternates": ["R U' R' U2 R U R'"], "source": "SpeedCubeDB"},
    {"id": "f2l-24", "recommended": "U2 R2 U2 R' U' R U' R2", "alternates": ["R U R' U2 R U R' U' R U R'"], "source": "SpeedCubeDB", "note": "R2 moves are wrist turns; no regrip."},
    {"id": "f2l-25", "recommended": "R U' R' U R U' R'", "alternates": [], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-26", "recommended": "R U R' U' F R' F' R", "alternates": ["y L' U L U' L' U L", "F' U F U' F' U F"], "source": "SpeedCubeDB", "note": "Sexy move into reverse sledgehammer; replaces an F' chain.", "replaces": "F' U F U' F' U F"},
    {"id": "f2l-27", "recommended": "R U R' U' R U R'", "alternates": [], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-28", "recommended": "R' F R F' U R U' R'", "alternates": ["F' U' F U F' U' F"], "source": "SpeedCubeDB", "note": "Sledgehammer then insert; replaces an F' chain.", "replaces": "F' U' F U F' U' F"},
    {"id": "f2l-29", "recommended": "U R U' R' F R' F' R", "alternates": ["U R U' R' U' F' U F"], "source": "SpeedCubeDB", "note": "Ends with reverse sledgehammer.", "replaces": "U R U' R' U' F' U F"},
    {"id": "f2l-30", "recommended": "U' R' F R F' R U R'", "alternates": ["U' F' U F U R U' R'"], "source": "SpeedCubeDB", "note": "Starts with sledgehammer.", "replaces": "U' F' U F U R U' R'"},
    {"id": "f2l-31", "recommended": "U' R' F R F' R U' R'", "alternates": ["F' U F R U2 R'"], "source": "SpeedCubeDB", "note": "Sledgehammer, then R U' R'.", "replaces": "F' U F R U2 R'"},
    {"id": "f2l-32", "recommended": "U' R U' R' U2 R U' R'", "alternates": ["U' R U' R' U' R U2 R'"], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-33", "recommended": "U R U R' U2 R U R'", "alternates": ["U' R U2 R' U R U R'"], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-34", "recommended": "U' R U R' U F' U' F", "alternates": ["U' R U R' d R' U' R"], "source": "SpeedCubeDB"},
    {"id": "f2l-35", "recommended": "U F' U' F U' R U R'", "alternates": ["U2 R' F R F' U2 R U R'"], "source": "SpeedCubeDB"},
    {"id": "f2l-36", "recommended": "R U R' U' R U R' U' R U R'", "alternates": ["R2 U R2 U R2 U2 R2"], "source": "SpeedCubeDB", "note": "Three sexy-style triggers; the R2 version is shorter."},
    {"id": "f2l-37", "recommended": "R2 U2 F R2 F' U2 R' U R'", "alternates": ["R U2 R' U R U2 R' U F' U' F"], "source": "SpeedCubeDB"},
    {"id": "f2l-38", "recommended": "r U' r' U2 r U r' R U R'", "alternates": ["R F U R U' R' F' U' R'"], "source": "SpeedCubeDB", "note": "Wide-move version keeps R/U grip.", "replaces": "R F U R U' R' F' U' R'"},
    {"id": "f2l-39", "recommended": "R U' R' r U' r' U2 r U r'", "alternates": ["R U F R U R' U' F' R'"], "source": "SpeedCubeDB", "note": "Wide-move version keeps R/U grip.", "replaces": "R U F R U R' U' F' R'"},
    {"id": "f2l-40", "recommended": "R U' R' U' R U R' U2 R U' R'", "alternates": ["R2 U2 R' U' R U' R' U2 R'"], "source": "SpeedCubeDB", "note": "Pure R/U."},
    {"id": "f2l-41", "recommended": "R U' R' U R U2 R' U R U' R'", "alternates": ["R U2 R U R' U R U2 R2"], "source": "SpeedCubeDB", "note": "Pure R/U."}
  ],
  "oll": [
    {"id": "oll-1", "recommended": "R U2 R2 F R F' U2 R' F R F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-2", "recommended": "r U r' U2 r U2 R' U2 R U' r'", "alternates": ["F R U R' U' F' f R U R' U' f'"], "source": "J Perm", "note": "No regrips, wide r in R/U grip.", "replaces": "F R U R' U' F' f R U R' U' f'"},
    {"id": "oll-3", "recommended": "r' R2 U R' U r U2 r' U M'", "alternates": ["f R U R' U' f' U' F R U R' U' F'"], "source": "J Perm", "note": "M' at the end with left ring finger.", "replaces": "f R U R' U' f' U' F R U R' U' F'"},
    {"id": "oll-4", "recommended": "M U' r U2 r' U' R U' R' M'", "alternates": ["f R U R' U' f' U F R U R' U' F'"], "source": "J Perm", "note": "Starts and ends with M slices.", "replaces": "f R U R' U' f' U F R U R' U' F'"},
    {"id": "oll-5", "recommended": "r' U2 R U R' U r", "alternates": [], "source": "SpeedCubeDB"},
    {"id": "oll-6", "recommended": "r U2 R' U' R U' r'", "alternates": [], "source": "J Perm"},
    {"id": "oll-7", "recommended": "r U R' U R U2 r'", "alternates": [], "source": "J Perm"},
    {"id": "oll-8", "recommended": "r' U' R U' R' U2 r", "alternates": [], "source": "SpeedCubeDB"},
    {"id": "oll-9", "recommended": "R U R' U' R' F R2 U R' U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-10", "recommended": "R U R' U R' F R F' R U2 R'", "alternates": [], "source": "J Perm"},
    {"id": "oll-11", "recommended": "r U R' U R' F R F' R U2 r'", "alternates": ["r' R2 U R' U R U2 R' U M'"], "source": "J Perm"},
    {"id": "oll-12", "recommended": "M' R' U' R U' R' U2 R U' R r'", "alternates": [], "source": "J Perm"},
    {"id": "oll-13", "recommended": "F U R U' R2 F' R U R U' R'", "alternates": ["r U' r' U' r U r' F' U F"], "source": "J Perm"},
    {"id": "oll-14", "recommended": "R' F R U R' F' R F U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-15", "recommended": "r' U' r R' U' R U r' U r", "alternates": [], "source": "SpeedCubeDB"},
    {"id": "oll-16", "recommended": "r U r' R U R' U' r U' r'", "alternates": [], "source": "J Perm"},
    {"id": "oll-17", "recommended": "F R' F' R2 r' U R U' R' U' M'", "alternates": ["R U R' U R' F R F' U2 R' F R F'"], "source": "J Perm", "note": "Shorter than two sledgehammers.", "replaces": "R U R' U R' F R F' U2 R' F R F'"},
    {"id": "oll-18", "recommended": "r U R' U R U2 r2 U' R U' R' U2 r", "alternates": ["R U2 R2 F R F' U2 M' U R U' r'"], "source": "J Perm"},
    {"id": "oll-19", "recommended": "M U R U R' U' M' R' F R F'", "alternates": [], "source": "SpeedCubeDB"},
    {"id": "oll-20", "recommended": "r U R' U' M2 U R U' R' U' M'", "alternates": [], "source": "J Perm"},
    {"id": "oll-21", "recommended": "R U2 R' U' R U R' U' R U' R'", "alternates": [], "source": "J Perm"},
    {"id": "oll-22", "recommended": "R U2 R2 U' R2 U' R2 U2 R", "alternates": [], "source": "J Perm"},
    {"id": "oll-23", "recommended": "R2 D' R U2 R' D R U2 R", "alternates": [], "source": "J Perm"},
    {"id": "oll-24", "recommended": "r U R' U' r' F R F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-25", "recommended": "F' r U R' U' r' F R", "alternates": [], "source": "J Perm"},
    {"id": "oll-26", "recommended": "R U2 R' U' R U' R'", "alternates": [], "source": "J Perm"},
    {"id": "oll-27", "recommended": "R U R' U R U2 R'", "alternates": [], "source": "J Perm"},
    {"id": "oll-28", "recommended": "r U R' U' M U R U' R'", "alternates": [], "source": "SpeedCubeDB"},
    {"id": "oll-29", "recommended": "R U R' U' R U' R' F' U' F R U R'", "alternates": ["r2 D' r U r' D r2 U' r' U' r"], "source": "J Perm"},
    {"id": "oll-30", "recommended": "F R' F R2 U' R' U' R U R' F2", "alternates": ["F U R U2 R' U' R U2 R' U' F'"], "source": "J Perm"},
    {"id": "oll-31", "recommended": "R' U' F U R U' R' F' R", "alternates": [], "source": "J Perm"},
    {"id": "oll-32", "recommended": "S R U R' U' R' F R f'", "alternates": ["L U F' U' L' U L F L'", "R U B' U' R' U R B R'"], "source": "SpeedCubeDB", "note": "Replaces R U B' U' R' U R B R' (B moves are slow).", "replaces": "R U B' U' R' U R B R'"},
    {"id": "oll-33", "recommended": "R U R' U' R' F R F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-34", "recommended": "R U R2 U' R' F R U R U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-35", "recommended": "R U2 R2 F R F' R U2 R'", "alternates": [], "source": "J Perm"},
    {"id": "oll-36", "recommended": "L' U' L U' L' U L U L F' L' F", "alternates": [], "source": "J Perm"},
    {"id": "oll-37", "recommended": "F R' F' R U R U' R'", "alternates": [], "source": "J Perm"},
    {"id": "oll-38", "recommended": "R U R' U R U' R' U' R' F R F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-39", "recommended": "L F' L' U' L U F U' L'", "alternates": [], "source": "J Perm"},
    {"id": "oll-40", "recommended": "R' F R U R' U' F' U R", "alternates": [], "source": "J Perm"},
    {"id": "oll-41", "recommended": "R U R' U R U2 R' F R U R' U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-42", "recommended": "R' U' R U' R' U2 R F R U R' U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-43", "recommended": "F' U' L' U L F", "alternates": ["R' U' F' U F R"], "source": "J Perm", "note": "Alternate keeps you on the right hand."},
    {"id": "oll-44", "recommended": "F U R U' R' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-45", "recommended": "F R U R' U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-46", "recommended": "R' U' R' F R F' U R", "alternates": [], "source": "J Perm"},
    {"id": "oll-47", "recommended": "R' U' R' F R F' R' F R F' U R", "alternates": [], "source": "J Perm"},
    {"id": "oll-48", "recommended": "F R U R' U' R U R' U' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-49", "recommended": "r U' r2 U r2 U r2 U' r", "alternates": [], "source": "J Perm"},
    {"id": "oll-50", "recommended": "r' U r2 U' r2 U' r2 U r'", "alternates": [], "source": "J Perm"},
    {"id": "oll-51", "recommended": "F U R U' R' U R U' R' F'", "alternates": [], "source": "J Perm"},
    {"id": "oll-52", "recommended": "R' F' U' F U' R U R' U R", "alternates": ["R U R' U R U' B U' B' R'"], "source": "SpeedCubeDB", "note": "Replaces the B-move alg.", "replaces": "R U R' U R U' B U' B' R'"},
    {"id": "oll-53", "recommended": "l' U2 L U L' U' L U L' U l", "alternates": [], "source": "J Perm"},
    {"id": "oll-54", "recommended": "r U2 R' U' R U R' U' R U' r'", "alternates": [], "source": "J Perm"},
    {"id": "oll-55", "recommended": "R U2 R2 U' R U' R' U2 F R F'", "alternates": ["R' F R U R U' R2 F' R2 U' R' U R U R'"], "source": "SpeedCubeDB", "note": "11 moves instead of 15.", "replaces": "R' F R U R U' R2 F' R2 U' R' U R U R'"},
    {"id": "oll-56", "recommended": "r' U' r U' R' U R U' R' U R r' U r", "alternates": ["r U r' U R U' R' U R U' R' r U' r'"], "source": "J Perm"},
    {"id": "oll-57", "recommended": "R U R' U' M' U R U' r'", "alternates": [], "source": "J Perm"}
  ],
  "pll": [
    {"id": "pll-aa", "recommended": "x R' U R' D2 R U' R' D2 R2 x'", "alternates": ["x L2 D2 L' U' L D2 L' U L' x'"], "source": "J Perm / SpeedCubeDB", "note": "Do D2 as a double flick with the left ring finger."},
    {"id": "pll-ab", "recommended": "x R2' D2 R U R' D2 R U' R x'", "alternates": ["x' L2 D2 L U L' D2 L U' L x"], "source": "J Perm / SpeedCubeDB"},
    {"id": "pll-e", "recommended": "x' R U' R' D R U R' D' R U R' D R U' R' D' x", "alternates": ["R2 U F' R' U R U' R' U R U' R' U R U' F U' R2"], "source": "J Perm / SpeedCubeDB"},
    {"id": "pll-h", "recommended": "M2 U M2 U2 M2 U M2", "alternates": [], "source": "J Perm"},
    {"id": "pll-ua", "recommended": "M2 U M U2 M' U M2", "alternates": ["R U' R U R U R U' R' U' R2"], "source": "J Perm", "note": "M2 as two quick ring-finger flicks; R/U version if M is slow."},
    {"id": "pll-ub", "recommended": "M2 U' M U2 M' U' M2", "alternates": ["R2 U R U R' U' R' U' R' U R'"], "source": "J Perm"},
    {"id": "pll-z", "recommended": "M' U M2 U M2 U M' U2 M2", "alternates": [], "source": "J Perm"},
    {"id": "pll-t", "recommended": "R U R' U' R' F R2 U' R' U' R U R' F'", "alternates": [], "source": "J Perm"},
    {"id": "pll-f", "recommended": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", "alternates": [], "source": "J Perm"},
    {"id": "pll-ja", "recommended": "x R2 F R F' R U2 r' U r U2 x'", "alternates": ["R' U L' U2 R U' R' U2 R L"], "source": "J Perm", "note": "J Perm's pick: no L-hand regrip.", "replaces": "R' U L' U2 R U' R' U2 R L"},
    {"id": "pll-jb", "recommended": "R U R' F' R U R' U' R' F R2 U' R'", "alternates": [], "source": "J Perm"},
    {"id": "pll-ra", "recommended": "R U' R' U' R U R D R' U' R D' R' U2 R'", "alternates": ["R U R' F' R U2 R' U2 R' F R U R U2 R'"], "source": "J Perm"},
    {"id": "pll-rb", "recommended": "R2 F R U R U' R' F' R U2 R' U2 R", "alternates": ["R' U2 R U2 R' F R U R' U' R' F' R2"], "source": "J Perm"},
    {"id": "pll-na", "recommended": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", "alternates": ["F' R U R' U' R' F R2 F U' R' U' R U F' R'"], "source": "J Perm"},
    {"id": "pll-nb", "recommended": "R' U R U' R' F' U' F R U R' F R' F' R U' R", "alternates": [], "source": "J Perm"},
    {"id": "pll-v", "recommended": "R' U R' U' y R' F' R2 U' R' U R' F R F", "alternates": ["R' U R U' R' f' U' R U2 R' U' R U' R' f R"], "source": "J Perm"},
    {"id": "pll-y", "recommended": "F R U' R' U' R U R' F' R U R' U' R' F R F'", "alternates": ["F R' F R2 U' R' U' R U R' F' R U R' U' F'"], "source": "J Perm"},
    {"id": "pll-ga", "recommended": "R2 U R' U R' U' R U' R2 U' D R' U R D'", "alternates": [], "source": "J Perm"},
    {"id": "pll-gb", "recommended": "R' U' R U D' R2 U R' U R U' R U' R2 D", "alternates": [], "source": "J Perm"},
    {"id": "pll-gc", "recommended": "R2 U' R U' R U R' U R2 U D' R U' R' D", "alternates": ["R2 F2 R U2 R U2 R' F R U R' U' R' F R2"], "source": "J Perm"},
    {"id": "pll-gd", "recommended": "R U R' U' D R2 U' R U' R' U R' U R2 D'", "alternates": [], "source": "J Perm"}
  ]
}
```
