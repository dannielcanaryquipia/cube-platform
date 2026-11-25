# Dev Team Guide

Your project has a **dev team** — 5 crews implemented as subagents. Whenever you take on work in this project, read this file: it defines the team, the full skill inventory per crew, and the work-splitting protocol. The `skills/` folder currently holds **121 collections / 394 `SKILL.md` files** (357 unique skill
names linked into `~/.claude/skills/`); the inventories below are the authoritative map of which crew commands what.

## Priority skills (apply to every crew)

Ordered; full precedence and tie-breaks live in `GLOBAL-RULES.md` → "Skill precedence".

1. `karpathy-guidelines` — always on for code work.
2. **Matt Pocock spine** — `to-spec` → `to-tickets` → `implement` → `tdd` → `code-review`; around it `triage`, `wayfinder`, `domain-modeling`, `codebase-design`, `improve-codebase-architecture`, `diagnosing-bugs`, `prototype`, `research`, `resolving-merge-conflicts`, `ask-matt`. Nine of these are user-invoked only (see the note in `GLOBAL-RULES.md`); the rest load automatically.
3. **superpowers** — verification and isolation fallbacks: `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`, `writing-plans`.
4. **Modes** — `caveman`, `i-have-adhd`, `ponytail`.
5. **Domain packs** — `suiss-ui` → `radix-ui` (design), `ui-ux-pro-max` / `impeccable-design-polish` (quality), `archify` (diagrams), game/mobile/media skills.

## Roster

| Crew | Agent | Skill inventory (summary) | Dispatch when... |
|---|---|---|---|
| **Developers** | `dev-build` | karpathy-guidelines (always), Matt Pocock spine (tdd, code-review, diagnosing-bugs), superpowers fallbacks, ponytail-* (6), caveman-* (6), full-output-enforcement, claude-skills/opencode, + ~45 Claude-Cortex engineering skills (patterns, security, infra, perf) | Scaffolding, features, refactors, bugfixes, any code |
| **Design Studio** | `design-studio` | design-phase, suiss-ui, design-taste-frontend, frontend-design/dev, ui-ux-pro-max, ui-ux-design-pro, minimalist/brutalist, brandkit, brand, banner-design, design, design-system, slides, ui-styling, dashboard-designer, checklist-design, imagegen-* (2), image-to-code, gpt-taste, stitch, high-end-visual-design, redesign, web-animation, gsap-core, emilkowalski-motion, impeccable-polish, + ~20 Claude-Cortex design/UX skills, gemini-image-gen, 2d-pixel-asset, tech-product-landing, threeui-integration | Landing pages, portfolios, redesigns, UI polish, visual direction |
| **Game Dev** | `game-dev` | karpathy-guidelines + tdd/diagnosing-bugs/verification-before-completion (core discipline), game-development, game-developer, game-development-* (10), unity-* (3), unreal-engine-cpp-pro + claude-skills/unreal-* (5), godot-* (13), + media/asset pipeline (2d-pixel-asset, audio-to-midi, midi-synth, seedance), + Blender 3D pipeline (cc-blender-skill, 30; entry `text-to-blender`, needs the `blender` MCP) | Game projects, engine work, shaders, physics, multiplayer, game assets |
| **QA/Review** | `qa-review` | code-review (Pocock) + receiving-code-review, verification-before-completion, diagnosing-bugs, tdd, superpowers verification, caveman-review, ponytail-review, caveman-commit, + ~20 Claude-Cortex review/audit skills (multi-specialist-review, testing-*, doc-*, accessibility, ux-review, security, playwright/webapp-testing), website-compliance-checklist, game-release-compliance | Review gates, bug hunts, "is it done?" — read-only, never edits |
| **Ops/Planning** | `ops-planning` | karpathy-guidelines, Matt Pocock planning spine (to-spec, to-tickets, wayfinder, triage, research), brainstorming, writing-plans, executing-plans, superpowers-* (planning), dispatching-parallel-agents, subagent-driven-development, git-worktrees, finish-branch, writing-skills, caveman-compress, graphify-setup, model-role-picker, **archify** (diagrams + one-page explainers), + ~30 Claude-Cortex planning/PM/doc skills | Kickoff, specs, plans, work splitting, coordination, docs, research, architecture diagrams |

