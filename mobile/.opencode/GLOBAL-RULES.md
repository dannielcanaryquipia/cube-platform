# Danniel's global agent rules

These rules apply in every project, in both Claude Code and OpenCode. Source of truth: `~/.opencode/GLOBAL-RULES.md`, copied into `~/.claude/CLAUDE.md` and `~/.config/opencode/AGENTS.md` by `~/.opencode/sync-global.ps1`. A project's own CLAUDE.md / AGENTS.md wins where it disagrees.

## Skills

- My skill library lives in `~/.opencode/skills` and is linked into `~/.claude/skills`, so every skill is loadable by name with the skill tool. Guides and templates: `~/.opencode/SKILLS-GUIDE.md`, `~/.opencode/TEAM-GUIDE.md`, `~/.opencode/templates/`.
- Load a skill before the work it covers. Don't paraphrase a skill from memory.
- **The aitmpl.com catalog is reference-only.** All 925 skills and 423 agents are archived at `~/.opencode/catalog-archive/` and indexed in `~/.opencode/SKILLS-CATALOG.md`; none of it is loaded. Search the index, then promote the one component a task needs with a junction into `~/.opencode/skills` (skills) or a converted copy into `~/.opencode/agent` (agents), and run `sync-global.ps1 -NoMcp`. Never bulk-promote a category — the metadata cost lands on every request. Never claim an archived component is installed just because it exists on disk, and inspect any archived `scripts/` before invoking it.

## Astryx — first-choice design system for new projects

Astryx is the default UI design system for every project we create — web, responsive, and mobile-viewport. It is a React 19+ design system: 174 components, design tokens, themes, page/block templates, and a CLI + MCP that read the docs. Load the `astryx` skill and use the `astryx` MCP tools; don't read the package source.

