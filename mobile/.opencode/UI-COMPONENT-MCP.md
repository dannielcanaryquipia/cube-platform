# UI Component MCP — On-Demand Toggle & Integration Guide

This project can pull in **free open-source UI components** and **test them in a
real browser** through five MCP servers. They are defined once in
`~/.opencode/mcp-servers.json` and synced into opencode's global config
(`~/.config/opencode/opencode.json`) by `sync-global.ps1` — see the lifecycle
rules below so they only start when you need them.

For a new build, run `skills/design-phase/SKILL.md` first: components are chosen
in `COMPONENT-INVENTORY.md` and frozen in `DESIGN-APPROVAL.md` before any
integration.

## The five MCP servers

| Server | What it does | Default | How it runs |
|---|---|---|---|
| `playwright` | Opens your app in a real browser, clicks through new UI, verifies it renders & behaves, no console errors | **enabled** | local `npx @playwright/mcp@latest` |
| `shadcn` | Browse/search/install shadcn-compatible components (shadcn/ui, Skiper UI, Magic UI, Origin UI, suiss/ui registries) | **enabled** | local `npx shadcn@latest mcp` |
| `vengeanceui` | Browse/search VengeanceUI's animated component library (buttons, motion, layout kits) | **enabled when installed** | local `node ...\.mcp-servers\vengeanceui-mcp-official\dist\index.js` |
| `figma` | Pull exact layout, spacing, and props from a Figma file when one is provided | disabled | remote `https://mcp.figma.com/mcp` (OAuth) |
| `astryx` | Search Meta's Astryx components, read props, docs, templates and themes (latest release, read-only). Only for Astryx projects | **enabled** | remote `https://astryx.atmeta.com/mcp` (no install, no auth) |

## When is the server actually running?

- Nothing auto-runs at **boot or shutdown**. These are stdio child processes
  spawned by opencode, not Windows services or startup tasks. They die when
  opencode exits. Opening your laptop never starts them.
- `playwright` spins up when an opencode session starts (it's enabled by
  default so QA can verify UI in any project).
- `shadcn`, `vengeanceui`, and `figma` start **only when you enable them** for a
  component-integration task, and stop when you disable them or close opencode.

## Enabling / disabling on demand

There is no `opencode mcp enable` subcommand. Toggle servers in the single source
file `~/.opencode/mcp-servers.json` (`"enabled": true` / `false`), then re-sync:

```powershell
# edit ~/.opencode/mcp-servers.json
cd "$env:USERPROFILE\.opencode"
.\sync-global.ps1
```

Enable the ones you need before integrating a component:

```json
"shadcn":      { "enabled": true }
"vengeanceui": { "enabled": true }
"figma":       { "enabled": true }   // only if a Figma design file is involved
```

Confirm what's up:

```bash
opencode mcp list
```

Turn them back off after the integration by setting `"enabled": false` in the
same file and re-running `sync-global.ps1`. Restart opencode if it doesn't
reload the server list live.

## Where Radix fits in this stack

Two of the component sources are **Radix** under the hood:

- **`shadcn` MCP** — fetches shadcn/ui components, which are Radix Primitives + Tailwind wrappers.
- **`vengeanceui` MCP** — animated components; many build on Radix primitives too.

The **pre-styled** Radix layer (`@radix-ui/themes`) is not a registry component — you
install it directly in the project (`npm install @radix-ui/themes`, import
`styles.css`, wrap in `<Theme>`). Decide which path first:

| I want… | Use |
|---|---|
| Pre-styled theme + components immediately | Radix Themes (install directly — see `RADIX-UI.md`) |
| Radix accessibility + my own Tailwind look | `shadcn` MCP |
| Single headless primitive not wrapped by shadcn | Radix Primitives `@radix-ui/react-*` |

Decision protocol + detail: `skills/radix-ui/SKILL.md`.

## Where Astryx fits

Astryx (Meta, React 19 + StyleX) is its own design system, not a shadcn registry.
Use it only in a project that already depends on `@astryxdesign/*`, or when the
user asks for Astryx; never mix it with shadcn/suiss components in one app.

- **Agents that can run commands (OpenCode, Claude Code):** the `astryx` CLI is the
  main path, guided by `skills/astryx/SKILL.md`. Install once: `npm i -g @astryxdesign/cli`.
- **`astryx` MCP (hosted):** the same docs-only commands (search, build, component,
  docs, template, theme list) for the latest release. Fallback when the CLI can't run.
- **Project-version MCP (optional, per project):** inside an Astryx project, add
  `npx @astryxdesign/cli mcp` as a local stdio server in that project's own config
  (e.g. `.mcp.json`) to get answers for the project's exact version and theme.