## Full skill inventory per crew

### Developers — `dev-build`
**Core discipline:** `karpathy-guidelines` (always on), `tdd` (Pocock), `code-review` (Pocock), `diagnosing-bugs` (Pocock), `verification-before-completion`; superpowers fallbacks where Pocock has no equivalent: `verification-before-completion`, `using-git-worktrees`, `finishing-a-development-branch`, `dispatching-parallel-agents`, `superpowers-subagent`, `superpowers-parallel`, `output-skill` (full-output-enforcement), `ponytail` (+ audit/debt/gain/help/review), `caveman` (+ commit/compress/help/review/stats), `claude-skills/opencode` (cross-model delegation). Do not also load `test-driven-development`, `superpowers-tdd`, `systematic-debugging`, `root-cause-tracing`, or `requesting-code-review` — the Pocock skill wins.

**Claude-Cortex engineering (45):** `api-design-patterns`, `api-gateway-patterns`, `async-python-patterns`, `backlog-md`, `atomic-commits`, `build-optimization`, `codanna-codebase-intelligence`, `condition-based-waiting`, `cqrs-event-sourcing`, `database-design-patterns`, `defense-in-depth`, `dev-workflows`, `dispatching-parallel-agents`, `event-driven-architecture`, `feature-implementation`, `github-actions-workflows`, `git-ops`, `gitops-workflows`, `helm-chart-patterns`, `implementation-workflow`, `incident-response`, `kubernetes-deployment-patterns`, `kubernetes-security-policies`, `legacy-modernization`, `microservices-patterns`, `openapi-specification`, `owasp-top-10`, `python-performance-optimization`, `python-testing-patterns`, `react-performance-optimization`, `reasoning-controls`, `release-prep`, `repo-cleanup`, `root-cause-tracing`, `secure-coding-practices`, `security-testing-patterns`, `system-design`, `terraform-best-practices`, `testing-anti-patterns`, `test-generation`, `test-review`, `threat-modeling-techniques`, `tool-selection`, `typescript-advanced-patterns`, `vibe-security`, `wiring-audit`

### Design Studio — `design-studio`
**Core direction (choose one):** `design-taste-frontend` for landing pages, portfolios and redesigns (`design-taste-frontend-v1` only for exact v1 behavior), `frontend-design` for application screens/components when no direction skill fits, `minimalist-ui` / `industrial-brutalist-ui` for an explicit aesthetic, `gpt-taste`, `stitch-design-taste`, `high-end-visual-design`, `frontend-dev`. **Reference, not a second workflow:** `ui-ux-pro-max`, `ui-ux-design-pro-skill` (`taste-skill` is the collection name; the loadable skill is `design-taste-frontend`). Query `ui-ux-pro-max` with `python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`; `${CLAUDE_PLUGIN_ROOT}` is unset for linked skills.

**Design gate:** `design-phase` owns D0–D7 before feature code — screen map, tokens, `@esuiss` component inventory, component lab, static screens at 390/768/1440, motion spec and a named `DESIGN-APPROVAL.md` sign-off. `suiss-ui` supplies the registry path; do not invent components that the inventory has not approved.

**Brand & identity:** `brandkit`, `brand`, `banner-design`, `design`, `design-system`, `slides`, `ui-styling`, `brand-library-architect`

**Products & dashboards:** `dashboard-designer-skill`, `checklist-design`, `chart-builder`

**Image & code-to-visual:** `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code` (+`-skill`), `gemini-image-gen`, `2d-pixel-asset`, `tech-product-landing`, `seedance` (video/trailers), `threeui-integration` (ThreeUI Community WebGL/Three.js/shader components — the WebGL sibling of the `ui-component-integration` protocol below; owns its own analyze → brief → catalog-select → live-preview → plan → install → integrate → browser-verify loop and must hand the browser verification to `qa-review`)