- **New projects start here.** Install and pin every `@astryxdesign/*` package to the same release (no `^`/`~`): `npm install @astryxdesign/core@<v> @stylexjs/stylex @astryxdesign/theme-neutral@<v> @astryxdesign/cli@<v>`, then `astryx init` (writes the project's own AGENTS.md/CLAUDE.md Astryx block — that block wins over this file), then `astryx theme add <slug>` (default `neutral`) and `astryx build "<idea>"` before writing any page.
- **The `design-phase` gate still comes first.** Astryx is what you build the approved design with, not a way around the gate.
- **React 19+ is a hard requirement.** `react` and `react-dom` >= 19 are peer dependencies of `@astryxdesign/core`. On React 18 or lower, raise it first or ask — don't fight the peer dependency.
- **Web/responsive only.** Astryx renders to React DOM. For native mobile (React Native, SwiftUI, Jetpack Compose, Flutter) it ships no native components — do not use it as the component layer there; at most reuse its tokens/theme as a reference. Say so rather than forcing it. Mobile apps use the stack in "Mobile (Expo / React Native)" below.
- **Component order:** `astryx` first, then `suiss-ui`, then `radix-ui`, then hand-written. Drop a rung only when `astryx search` / `astryx gap-report` shows Astryx lacks the part.
- **Existing projects:** keep the current UI stack. Never introduce Astryx into an existing app on your own initiative; the user asks.
- **Style with props, then tokens.** `var(--color-*|--spacing-*|--radius-*)`; no raw `#hex`/`px`, no raw `<div>`/`<span>`, no imported `.css`/`@apply`. StyleX is the deep integration; Tailwind works through the bridge — read `astryx docs styling-overview` before fighting it.
- **Theme, not page edits.** Palette, color, spacing and density changes go through the theme (`astryx experimental theme editor ...`), never per-page overrides.
- **Verify before delivering.** Run `astryx doctor --built <dir>`; don't deliver a build it fails.

## Mobile (Expo / React Native)

For mobile apps, the stack is Expo + React Native. Astryx is web-only and is never the mobile component layer; mobile and web share **tokens**, not components.

- **Components: `@expo/ui` first.** Real SwiftUI on iOS and Jetpack Compose on Android, from React. Default to it for BottomSheet, Button, List, Switch, Slider, Picker, Menu, FieldGroup, Collapsible, Section, SegmentedControl — not Reanimated, `@gorhom/bottom-sheet`, or RN's built-in Picker/Switch. Fall back to RN built-ins only when `@expo/ui` lacks the part.
- **Requires SDK 56+.** The universal `@expo/ui` layer works in Expo Go with no custom build. On SDK 55 or lower, upgrade Expo first or ask.
- **Tokens: one theme.** `theme.ts` holding color, spacing, typography, radius, shadow, motion, per the `expo-design-system` skill. Derive mobile tokens and the astryx web theme from the same values so web and mobile cannot drift.
- **Native look:** follow `expo-native-ui` — Apple HIG, semantic colors, native controls, SF Symbols. `@expo/ui` supplies the components; this skill supplies the rules.
- **Motion:** Reanimated + react-native-gesture-handler, per `expo-animation`. Don't add a second animation library.
- **Lists:** `FlatList`/`FlashList` for data. `@expo/ui` `List` is a native grouped-rows surface (settings/forms), not a virtualized list — never use it for feeds or long data.
- **Retire `react-native-paper`:** it is Material Design and fights the native look. Migrate off it; keep it only if a project explicitly wants Material.
- **`vengeanceui` is web-only** — a shadcn-style registry with no React Native content. Never use it in an Expo app.
- **Verify:** `npx expo-doctor` before calling a mobile build done, and check on a real device or simulator (`expo-dev-client`, `eas-simulator`) — not just Expo Go.

## Skill precedence (which skill wins)

When two skills cover the same job, load the higher-ranked one and do **not** also load the loser. Ranking:

1. **`karpathy-guidelines`** — always in force for code work: think before coding, smallest surgical change, surface assumptions, define verifiable success criteria. A discipline layer, not a workflow.
2. **gstack gates** — `/review`, `/qa`, `/cso`, `/ship` own the phase exits. Skills feed a gate; they never replace one.
3. **Matt Pocock engineering suite** — the default spine for software work: `to-spec` → `to-tickets` → `implement` → `tdd` → `code-review`. Around it: `triage` for incoming issues/PRs, `wayfinder` for multi-session epics, `domain-modeling` / `codebase-design` / `improve-codebase-architecture` for architecture, `diagnosing-bugs` for hard bugs, `prototype` for spikes, `research` for investigation, `resolving-merge-conflicts` for conflicts, `ask-matt` as the router, `setup-matt-pocock-skills` once per new repo.
4. **superpowers** — verification and isolation where Pocock has no equivalent: `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`. `writing-plans` when the work is not issue-shaped.
5. **Output and mode skills** — `caveman` (compression), `i-have-adhd` (output shape), `ponytail` (deletion bias). Modes wrap the work; they don't replace its workflow.
6. **Domain packs** — design direction (`design-phase` gate, then `design-taste-frontend` or `frontend-design`; `ui-ux-pro-max` as the reference database), components (`astryx` → `suiss-ui` → `radix-ui` → hand-written), motion (`web-animation` for React/CSS, `gsap-core` for timelines/scroll-driven, `emilkowalski-motion` for micro-interactions, all reduced-motion gated), polish (`impeccable-design-polish`), diagrams (`archify`), game, mobile (`@expo/ui` + `expo-design-system` + `expo-native-ui`), media.

Tie-breaks — same job, two skills, use the left column and leave the right one unloaded:

| Job | Use | Do not also load |
|---|---|---|
| TDD | `tdd` (Pocock) | `test-driven-development`, `superpowers-tdd` |
| Bug diagnosis | `diagnosing-bugs` (Pocock) | `systematic-debugging`, `root-cause-tracing` |
| Diff review | `code-review` (Pocock) for the working diff; `/review` (gstack) at the PR gate | `requesting-code-review` |
| Research | `research` (Pocock) | `research-methodology`, `web-researcher` |
| Spec / plan | `to-spec` + `to-tickets` when it belongs in the issue tracker; `writing-plans` for a local multi-step plan | `brainstorming` except for divergent framing |
| Large epic | `wayfinder` | — |
| Design polish | `impeccable-design-polish` on an existing UI | `redesign-existing-projects` in the same pass |
| UI design system | `astryx` for a new project | `suiss-ui` / `radix-ui` for the same job |
| Mobile components | `@expo/ui` in an Expo app | `react-native-paper`, RN built-ins for the same job |
| Web platform correctness | `modern-web-guidance` — search/retrieve before writing HTML/CSS/JS | ad-hoc markup/CSS/JS from memory |

### Design and motion routing

- **Gate first:** `design-phase` before any UI build; no feature code until `DESIGN-APPROVAL.md` is signed.
- **Direction — choose one:** `design-taste-frontend` for landing pages, portfolios and redesigns; `frontend-design` for application screens and components when no direction skill fits. `design-taste-frontend-v1` only when exact v1 behavior is required.
- **Reference, not a second workflow:** `ui-ux-pro-max` — query styles, palettes, font pairings, UX rules and its 17 GSAP presets, then apply the chosen direction. Invoke it as `python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`; `${CLAUDE_PLUGIN_ROOT}` is only set for plugin installs, not this linked skill.
- **Components:** `astryx` first for new projects (see "Astryx — first-choice design system"), then `suiss-ui` (`@esuiss` registry via the shadcn MCP), then `radix-ui`, hand-written last. `oil-ui` is opt-in only.
- **Motion:** `web-animation` for React/CSS entrance, scroll reveal, stagger and hover; `gsap-core` for timelines and scroll-driven sequences. Pick one implementation per effect — never build the same reveal twice. `emilkowalski-motion` adds micro-interaction polish after the interface exists.
- **Polish last:** `impeccable-design-polish` runs the audit → refine → animate → harden → share pass.
- **Motion baseline:** every animation gates on `prefers-reduced-motion: reduce` and animates `transform`/`opacity`, never layout properties. `qa-review` verifies this in the browser.
- **Web implementation guidance — consult first:** `modern-web-guidance` is the correctness layer for any HTML/CSS/client-side JS work. Before writing or changing web UI, CSS layout/animation, forms, sanitization, dates/timezones, performance, accessibility, dark mode, dialogs/tables/selects, view transitions, scroll-driven animation, passkeys, or WebAssembly, run its `search`/`retrieve` workflow and apply the matching guides — including the fallbacks the guide requires. It constrains *how* to implement; it does **not** replace design direction (`design-phase` gate, then `design-taste-frontend`/`frontend-design`), component sourcing (`astryx` → `suiss-ui` → `radix-ui`), or motion skills.
- **Browser support policy:** Baseline Widely available features are safe without fallbacks. Adopt Newly Available features only with a feature-detected fallback that adds ≤20 lines and no external dependency. Skip polyfills unless I ask.

**User-invoked only:** `ask-matt`, `grill-with-docs`, `implement`, `improve-codebase-architecture`, `setup-matt-pocock-skills`, `to-spec`, `to-tickets`, `triage`, `wayfinder` carry `disable-model-invocation: true` in their frontmatter. They are installed and linked but deliberately hidden from the model, so I must not claim to have used one. When the work calls for one, name it and ask the user to invoke it. The other Pocock skills — `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`, `prototype`, `research`, `resolving-merge-conflicts`, `tdd` — load normally.


## How gstack and my crews split the work

gstack owns the phase gates (framing, plan review, code review, QA, security, shipping). My crews and skills do the building. In OpenCode, gstack commands are prefixed: `/gstack-office-hours`, `/gstack-review`, and so on. If a command isn't found under one name, try the other.

| Phase | gstack | My crews / skills |
|---|---|---|
| 1. Frame | `/office-hours` for a new product or feature (writes the design doc) | `brainstorming` for smaller creative calls |
| 2. Plan | `/plan-eng-review`; UI work also `/plan-design-review`; big scope `/plan-ceo-review` or `/autoplan` | `writing-plans`; UI: `design-phase` first, no feature code before `DESIGN-APPROVAL.md` |
| 3. Build | — | dispatch `dev-build`, `design-studio`, `game-dev`; `tdd` (Pocock), `ponytail` |
| 4. Debug | `/investigate` | `diagnosing-bugs` (Pocock) |
| 5. Verify | — | `verification-before-completion`: evidence before any "done" |
| 6. QA gate | `/review` on the diff, `/qa` on a running web app, `/cso` when auth, payments, uploads or secrets change | `qa-review` crew runs the gstack commands and adds `ponytail-review`, `website-compliance-checklist` for public sites |
| 7. Ship | `/ship` (tests + PR), `/land-and-deploy` once set up, `/retro` weekly | `caveman-commit` for commit messages |

- Use `/review` as the default code review. Don't also run `requesting-code-review` on the same diff.
- For risky operations (migrations, deletes, prod config) use `/careful` or `/guard`.
- `ops-planning` crew owns planning docs and model choice (`model-role-picker`).

## Delegating to OpenCode (Claude Code → OpenCode bridge)

- In Claude Code, `/opencode <crew> <task>` or the `opencode-bridge` subagent hands a self-contained task to the local OpenCode CLI, which runs the crews in `~/.opencode/agent/`. Crews: `dev-build`, `design-studio`, `game-dev`, `qa-review`, `ops-planning`.
- Use it to parallelize execution and to get a second model on implementation or review without spending Claude context. Keep architecture, product, and final accept/reject decisions in Claude — delegate execution, not judgment.
- The bridge returns `status`, changed files, verification commands, a log directory, and a session id. Treat returned files as real: `git diff` and run the tests before accepting. `status != ok` is a failure, not a partial success.
- Write the brief as if OpenCode has no context: exact paths, acceptance criteria, constraints, and verification commands. Never delegate secrets, `.env` contents, or credentials.
- Command: `node ~/.opencode/scripts/oc-delegate.mjs --crew <crew> --task "<brief>" --json`. Add `--session <id>` to continue a run, `--continue-last` for the same directory, and `--timeout <seconds>` to bound it. Details: `~/.opencode/scripts/README.md`.

## Knowledge graph (graphify)

- If the project has `graphify-out/graph.json`: run `graphify query "<question>"` before grepping, `graphify path`/`graphify explain` for relationships, and `graphify update .` after code changes.
- If it doesn't and the project is more than a few files, offer `/graphify-setup` once.
- The `graphify` MCP server serves the graph of my skill library. Use it to find which skill fits a task.

## UI and websites

- Before building UI: `design-phase`, then components in this order — **`astryx` first** for new projects (React 19+; see "Astryx — first-choice design system"), then `suiss-ui` (`@esuiss` registry via the shadcn MCP), then `radix-ui`, then hand-written. Do not substitute `oil-ui` for either.
- `oil-ui` is opt-in only: use it when I explicitly ask for design-direction exploration, a style-comparison page, or a screenshot-based visual review. Never load both `suiss-ui` and `oil-ui` on the same task.
- Motion: `web-animation` for React/CSS reveals or `gsap-core` for timelines and scroll-driven sequences — one implementation per effect, gated on `prefers-reduced-motion`. Full routing: "Design and motion routing" above.
- New client sites: start from `~/.opencode/templates/site-requirements/` (manifest-first). Never invent assets, copy or business facts; leave labeled placeholders.
- Verify finished UI in a real browser (`/qa`, `/browse` or the playwright MCP) before calling it done.

## Diagrams and visual explanation

- Architecture, workflow, sequence, data-flow, lifecycle/state, ERD, class, tree, timeline and waterfall diagrams: use **`archify`**. Do not hand-place SVG and do not default to Mermaid unless the output must live inline in Markdown.
- Archify is installed at `~/.opencode/skills/archify` (v3.2.0, vendored from `tt-a1i/archify`) and linked into `~/.claude/skills/`. Author the typed JSON, then `node ~/.opencode/skills/archify/bin/archify.mjs finalize <type> <input.json> <out.html>` — never deliver a diagram that failed validation.
- One-page answers (explainers: conclusion first, one panel per question, cited sources) are the same skill; ask for a page rather than a diagram when the question deserves prose plus evidence.
- Updating: `node ~/.opencode/skills/archify/scripts/check-update.mjs` reports the current release; reinstall with `npx -y skills@latest add https://archify.si --skill archify --agent opencode --copy --yes`.

## Modes and shared utilities

- `/i-have-adhd` or "adhd mode": load `i-have-adhd` until "normal mode" (user-invoked).
- `caveman` for terse output when asked; `ponytail` whenever a solution looks over-built.
- `caveman-help` lists the caveman modes; `caveman-stats` reports token savings; `caveman-compress` compresses memory files (owned by ops-planning).
- `ponytail-gain` shows measured impact; `ponytail-help` lists the ponytail modes; `ponytail-review`, `ponytail-audit` and `ponytail-debt` belong to QA.
- `full-output-enforcement` when a deliverable must be complete and unabridged — no placeholders, no truncation.
- Document deliverables: `docx`, `pdf`, `pptx`, `xlsx` — use the file skill rather than hand-writing OOXML/PDF.
