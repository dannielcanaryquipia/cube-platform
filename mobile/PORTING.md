# Layer by Layer — Mobile Porting Brief

This folder is the **Expo / React Native** port of the Layer by Layer web app (`../`). The web app is the feature reference; mobile should be native-feeling, not a webview.

## Source of truth (web)

- Web app: repo root (`../`)
- Key docs: `../docs/PROJECT-DOCUMENTATION.md`, `../README.md`
- App shell/routes: `../src/App.jsx`
- Pages: `../src/pages/` — `Home`, `Notation`, `Cross`, `AlgSet` (F2L/OLL/PLL), `CasePage`, `Solve`, `CubeTimer`, `Search`, `Settings`
- Data: `../src/data/` (CFOP cases/algorithms/sets)
- State/lib: `../src/lib/` — `progress.js`, `stars.js`, `cubeColors.js`, `themeMode.js`
- Components: `../src/components/` — `TwistyPlayer`, `CubeNet`, `BootLoader`, `CubeColorSettings`, etc.
- Styling: `../src/index.css`, `../src/themes/cube/`

## Product goal

A clean CFOP 3x3 Rubik's Cube learning app for iOS/Android (and web via Expo) with the same learning value as the web app, redesigned for mobile interaction.

## Feature map (web → mobile)

| Web feature | Mobile direction | Notes |
|---|---|---|
| Boot/loading animation | Native splash/boot experience | Keep brand feel; avoid long blocking delays |
| Home / learning path | Home screen with CFOP path | Clear next-step CTA |
| Notation | Notation screen | Finger tricks/moves, readable on small screens |
| Cross | Cross lesson screen | Step-by-step, visual |
| F2L/OLL/PLL sets | Alg set screens + case list/detail | Fast browse, search/filter, favorites/stars |
| Case page | Case detail screen | Alg, recognition, 3D/visual aid |
| Search | Search screen/modal | Search cases/algs |
| Solve (paint + solve) | Solve flow | Complex; evaluate cubing.js/RN 3D feasibility |
| Timer | Timer screen | Big touch targets, scramble, stats, gestures |
| Settings/About | Settings screen | Appearance, theme mode, about/creator/copyright |
| Progress/stars | Persisted local state | Use Expo/React Native storage, not localStorage |
| Cube color customization | Settings/control | Keep color semantics consistent |
| Theme mode light/dark/system | Native appearance mode | Use design tokens + system scheme |

## Mobile stack constraints

- **Expo SDK 58 / React Native 0.88 / React 19** (see `package.json`).
- **Expo Router** for navigation (`src/app/` routes only).
- **`@expo/ui` first** for native components where available (BottomSheet, Picker, Switch, Slider, Menu, List for grouped rows/settings, etc.). `@expo/ui` List is **not** a virtualized list — use `FlatList`/`FlashList` for large datasets.
- **Design system:** create `src/theme.ts` / tokens per `expo-design-system`; follow `expo-native-ui` for HIG/native feel.
- **Animation:** Reanimated + Gesture Handler (already installed). Respect reduced motion.
- **No Astryx/DOM web components.** Share product logic/data where possible; rewrite UI natively.
- **Storage:** replace `localStorage` with `expo-sqlite`/`AsyncStorage`/`expo-file-system`/appropriate Expo storage; decide per data shape.
- **3D/cubing.js:** web uses `cubing.js` TwistyPlayer (DOM). Mobile needs a spike: evaluate RN WebView, `expo-gl`, or native-friendly alternative before committing.

## Suggested first milestones

1. **Foundation:** theme tokens, app shell/navigation tabs/stacks, settings + theme mode persistence.
2. **Content parity:** notation/cross/alg data models ported, case lists/details, search.
3. **Training UX:** progress/stars, timer, cube color settings.
4. **Advanced:** solve/3D cube experience after feasibility spike.

## Agent workflow

- Load `expo-overview` before Expo work; route to the specific `expo-*` skill.
- Before UI: follow mobile AGENTS/global rules; use `expo-design-system`, `expo-native-ui`, `expo-ui`, `expo-router`, `expo-animation` as appropriate.
- Run `npx tsc --noEmit` and `npx expo lint` (after lint is configured) before declaring tasks done.
- Keep web app unchanged unless explicitly asked; mobile work lives in `mobile/`.

## Status (updated)

- **Native chrome (v1.1):** NativeTabs + nested large-title stacks, system back headers on pushed screens, header search on Home/Search (iOS), grouped Settings. Brand tokens unchanged. See `docs/design/DESIGN-APPROVAL.md`.
- **Design system parity:** web tokens ported to `src/constants/theme.ts` (exact light/dark palette, Rubik 400–800, web type scale, spacing, radius 14, boxShadow, ring). Rubik loaded via `@expo-google-fonts/rubik` in root layout. Shared primitives in `src/components/ui.tsx` (Screen/PageScroll/PageHeader/Card/Btn/Chip/Progress/SearchField/Input/Note/MovePill/StageMove/IconButton/etc.). `@expo/ui` universal components used where native controls fit: `Host`+`Picker` (theme mode), `Host`+`Switch` (timer inspection/hold), `Host`+`Slider` (player speed). RN primitives retained for grids/wrapping layouts because `@expo/ui` stacks lack flex-wrap/flex-grow.
- **Foundation:** theme tokens, tab/stack navigation, light/dark/system mode, AsyncStorage persistence — done.
- **Content parity:** notation/cross/alg sets/case detail/search ported; case detail has prev/next and links; search has starred filter and query param — done.
- **Training UX:** progress/stars, timer with scramble/inspection/WCA +2-DNF/hold-to-start/Ao5-Ao12/penalties/haptics, cube color settings — done.
- **Solve:** cube net paint editor, typed scramble, staged CFOP solver output, undo, case links — done.
- **Advanced/3D:** Phase 1 WebView+cubing.js prototype added (`src/components/cube-player.tsx`) and wired into Case and Solve; still needs device QA, offline/bundled asset strategy, and color/stickering parity.
- **Verification:** `npx tsc --noEmit` clean, `npx expo lint` clean after the native-chrome pass. Device/simulator visual QA not run in this environment.