**Motion & polish (in order):** `web-animation` (React/CSS entrance, scroll reveal, stagger, hover) → `gsap-core` (timelines, scroll-driven sequences) → `emilkowalski-motion` (micro-interactions after the UI exists) → `impeccable-design-polish` (final audit/refine/animate/harden pass). One implementation per effect — never rebuild the same reveal twice — and every animation gates on `prefers-reduced-motion` with `transform`/`opacity` only. `redesign-existing-projects` is the audit-first path for existing UI.

**UI component integration** (`skills/ui-component-integration.md`): search-before-build protocol using the `shadcn` (including the `@esuiss` suiss/ui registry), `vengeanceui`, `playwright` (test), and `figma` (design source) MCPs — all defined in `~/.opencode/mcp-servers.json` and synced to `~/.config/opencode/opencode.json`. `shadcn`, `playwright`, `vengeanceui` and `graphify` ship enabled; `figma` ships disabled until OAuth. Toggle a server by editing `mcp-servers.json` (`"enabled": true/false`) and re-running `sync-global.ps1`; confirm with `opencode mcp list`. Owns step 0 (platform routing) and steps 1–3 (design-source lookup, component search, adaptation to design tokens); routes by target — web → shadcn MCP, Expo native → `expo-*` skills, non-Expo RN → RN shadcn ports; hands off wiring to `dev-build` and Playwright verification to `qa-review`. See `UI-COMPONENT-MCP.md`.

**Claude-Cortex design/UX (~20):** `canvas-design`, `color-palette`, `design-critiquer`, `design-journey-review`, `design-system-architecture`, `interaction-design`, `super-saiyan`, `ui-design-aesthetics`, `ui-ux-review-suite`, `user-journey-mapping`, `ux-interaction-review`, `ux-researcher`, `ux-review`, `ux-writer`, `visual-modes`, `accessibility-audit`

### Game Dev — `game-dev`
**Orchestration:** `game-development`, `game-developer`

**Platforms (10):** `game-development-2d-games`, `-3d-games`, `-game-art`, `-game-audio`, `-game-design`, `-mobile-games`, `-multiplayer`, `-pc-games`, `-vr-ar`, `-web-games`

**Unity (3):** `unity-ai-game-creator`, `unity-developer`, `unity-ecs-patterns`

**Unreal (6):** `unreal-engine-cpp-pro`, `unreal-best-practices`, `unreal-blueprint-codegen`, `unreal-gas`, `unreal-pcg-python`, `unreal-thirdparty`

**Godot (13):** `godot-4-migration`, `godot-clear-children`, `godot-console`, `godot-gdscript-grammar`, `godot-gdscript-patterns`, `godot-global-variables`, `godot-knowledge`, `godot-packedscene`, `godot-scene`, `godot-serialization-pattern`, `godot-singleton-pattern`, `godot-tscn-format`, `godot-unix-timestamp-fix`

**Blender / 3D assets (30, `cc-blender-skill`):** entry `text-to-blender`; core `blender-modeling`, `blender-materials`, `blender-lighting`, `blender-cameras`, `blender-rendering`, `blender-animation`, `blender-uv-texturing`, `blender-export`, `blender-pro-workflow`; reference-to-3D, UV/texture and motion-QA skills listed in `agent/game-dev.md`. Needs the `blender` MCP (Blender 5.1+, add-on server running).

**Core discipline:** `karpathy-guidelines`, `tdd` where game logic is testable, `diagnosing-bugs` for hard bugs/frame-time regressions, `verification-before-completion`.

**Asset & media pipeline:** `2d-pixel-asset`, `audio-to-midi`, `midi-synth`, `seedance`

### QA/Review — `qa-review`
**Core gates:** `code-review` (Pocock), `receiving-code-review`, `verification-before-completion`, `diagnosing-bugs` (Pocock), `tdd` (Pocock), `superpowers-receive-review`, `superpowers-verification`, `caveman-review`, `ponytail-review`, `caveman-commit`, `clarity` (prose draft/rewrite/review/lint — Addy Osmani). Do not also load `requesting-code-review`, `systematic-debugging`, or `test-driven-development` — the Pocock skill wins. Owns step 5 of the UI-component protocol (`skills/ui-component-integration.md`): browser verification of any newly integrated component via the `playwright` MCP before marking done.

