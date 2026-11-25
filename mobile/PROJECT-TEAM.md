# Project Team Guide

This project runs with a dev team. Read `.opencode/TEAM-GUIDE.md` before starting any work — it defines the 5 crews (subagents), their skill inventories, and the work-splitting protocol.

## Your team
- **Developers** — `dev-build`: features, refactors, bugfixes
- **Design Studio** — `design-studio`: UI, visual direction, redesigns
- **Game Dev** — `game-dev`: Unity/Unreal/Godot/web games
- **QA/Review** — `qa-review`: review gates and completion verification (read-only)
- **Ops/Planning** — `ops-planning`: specs, plans, work splitting, coordination

## How to work here
1. **Read first** — this file, `.opencode/TEAM-GUIDE.md`, then `AGENTS.md`, `PORTING.md`, and existing structure
2. **Plan before code** — ops-planning/brainstorming for anything non-trivial; write specs to `docs/superpowers/specs/`
3. **Design gate** — for UI work, `design-studio` runs `design-phase`; no feature code until `docs/design/DESIGN-APPROVAL.md` is signed
4. **Split work by crew** — dispatch via Task tool or OpenCode `oc-delegate`; parallel when independent
5. **Never skip the gate** — `qa-review` before claiming completion
6. **Evidence** — lint/typecheck/build/tests with real output, always

## Project context
- **Purpose:** Native iOS/Android CFOP 3x3 learning app, transcribed from the Layer by Layer website (`../`) — same algorithms, progress, timer, and solve tools, redesigned for mobile rather than reskinned.
- **Stack:** Expo SDK 58, React Native 0.88, Expo Router, `@expo/ui`, Reanimated, AsyncStorage. Brand tokens live in `src/constants/theme.ts`.
- **Conventions:** Routes in `src/app/` only. Native chrome first (`NativeTabs`, stack large titles, `@expo/ui` controls). Keep the web app unchanged. Share data/logic from the parent repo; rewrite UI natively.
- **Deployment:** Expo Go for day-to-day; EAS for store builds later.
- **Skills source:** Universal Agent Workspace at `~/.universal-agent-workspace`, synced into Cursor / Claude / OpenCode. Expo skills (`expo-overview` → `expo-native-ui` / `expo-ui` / `expo-router` / `expo-design-system` / `expo-web-to-native`) own mobile UI.
- **MCPs:** `context7` for versioned Expo docs, `shadcn` / `vengeanceui` only if a web sibling needs them, `playwright` for the website, not this native app.