## Web vs Mobile: which path

**shadcn UI components are DOM/HTML-based (React + Radix UI) — they run natively
only on the web.** Route by target platform *before* choosing a component source:

| Target | Path | Notes |
|---|---|---|
| **Website** (React / Next / Vue / Svelte) | `shadcn` MCP | First-class, works directly |
| **Web-rendered mobile** (Expo Web, React Native Web, PWA) | `shadcn` MCP | Renders through the DOM, so shadcn works |
| **Expo native** (iOS/Android) | `expo-ui` / `expo-design-system` / `expo-native-ui` skills | Do NOT use the web shadcn registry |
| **React Native (non-Expo)** | shadcn-style **port**: React Native Reusables or NativeCN UI (NativeWind-based) | Separate registry + API from web shadcn |

**Cross-platform caveat:** the web shadcn registry and the RN ports (React Native
Reusables / NativeCN / gluestack) live in **separate registries with different,
non-shared APIs**. A product shipping both web and native means you maintain two
component sets and hand-sync them — unless you use a single-API "universal"
library (Tamagui, gluestack, Uniwind) that targets both from one codebase.

## Typical integration flow (search before you build)

0. **Detect the target platform** and route (see "Web vs Mobile: which path"
   above) — web → shadcn, Expo native → expo-* skills, non-Expo RN → RN port.
   Only proceed to the shadcn steps below for web / web-rendered targets.
1. **Enable** the servers you need in `~/.opencode/mcp-servers.json` and re-run
   `sync-global.ps1` (above), then restart opencode if needed.
2. **Design source first** — if a Figma link/wireframe was provided, query the
   `figma` MCP for layout, spacing, and props as ground truth.
3. **Search, don't hand-write** — query `shadcn` and `vengeanceui` for a matching
   component (e.g. "pricing table", "slide-to-confirm button", "hero with
   gradient overlay"). Prefer an existing component over a from-scratch build.
4. **Adapt** — match the fetched component to this project's color tokens,
   spacing scale, and typography. Strip unused props/variants and any library
   branding/placeholder text.
5. **Wire it in** — place it in the existing folder structure, update imports,
   and make sure it's actually mounted in the render tree.
6. **Verify with Playwright** — open the dev server, navigate to the page, take a
   snapshot, confirm no console errors, and interact with any interactive
   elements. Fix anything broken and re-verify.
7. **Report the source** — name the library/component used (e.g. "shadcn/ui
   `Card` + Magic UI `ShimmerButton`") so the dependency footprint stays traceable.
8. **Disable** the servers again when done (set `"enabled": false` and re-sync).

## When NOT to use a library component

- The UI is trivial (a single styled `<div>`, a one-line text block) — write it directly.
- No registry has a reasonable match — build custom and note no library match was found.
- The component pulls a heavy dependency for a minor effect — flag the tradeoff
  instead of silently installing it.

## Per-project registry setup (shadcn)

The `shadcn` server browses registries configured in a project's
`components.json`. The standard shadcn/ui registry works with no config; to add
extra registries (Skiper UI, Magic UI, Origin UI), put them in that file:

```json
{
  "registries": {
    "@skiper": "https://skiperui.com/r/{name}.json",
    "@magicui": "https://magicui.design/r/{name}.json",
    "@originui": "https://originui.com/r/{name}.json",
    "@esuiss": "https://suiss.app/ui/r/{style}/{name}.json"
  }
}
```

`@esuiss` is suiss/ui — a 232-item shadcn-spec registry (components, blocks,
charts, patterns, interactions) for React, React Native, SwiftUI and Jetpack
Compose. The `{style}` placeholder is resolved from `components.json`, so
`radix-nova` fetches the radix base in the nova style; RN and native styles use
the platform-specific names (`rn-uniwind-suiss`, `rn-nativewind-suiss`,
`rn-stylesheet-suiss`, `swift-suiss`, `kotlin-suiss`). Full protocol:
`skills/suiss-ui/SKILL.md`.

## Crew ownership

- **design-studio** — step 0 platform routing, steps 2–4: design-source lookup, component search, adaptation.
- **dev-build** — step 6: wiring into the codebase, folder structure, imports.
- **qa-review** — step 7: Playwright browser verification as part of its QA gate.

## Files & locations

- Global MCP source: `~/.opencode/mcp-servers.json` (synced to `~/.config/opencode/opencode.json`)
- Integration protocol: `skills/ui-component-integration.md`
- Built VengeanceUI server: `C:\Users\Danniel Canary\.mcp-servers\vengeanceui-mcp\dist\server.js`
- This guide: `UI-COMPONENT-MCP.md`