**Claude-Cortex review/audit (~20):** `codex-code-review`, `multi-specialist-review`, `quality-audit`, `testing-skills-with-subagents`, `test-generation`, `test-review`, `testing-anti-patterns`, `python-testing-patterns`, `accessibility-audit`, `ux-review`, `webapp-testing`, `playwright`, `html-seo-review`, `security-testing-patterns`, `owasp-top-10`, `compliance-audit`, `doc-claim-validator`, `doc-quality-review`, `doc-health-audit`, `wiring-audit`

**Pre-launch legal/compliance gate:** `website-compliance-checklist` — the 20-item audit (privacy, terms, refunds, cookies/consent, dark patterns, hidden fees, fake reviews, unsupported claims, accessibility, business details, unsubscribe, asset licenses, data deletion) in `skills/website-compliance-checklist/CHECKLIST.md`. Run it before delivering or launching any client/public site, and whenever forms, analytics, checkout, email capture or third-party scripts are added. Rules that matter for a read-only crew: it is **not legal advice and carries no guarantee** — report which items pass/fail and which need a lawyer; **never invent** company details, addresses, registration numbers, retention periods or processors (leave `{{PLACEHOLDER}}` and list them as "needs from owner"); **policies must be generated from what the code actually does**, not from a generic template; and **do not add fake trust signals** to make a failing item pass. Cross-links: audit items 13–15 (alt text, contrast, keyboard/`prefers-reduced-motion`) against any `threeui-integration` WebGL background `design-studio` shipped, and audit item 19 (asset licenses) against `phosphor-icons/` and the shadcn/MCP components pulled in via `UI-COMPONENT-MCP.md`.

**Game release gate:** `game-release-compliance` — the game version of the checklist (G1–G20 in `skills/game-release-compliance/CHECKLIST.md`): project license, AI-assisted authorship record, asset license log, engine/addon notices in builds, AI disclosure, name/trademark check, store claims that match the build, content and photosensitivity warnings, privacy and multiplayer RPC security, secrets, game accessibility, EULA and credits. Run it before a public repo push, any exported build or a store page. Same rules as above: not legal advice, never invent the owner's facts or authorship, pass means observed. For the game's store page or website, run `website-compliance-checklist` too.

### Ops/Planning — `ops-planning`
**Core workflow:** `karpathy-guidelines`, Matt Pocock planning spine (`to-spec` → `to-tickets` → `implement`, plus `triage`, `wayfinder`, `ask-matt` as user-invoked), `research`, `domain-modeling`, `codebase-design`, `improve-codebase-architecture`, `brainstorming`, `writing-plans`, `executing-plans`, `superpowers-brainstorming`, `superpowers-executing-plans`, `superpowers-plans`, `superpowers-finish-branch`, `superpowers-git-worktrees`, `superpowers-parallel`, `superpowers-subagent`, `superpowers-skills`, `using-superpowers`, `subagent-driven-development`, `dispatching-parallel-agents`, `writing-plans`, `writing-skills`, `caveman-compress`, `graphify-setup`

**Diagrams & explainers:** `archify` — validated architecture/workflow/sequence/data-flow/lifecycle/ERD/class/tree/timeline/waterfall diagrams and one-page explainers as standalone HTML. Author typed JSON, then `archify finalize`; never deliver a diagram that failed its checks. See the archify rules block in `GLOBAL-RULES.md`.

**Planning & PM (~30 Claude-Cortex):** `task-orchestration`, `session-management`, `skill-creator`, `template-skill`, `template-skill-enhanced`, `sharing-skills`, `documentation-production`, `doc-architecture-review`, `doc-completeness-audit`, `doc-maintenance`, `reference-documentation`, `tutorial-design`, `development-estimation`, `decision-maker`, `requirements-discovery`, `product-manager`, `product-strategy`, `prd-generator`, `backlog-md`, `atlas-crew-tasks`, `justfile-author`, `research-methodology`, `web-researcher`, `knowledge-stack`, `knowledge-synthesis`, `multi-llm-consult`, `multi-perspective-analysis`, `constructive-dissent`, `evaluator-optimizer`, `mapping-suite`, `release-analysis`, `release-prep`, `internal-comms`

