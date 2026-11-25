# Finger-trick-friendly CFOP algorithms

Nov 25, 2026 · @Danniel Canary

## Summary

The site's OLL and PLL picks already match J Perm's recommended list for 49 of 57 OLLs and 20 of 21 PLLs, so the big wins are in F2L: 15 of the 41 F2L cases should switch from F-move chains to the community's top-voted R/U algs. In total I recommend changing 15 F2L, 7 OLL and 1 PLL primary algorithms, plus replacing a broken OLL alternatives list (details under Bugs).

- **Sources:** [SpeedCubeDB](https://speedcubedb.com/a/3x3/F2L) (top-voted algs per case, F2L, [OLL](https://speedcubedb.com/a/3x3/OLL), [PLL](https://speedcubedb.com/a/3x3/PLL)) and J Perm's [OLL](https://jperm.net/algs/oll) and [PLL](https://jperm.net/algs/pll) pages, all read on 2026-11-25. J Perm's [Best F2L Algorithms](https://bit.ly/bestf2l) PDF was used as a cross-check. CubeSkills (Feliks Zemdegs) is behind a paywall and AlgDb was not opened, so neither is cited.
- **How I checked:** every recommended algorithm below was run through the site's own cube simulator (`src/lib/cube.js` and `src/lib/recognize.js`) against the site's current case. Every one solves its case. F2L case numbers are the site's own numbering, which differs from SpeedCubeDB's; I matched cases by cube state, not by number.
- **Rule of thumb used:** prefer algs with no cube rotation, no regrip, and only R, U, r and M moves. F moves and the sledgehammer (R' F R F') are fine. B moves and long F' U F chains are avoided.

## F2L (front-right slot, white cross on the bottom)

Switch the 15 bold rows; the other 26 are already the community's pick. Case numbers are the site's own; algs that start with a U already include the pre-AUF the site's diagram needs. The Advanced F2L set (front-left and back slots) is mirrored from these, so it should be regenerated from the new list rather than edited by hand.

| Case | Current | Recommended | Alternate | Source | Finger-trick note |
| --- | --- | --- | --- | --- | --- |
| F2L 1 | same | `F' U' F` | `y' R' U' R` | SpeedCubeDB | Use the rotation version if F moves feel slow. |
| F2L 2 | same | `R U R'` |  | SpeedCubeDB | The basic insert: right index flicks U. |
| F2L 3 | same | `U R U' R'` | `R' F R F'` | SpeedCubeDB | Left index does U'. |
| F2L 4 | `U' F' U F` | **`F R' F' R`** | `U' F' U F` | SpeedCubeDB | Sledgehammer backwards, no AUF needed. |
| F2L 5 | same | `R' U2 R2 U R2 U R` | `R U' R' U R U' R' U2 R U' R'` | SpeedCubeDB | Keep thumb on front; R2s are wrist turns. |
| F2L 6 | same | `R U' R' U2 F' U' F` |  | SpeedCubeDB | Push F' with left thumb after the U2 double flick. |
| F2L 7 | same | `F' U F U2 R U R'` | `R U R' U2 R U' R' U R U' R'` | SpeedCubeDB | The pure R/U version avoids F if you prefer. |
| F2L 8 | same | `U' R U R' U2 R U' R'` | `U' R U R' U' R U2 R'` | SpeedCubeDB | All R/U; U2 as a right index + middle double flick. |
| F2L 9 | `U F' U' F U2 F' U F` | **`U' r U' R' U R U r'`** | `d R' U' R U2 R' U R` | SpeedCubeDB | Wide r keeps it in R/U grip, replaces the old F' chain. |
| F2L 10 | `U' R U2 R' U2 R U' R'` | **`U' R U2 R' U' R U2 R'`** | `U' R U2 R' U2 R U' R'` | SpeedCubeDB | Two identical R U2 R' triggers. |
| F2L 11 | `U F' U2 F U2 F' U F` | **`r' U2 R2 U R2 U r`** | `d R' U2 R U R' U2 R` | SpeedCubeDB | Wide-move twin of case 5; replaces the old F' chain. |
| F2L 12 | same | `U' R U' R' U F' U' F` | `U' R U' R' d R' U' R` | SpeedCubeDB | F' U' F with left thumb on F'. |
| F2L 13 | same | `U' R U R' U R U R'` | `U2 R U' R' U' R U R'` | SpeedCubeDB | Pure R/U. |
| F2L 14 | same | `U' R U2 R' U F' U' F` | `U' R U2 R' d R' U' R` | SpeedCubeDB |  |
| F2L 15 | `U F' U F U' F' U' F` | **`y' U R' U R U' R' U' R`** | `d R' U R U' R' U' R` | SpeedCubeDB | Rotate once, then it is a back-slot style R'/U alg. |
| F2L 16 | same | `U' R U' R' U R U R'` | `U2 R2 U R' U R U2 R2` | SpeedCubeDB | Pure R/U. |
| F2L 17 | `F' U2 F2 R' F' R` | **`y' R' U2 R U' R' U R`** | `R U' R2 F R F' R U' R'` | SpeedCubeDB | Replaces F' U2 F2 R' F' R (F2 is slow). |
| F2L 18 | same | `R U R' F' U' F` | `U2 r U' r' U2 r U r'` | SpeedCubeDB | Keep; the r version is the top vote but needs a U2. |
| F2L 19 | same | `R U2 R' U' R U R'` |  | SpeedCubeDB | Pure R/U. |
| F2L 20 | `F' U2 F U F' U' F` | **`y' R' U2 R U R' U' R`** | `F' U2 F U F' U' F` | SpeedCubeDB | Rotation version avoids three F' turns. |
| F2L 21 | `F2 U2 F U F' U F2` | **`U2 F U R U' R' F' R U' R'`** | `U R U R2 F R F' R U' R'` | SpeedCubeDB | Replaces F2 U2 F U F' U F2 (F2 turns are slow). |
| F2L 22 | same | `U R U2 R' U R U' R'` | `U R U2 R2 F R F'` | SpeedCubeDB |  |
| F2L 23 | same | `U2 R U R' U R U' R'` | `R U' R' U2 R U R'` | SpeedCubeDB |  |
| F2L 24 | same | `U2 R2 U2 R' U' R U' R2` | `R U R' U2 R U R' U' R U R'` | SpeedCubeDB | R2 moves are wrist turns; no regrip. |
| F2L 25 | same | `R U' R' U R U' R'` |  | SpeedCubeDB | Pure R/U. |
| F2L 26 | `F' U F U' F' U F` | **`R U R' U' F R' F' R`** | `y L' U L U' L' U L` | SpeedCubeDB | Sexy move into reverse sledgehammer; replaces an F' chain. |
| F2L 27 | same | `R U R' U' R U R'` |  | SpeedCubeDB | Pure R/U. |
| F2L 28 | `F' U' F U F' U' F` | **`R' F R F' U R U' R'`** | `F' U' F U F' U' F` | SpeedCubeDB | Sledgehammer then insert; replaces an F' chain. |
| F2L 29 | `U R U' R' U' F' U F` | **`U R U' R' F R' F' R`** | `U R U' R' U' F' U F` | SpeedCubeDB | Ends with reverse sledgehammer. |
| F2L 30 | `U' F' U F U R U' R'` | **`U' R' F R F' R U R'`** | `U' F' U F U R U' R'` | SpeedCubeDB | Starts with sledgehammer. |
| F2L 31 | `F' U F R U2 R'` | **`U' R' F R F' R U' R'`** | `F' U F R U2 R'` | SpeedCubeDB | Sledgehammer, then R U' R'. |
| F2L 32 | same | `U' R U' R' U2 R U' R'` | `U' R U' R' U' R U2 R'` | SpeedCubeDB | Pure R/U. |
| F2L 33 | same | `U R U R' U2 R U R'` | `U' R U2 R' U R U R'` | SpeedCubeDB | Pure R/U. |
| F2L 34 | same | `U' R U R' U F' U' F` | `U' R U R' d R' U' R` | SpeedCubeDB |  |
| F2L 35 | same | `U F' U' F U' R U R'` | `U2 R' F R F' U2 R U R'` | SpeedCubeDB |  |
| F2L 36 | same | `R U R' U' R U R' U' R U R'` | `R2 U R2 U R2 U2 R2` | SpeedCubeDB | Three sexy-style triggers; the R2 version is shorter. |
| F2L 37 | same | `R2 U2 F R2 F' U2 R' U R'` | `R U2 R' U R U2 R' U F' U' F` | SpeedCubeDB |  |
| F2L 38 | `R F U R U' R' F' U' R'` | **`r U' r' U2 r U r' R U R'`** | `R F U R U' R' F' U' R'` | SpeedCubeDB | Wide-move version keeps R/U grip. |
| F2L 39 | `R U F R U R' U' F' R'` | **`R U' R' r U' r' U2 r U r'`** | `R U F R U R' U' F' R'` | SpeedCubeDB | Wide-move version keeps R/U grip. |
| F2L 40 | same | `R U' R' U' R U R' U2 R U' R'` | `R2 U2 R' U' R U' R' U2 R'` | SpeedCubeDB | Pure R/U. |
| F2L 41 | same | `R U' R' U R U2 R' U R U' R'` | `R U2 R U R' U R U2 R2` | SpeedCubeDB | Pure R/U. |

## OLL

Switch the 7 bold rows: three dot cases (2, 3, 4) and OLL 17 move to J Perm's faster M-slice algs, OLL 32 and 52 drop their B moves, and OLL 55 gets 4 moves shorter. Because the site draws each OLL diagram from its algorithm, a new alg may show the case turned by a U move; that is expected and correct.

| Case | Current | Recommended | Alternate | Source | Finger-trick note |
| --- | --- | --- | --- | --- | --- |
| OLL 1 | same | `R U2 R2 F R F' U2 R' F R F'` |  | J Perm |  |
| OLL 2 | `F R U R' U' F' f R U R' U' f'` | **`r U r' U2 r U2 R' U2 R U' r'`** | `F R U R' U' F' f R U R' U' f'` | J Perm | No regrips, wide r in R/U grip. |
| OLL 3 | `f R U R' U' f' U' F R U R' U' F'` | **`r' R2 U R' U r U2 r' U M'`** | `f R U R' U' f' U' F R U R' U' F'` | J Perm | M' at the end with left ring finger. |
| OLL 4 | `f R U R' U' f' U F R U R' U' F'` | **`M U' r U2 r' U' R U' R' M'`** | `f R U R' U' f' U F R U R' U' F'` | J Perm | Starts and ends with M slices. |
| OLL 5 | same | `r' U2 R U R' U r` |  | SpeedCubeDB |  |
| OLL 6 | same | `r U2 R' U' R U' r'` |  | J Perm |  |
| OLL 7 | same | `r U R' U R U2 r'` |  | J Perm |  |
| OLL 8 | same | `r' U' R U' R' U2 r` |  | SpeedCubeDB |  |
| OLL 9 | same | `R U R' U' R' F R2 U R' U' F'` |  | J Perm |  |
| OLL 10 | same | `R U R' U R' F R F' R U2 R'` |  | J Perm |  |
| OLL 11 | same | `r U R' U R' F R F' R U2 r'` | `r' R2 U R' U R U2 R' U M'` | J Perm |  |
| OLL 12 | same | `M' R' U' R U' R' U2 R U' R r'` |  | J Perm |  |
| OLL 13 | same | `F U R U' R2 F' R U R U' R'` | `r U' r' U' r U r' F' U F` | J Perm |  |
| OLL 14 | same | `R' F R U R' F' R F U' F'` |  | J Perm |  |
| OLL 15 | same | `r' U' r R' U' R U r' U r` |  | SpeedCubeDB |  |
| OLL 16 | same | `r U r' R U R' U' r U' r'` |  | J Perm |  |
| OLL 17 | `R U R' U R' F R F' U2 R' F R F'` | **`F R' F' R2 r' U R U' R' U' M'`** | `R U R' U R' F R F' U2 R' F R F'` | J Perm | Shorter than two sledgehammers. |
| OLL 18 | same | `r U R' U R U2 r2 U' R U' R' U2 r` | `R U2 R2 F R F' U2 M' U R U' r'` | J Perm |  |
| OLL 19 | same | `M U R U R' U' M' R' F R F'` |  | SpeedCubeDB |  |
| OLL 20 | same | `r U R' U' M2 U R U' R' U' M'` |  | J Perm |  |
| OLL 21 | same | `R U2 R' U' R U R' U' R U' R'` |  | J Perm |  |
| OLL 22 | same | `R U2 R2 U' R2 U' R2 U2 R` |  | J Perm |  |
| OLL 23 | same | `R2 D' R U2 R' D R U2 R` |  | J Perm |  |
| OLL 24 | same | `r U R' U' r' F R F'` |  | J Perm |  |
| OLL 25 | same | `F' r U R' U' r' F R` |  | J Perm |  |
| OLL 26 | same | `R U2 R' U' R U' R'` |  | J Perm |  |
| OLL 27 | same | `R U R' U R U2 R'` |  | J Perm |  |
| OLL 28 | same | `r U R' U' M U R U' R'` |  | SpeedCubeDB |  |
| OLL 29 | same | `R U R' U' R U' R' F' U' F R U R'` | `r2 D' r U r' D r2 U' r' U' r` | J Perm |  |
| OLL 30 | same | `F R' F R2 U' R' U' R U R' F2` | `F U R U2 R' U' R U2 R' U' F'` | J Perm |  |
| OLL 31 | same | `R' U' F U R U' R' F' R` |  | J Perm |  |
| OLL 32 | `R U B' U' R' U R B R'` | **`S R U R' U' R' F R f'`** | `L U F' U' L' U L F L'` | SpeedCubeDB | Replaces R U B' U' R' U R B R' (B moves are slow). |
| OLL 33 | same | `R U R' U' R' F R F'` |  | J Perm |  |
| OLL 34 | same | `R U R2 U' R' F R U R U' F'` |  | J Perm |  |
| OLL 35 | same | `R U2 R2 F R F' R U2 R'` |  | J Perm |  |
| OLL 36 | same | `L' U' L U' L' U L U L F' L' F` |  | J Perm |  |
| OLL 37 | same | `F R' F' R U R U' R'` |  | J Perm |  |
| OLL 38 | same | `R U R' U R U' R' U' R' F R F'` |  | J Perm |  |
| OLL 39 | same | `L F' L' U' L U F U' L'` |  | J Perm |  |
| OLL 40 | same | `R' F R U R' U' F' U R` |  | J Perm |  |
| OLL 41 | same | `R U R' U R U2 R' F R U R' U' F'` |  | J Perm |  |
| OLL 42 | same | `R' U' R U' R' U2 R F R U R' U' F'` |  | J Perm |  |
| OLL 43 | same | `F' U' L' U L F` | `R' U' F' U F R` | J Perm | Alternate keeps you on the right hand. |
| OLL 44 | same | `F U R U' R' F'` |  | J Perm |  |
| OLL 45 | same | `F R U R' U' F'` |  | J Perm |  |
| OLL 46 | same | `R' U' R' F R F' U R` |  | J Perm |  |
| OLL 47 | same | `R' U' R' F R F' R' F R F' U R` |  | J Perm |  |
| OLL 48 | same | `F R U R' U' R U R' U' F'` |  | J Perm |  |
| OLL 49 | same | `r U' r2 U r2 U r2 U' r` |  | J Perm |  |
| OLL 50 | same | `r' U r2 U' r2 U' r2 U r'` |  | J Perm |  |
| OLL 51 | same | `F U R U' R' U R U' R' F'` |  | J Perm |  |
| OLL 52 | `R U R' U R U' B U' B' R'` | **`R' F' U' F U' R U R' U R`** | `R U R' U R U' B U' B' R'` | SpeedCubeDB | Replaces the B-move alg. |
| OLL 53 | same | `l' U2 L U L' U' L U L' U l` |  | J Perm |  |
| OLL 54 | same | `r U2 R' U' R U R' U' R U' r'` |  | J Perm |  |
| OLL 55 | `R' F R U R U' R2 F' R2 U' R' U R U R'` | **`R U2 R2 U' R U' R' U2 F R F'`** | `R' F R U R U' R2 F' R2 U' R' U R U R'` | SpeedCubeDB | 11 moves instead of 15. |
| OLL 56 | same | `r' U' r U' R' U R U' R' U R r' U r` | `r U r' U R U' R' U R U' R' r U' r'` | J Perm |  |
| OLL 57 | same | `R U R' U' M' U R U' r'` |  | J Perm |  |

## PLL

Only Ja changes: J Perm's `x R2 F R F' R U2 r' U r U2` is right-hand only, where the current one needs an L regrip. The rest already match J Perm's list; the alternates are verified second choices from SpeedCubeDB. Algs that start with `x` end with `x'` (or `x`) so the site's simulator returns the cube to its home orientation.

| Case | Current | Recommended | Alternate | Source | Finger-trick note |
| --- | --- | --- | --- | --- | --- |
| PLL Aa | same | `x R' U R' D2 R U' R' D2 R2 x'` | `x L2 D2 L' U' L D2 L' U L' x'` | J Perm / SpeedCubeDB | Do D2 as a double flick with the left ring finger. |
| PLL Ab | same | `x R2' D2 R U R' D2 R U' R x'` | `x' L2 D2 L U L' D2 L U' L x` | J Perm / SpeedCubeDB |  |
| PLL E | same | `x' R U' R' D R U R' D' R U R' D R U' R' D' x` | `R2 U F' R' U R U' R' U R U' R' U R U' F U' R2` | J Perm / SpeedCubeDB |  |
| PLL H | same | `M2 U M2 U2 M2 U M2` |  | J Perm |  |
| PLL Ua | same | `M2 U M U2 M' U M2` | `R U' R U R U R U' R' U' R2` | J Perm | M2 as two quick ring-finger flicks; R/U version if M is slow. |
| PLL Ub | same | `M2 U' M U2 M' U' M2` | `R2 U R U R' U' R' U' R' U R'` | J Perm |  |
| PLL Z | same | `M' U M2 U M2 U M' U2 M2` |  | J Perm |  |
| PLL T | same | `R U R' U' R' F R2 U' R' U' R U R' F'` |  | J Perm |  |
| PLL F | same | `R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R` |  | J Perm |  |
| PLL Ja | `R' U L' U2 R U' R' U2 R L` | **`x R2 F R F' R U2 r' U r U2 x'`** | `R' U L' U2 R U' R' U2 R L` | J Perm | No left-hand regrip. |
| PLL Jb | same | `R U R' F' R U R' U' R' F R2 U' R'` |  | J Perm |  |
| PLL Ra | same | `R U' R' U' R U R D R' U' R D' R' U2 R'` | `R U R' F' R U2 R' U2 R' F R U R U2 R'` | J Perm |  |
| PLL Rb | same | `R2 F R U R U' R' F' R U2 R' U2 R` | `R' U2 R U2 R' F R U R' U' R' F' R2` | J Perm |  |
| PLL Na | same | `R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'` | `F' R U R' U' R' F R2 F U' R' U' R U F' R'` | J Perm |  |
| PLL Nb | same | `R' U R U' R' F' U' F R U R' F R' F' R U' R` |  | J Perm |  |
| PLL V | same | `R' U R' U' y R' F' R2 U' R' U R' F R F` | `R' U R U' R' f' U' R U2 R' U' R U' R' f R` | J Perm |  |
| PLL Y | same | `F R U' R' U' R U R' F' R U R' U' R' F R F'` | `F R' F R2 U' R' U' R U R' F' R U R' U' F'` | J Perm |  |
| PLL Ga | same | `R2 U R' U R' U' R U' R2 U' D R' U R D'` |  | J Perm |  |
| PLL Gb | same | `R' U' R U D' R2 U R' U R U' R U' R2 D` |  | J Perm |  |
| PLL Gc | same | `R2 U' R U' R U R' U R2 U D' R U' R' D` | `R2 F2 R U2 R U2 R' F R U R' U' R' F R2` | J Perm |  |
| PLL Gd | same | `R U R' U' D R2 U' R U' R' U R' U R2 D'` |  | J Perm |  |

## Bugs found in the current alg data

The OLL alternates list is broken and should be fixed in the same update. I found these while checking the picks; none of them is fixed yet.

1. **Every OLL case shows the same 15 alternates.** `OLL_WIKI` in `src/data/ll.js` holds one identical list under all 57 keys. Run through the site's simulator, 840 of the 901 OLL alternates on the site do not solve the case they are shown on.
2. **PLL alternates are not checked.** `PLL_WIKI` alternates are never verified by `npm run verify`; 30 of 262 fail the simulator check. Some may only lack a closing rotation (item 4).
3. **The F2L check is too strict for alternates.** `scripts/verify.mjs` requires every F2L alternate to leave the whole cube in exactly the same state as the primary. Two algs that solve the same pair usually leave the last layer differently, so the check rejects good alternates. It should only require the F2L pieces to end up solved.
4. **Trailing rotations.** J Perm writes some algs without the closing rotation (for example Aa as `x L2 D2 L' U' L D2 L' U L'`). The site's simulator rejected those until I added the closing `x'`, so the data should always include it.

## Hand-off prompt for the AI agent

The ready-to-paste prompt is the file `handoff-prompt.md` in the project's `cube-platform/alg-research/` folder. It is self-contained: it explains how the site stores algorithms (`src/data/f2l.json`, `src/data/ll.js`, `sets.js`, `CaseImage.jsx`, `scripts/verify.mjs`) and carries all 188 verified algorithms as JSON. `recommended-algs.json` in the same folder holds the same data with the current algs beside each pick.

What the prompt tells the agent to do:

1. Set the new primary alg for each case and rebuild each case's alternates list, keeping the old alg as an alternate.
2. Regenerate Advanced F2L from the new basic set, using rotation-free alternates where the primary has a `y'`.
3. Replace the broken `OLL_WIKI` and the unchecked `PLL_WIKI` alternates with the verified ones.
4. Show the source and finger-trick note on each case page.
5. Fix `scripts/verify.mjs` so F2L alternates are checked by "solves the pair" and OLL/PLL alternates are checked at all.
6. Pass `npm run verify`, `lint` and `build`, then open a pull request on a new branch without merging.

Nothing on the site has been changed, pushed or opened as a PR yet.

## Sources

- [SpeedCubeDB F2L](https://speedcubedb.com/a/3x3/F2L), [OLL](https://speedcubedb.com/a/3x3/OLL), [PLL](https://speedcubedb.com/a/3x3/PLL)
- [J Perm OLL](https://jperm.net/algs/oll), [J Perm PLL](https://jperm.net/algs/pll), [J Perm Best F2L Algorithms (PDF)](https://bit.ly/bestf2l)
