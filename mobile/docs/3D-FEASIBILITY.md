# 3D Cube Visualization — Feasibility Spike

## Goal

Bring case/solve 3D cube visualization to mobile (currently web uses `cubing.js` TwistyPlayer DOM component). This is PORTING.md milestone 4.

## Constraints

- Expo SDK 58 / RN 0.88 / React 19, Expo Router.
- App already has `react-native-web` and web output; native iOS/Android are primary targets.
- No DOM TwistyPlayer on native. `cubing.js` depends on browser APIs/custom elements.
- Must respect performance (low-end Android) and bundle size.

## Options

| Option | Pros | Cons | Effort |
|---|---|---|---|
| **WebView + cubing.js** | Fastest parity; reuse existing TwistyPlayer/alg rendering; minimal 3D code | WebView overhead; message bridge for controls; offline/bundling asset management; less "native" feel | Medium |
| **expo-gl + three.js / custom renderer** | Native rendering, no WebView; full control | High effort; need cube model, sticker mapping, animation, controls; maintenance burden | High |
| **react-three-fiber/native** | React declarative 3D | RN support/compat varies; still needs cube scene/animation work | High |
| **Static/SVG cube net + move animation** | Simple, reliable, no 3D dep | Not true 3D; less intuitive for case recognition | Low-Medium |
| **Pre-rendered images/Lottie per case** | Very fast runtime | Asset pipeline large (many cases); not interactive; hard for arbitrary scrambles | Medium |

## Recommendation

**Phase 1 (spike/prototype): WebView + cubing.js**
- Bundle a minimal HTML page that loads `cubing.js` (or host a local asset) and exposes a small postMessage API: `setAlg`, `setSetup`, `play/pause/reset`, `setColors`.
- Wrap in a `CubePlayer` RN component with a loading state and fallback.
- Validate on iOS/Android dev builds (WebView behavior differs from Expo Go web).

**Phase 2 (if needed): evaluate native renderer**
- Only if WebView performance/UX is insufficient. Consider a small purpose-built cube renderer (54 stickers, quaternion/step animation) rather than full three.js.

## Integration points

- `mobile/src/app/case/[id].tsx` — case detail 3D view placeholder.
- `mobile/src/app/solve.tsx` — staged solution playback placeholder.
- `mobile/src/lib/cubeColors.js` — already has color state; pass into viewer.
- Web reference: `src/components/CubePlayer.jsx`, `src/components/TwistyPlayer.jsx`.

## Acceptance criteria for spike

- Renders a known alg on iOS and Android dev build.
- Supports setup/alg/colors.
- Play/pause/reset/scrub controls work via bridge.
- Graceful fallback when WebView/asset fails.
- No regression to existing screens.