## Unstaffed crews (no agent file — do NOT pretend they exist; skills ARE installed)

| Crew | Agent file | Skills installed (cover the role, but no agent to drive them) | Status |
|---|---|---|---|
| Marketing | missing | `copywriter`, `blog-post`, `email-drafter`, `market-researcher`, `competitor-analyst`, `brand`, `banner-design`, `brand-library-architect`, `html-seo-review`, `slides`, `hermes-tweet` | skills installed, agent missing |
| Social & Content | missing | `storyteller`, `blog-post`, `copywriter`, `video-download`, `video-summarizer`, `video-fetch-and-summarize`, `google-ai-studio-tts`, `seedance`, `audio-to-midi`, `midi-synth`, `hermes-tweet`, `ai-tells-scan`, `ai-tells-review`, `proofreader` | skills installed, agent missing |
| Product (pre-planning) | missing | `prd-generator`, `product-manager`, `product-strategy`, `business-analyst`, `market-researcher`, `requirements-discovery`, `dataset-curator`, `eval-designer`, `model-comparator`, `prompt-engineering` | skills installed, agent missing |
| Finance | missing | `xlsx` (document-skills), `chart-builder`, `pdf`, `pptx` — no dcf/pricing/lbo skills | partial, mostly unstaffed |
| Operations (business) | missing | `internal-comms`, `incident-response`, `release-prep`, `xlsx`, `docx`, `pptx`, `pdf` — mostly covered by `ops-planning` | partial, mostly covered |
| Legal | missing | `terms-of-service`, `compliance-audit`, `docx`, `pdf` | partial, mostly unstaffed |

To staff a crew: create `agent/<crew>.md` (mirror the 5 existing agent files), then move its skills out of this table into the Roster.

## Work-splitting protocol (how the team works)

```
1. LOAD  ops-planning (or read its skills directly)
2. BRAINSTORM  → intent, constraints, success criteria
3. SPEC        → docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
4. PLAN        → step-by-step implementation plan
5. SPLIT       → chunk work by crew:
     code/features         → dev-build
     UI/visual direction   → design-studio
     game/engine work      → game-dev
     completion claims     → qa-review (final gate)
     public/client site    → qa-review runs `website-compliance-checklist` before delivery
     game build/store page → qa-review runs `game-release-compliance` before release
5b. DESIGN GATE → design-studio runs `design-phase`; no feature code until
                `DESIGN-APPROVAL.md` is signed
6. DISPATCH    → Task tool, parallel when chunks are independent
7. VERIFY      → lint/typecheck/build/tests with real output
8. GATE        → qa-review approves or requests changes
8b. COMPLY     → for any public or client-facing site, qa-review runs
                `website-compliance-checklist` and reports pass/fail/needs-a-lawyer.
                For a game build, repo release or store page, run `game-release-compliance`.
                An item is only passed when it was observed working, not merely coded.
9. FINISH      → merge / PR / cleanup decision
```

## Rules for the coordinating agent
- **One crew per concern** — don't let a single agent do design + code + QA in one shot
- **QA is a gate, not a step** — never mark work complete without a `qa-review` pass
- **Skills before code** — crews must load their skills; improvising engine/design/planning without them is how hallucinations happen. Use the inventory above to pick the right skill; when in doubt, `graphify query` the skills graph (`graphify-out/`) for what covers a task
- **Design before code** — for any UI, `design-studio` completes `design-phase` and a signed `DESIGN-APPROVAL.md` before `dev-build` writes feature code
- **Read the repo first** — check CLAUDE.md / AGENTS.md / existing files before writing anything (avoids duplicate files)
- **Evidence over assertions** — every "done" claim must come with command output or a code reference

## Per-project setup
This `.opencode/` folder is the portable team unit. To staff a new project:
1. Copy this `.opencode/` folder into the project root
2. Copy `.opencode/templates/PROJECT-TEAM.md` to the project root (or reference it from AGENTS.md/CLAUDE.md)
3. Run `/graphify-setup` in the project root so the team can query the skills graph
4. Before UI work, load `design-phase` and get `DESIGN-APPROVAL.md` signed
5. The AI reads the guide on the first task and runs the protocol
