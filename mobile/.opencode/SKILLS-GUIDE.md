# OpenCode Skills Integration Guide

> Comprehensive mapping of skills, components, and patterns for every project type.

> **Can't find a skill for your task below?** Use the `find-skills` skill — it
> searches the open agent-skills ecosystem (`npx skills find <query>`, browse at
> https://skills.sh/) and installs the best match for you. See
> [Meta / Discovery](#meta--discovery).

---

## Table of Contents

1. [Web Projects](#web-projects)
   - [Landing Pages / Marketing Sites](#landing-pages--marketing-sites)
   - [SaaS Dashboards](#saas-dashboards)
   - [E-commerce](#e-commerce)
   - [Portfolios / Creative Sites](#portfolios--creative-sites)
   - [Documentation / Blogs](#documentation--blogs)
2. [Mobile Projects](#mobile-projects)
   - [React Native / Expo Apps](#react-native--expo-apps)
   - [Mobile Navigation Patterns](#mobile-navigation-patterns)
   - [Mobile-Specific Screens](#mobile-specific-screens)
3. [Game Development](#game-development)
4. [Desktop Applications](#desktop-applications)
5. [Skill Reference](#skill-reference)
   - [Meta / Discovery](#meta--discovery)
6. [Icons](#icons)
7. [Component Reference](#component-reference)
8. [Animation Reference](#animation-reference)
9. [Catalog archive (aitmpl.com)](#catalog-archive-aitmplcom)

---

## Web Projects

**Consult first, every time:** `modern-web-guidance` searches ~210 standardized
web-platform guides (dialogs/popovers, tables, forms + validation/autofill, dark
mode, anchor positioning, container queries, view transitions, scroll-driven
animation, CWV/LCP/INP/CLS, accessibility, security/passkeys, sanitization, web
components, dates/timezones, built-in AI, WASM). Run its `search`/`retrieve`
workflow before writing HTML/CSS/client-side JS and apply the matching guide's
fallbacks. It is complementary to the design, component, and motion skills below
— it governs *how* to implement, not what to design.

### Landing Pages / Marketing Sites

**Primary Skills:**
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `frontend-design` | Production-grade UI with visual direction | Building the overall page structure |
| `radix-ui` | Radix Themes / Primitives — pre-styled UI + theming | Building components immediately; theming (accent, dark mode, radius) |
| `web-animation` | Scroll reveals, fade-ins, stagger, hover cards | Adding motion and engagement (Framer Motion) |
| `gsap-core` | Complex scroll timelines, SVG morphing | Advanced motion sequences |
| `ui-styling` | shadcn/ui + Tailwind CSS | Component styling and layout |
| `suiss-ui` | suiss/ui registry (`@esuiss`) — 232 clean components, blocks, charts, patterns | Premium copy-paste sections; cross-platform React/RN/SwiftUI/Compose |
| `design-phase` | Design-first gate — screen map, tokens, component inventory, static screens, sign-off | Before building any new site/app or redesign |
| `design-taste-frontend` | Anti-slop, premium design | Avoiding generic AI patterns |
| `high-end-visual-design` | Expensive-feeling interfaces | Premium/luxury brand pages |
| `threeui-integration` | ThreeUI Community WebGL/Three.js/shader components | Animated 3D backgrounds, hero sections, shader buttons/text effects — **note: no GLB/GLTF model slot exists** |

**Apple-style interactive/3D product pages** (Three.js + GSAP scroll storytelling):
use `radix-ui` (UI) + `gsap-core`/`web-animation` (motion) + React Three Fiber (3D),
and steal patterns from the curated clones in **`OPEN-SOURCE-TEMPLATES.md`**.

**New client/interactive site fast-start** (manifest-first, no AI guessing):
1. Scaffold from `templates/site-requirements/` (typed `site.config.ts` +
   `ASSET-MANIFEST.md` + `MOTION-SPEC.md`); reference scaffold is
   `C:\Users\Danniel Canary\Desktop\site-interactive-sample`.
2. Have the user fill the config, drop assets into `public/assets/`, then
   `npm run assets:check` before building.

**shadcn Components:**
```
Layout:       card, separator, aspect-ratio
Navigation:   navigation-menu, breadcrumb, sidebar
Forms:        button, input, label, textarea, select
Feedback:     alert, dialog, sonner
Blocks:       login-01 to login-05, signup-01 to signup-05
```

**Animations (GSAP):**
```javascript
// Hero section entrance
gsap.from(".hero-title", { y: 50, autoAlpha: 0, duration: 1 });
gsap.from(".hero-subtitle", { y: 30, autoAlpha: 0, duration: 1, delay: 0.2 });

// Feature cards stagger
gsap.from(".feature-card", {
  y: 60,
  autoAlpha: 0,
  stagger: 0.15,
  scrollTrigger: { trigger: ".features", start: "top 80%" }
});

// CTA pulse effect
gsap.to(".cta-button", {
  scale: 1.05,
  repeat: -1,
  yoyo: true,
  duration: 1.5,
  ease: "power1.inOut"
});
```

**Page Sections:**
- Hero with headline + CTA
- Feature grid (3-6 cards)
- Social proof (logos, testimonials)
- Pricing table
- FAQ accordion
- Footer with links

---

### SaaS Dashboards

**Primary Skills:**
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `ui-ux-pro-max` | 50+ UI patterns, design systems | Complex dashboard layouts |
| `design-system` | Token architecture, components | Consistent design tokens |
| `chart-builder` | Chart.js visualizations | Data charts and graphs |
| `ui-styling` | shadcn/ui components | All UI components |
| `frontend-design` | Production UI | Overall layout and polish |

**shadcn Components:**
```
Layout:       card, tabs, separator, resizable
Navigation:   sidebar-01 to sidebar-16, navigation-menu
Data:         table, badge, avatar, progress
Forms:        input, select, checkbox, switch, date-picker
Feedback:     alert, dialog, sonner, skeleton
Charts:       chart-bar-*, chart-line-*, chart-pie-*
Blocks:       dashboard-01
```

**Dashboard Patterns:**
```javascript
// Data table with sorting/filtering
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// KPI cards with sparklines
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sidebar navigation
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu } from "@/components/ui/sidebar";
```

**Chart Integration:**
```javascript
// Bar chart example
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Pie chart example
import { Pie, PieChart, Cell, Legend } from "recharts";

// Use shadcn blocks: chart-bar-*, chart-line-*, chart-pie-*
npx shadcn@latest add chart-bar-default
```

**Page Structure:**
- Top navigation bar
- Collapsible sidebar
- KPI summary row
- Main content area (charts/tables)
- Right sidebar (optional, notifications/activity)

---

### E-commerce

**Primary Skills:**
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `design-taste-frontend` | Premium product presentation | Product cards, galleries |
| `ui-styling` | shadcn/ui components | All UI components |
| `gsap-core` | Product reveal animations | Hover effects, page transitions |
| `frontend-design` | Overall layout | Page structure and flow |

**shadcn Components:**
```
Layout:       card, carousel, aspect-ratio, separator
Navigation:   breadcrumb, navigation-menu, tabs
Forms:        input, select, button, checkbox, radio-group
Feedback:     dialog, sheet, sonner, alert
Overlays:     popover, dropdown-menu, hover-card
Data:         badge, avatar, skeleton
Blocks:       login-01 to login-05 (for checkout)
```

**Product Page Animations:**
```javascript
// Product image hover zoom
gsap.to(".product-image", {
  scale: 1.1,
  duration: 0.3,
  ease: "power2.out"
});

// Add to cart confirmation
gsap.fromTo(".cart-notification",
  { y: -20, autoAlpha: 0 },
  { y: 0, autoAlpha: 1, duration: 0.4 }
);

// Product grid reveal
gsap.from(".product-card", {
  y: 40,
  autoAlpha: 0,
  stagger: 0.1,
  scrollTrigger: { trigger: ".product-grid", start: "top 85%" }
});
```

**Page Structure:**
- Product listing grid
- Product detail page
- Shopping cart (drawer or page)
- Checkout flow
- User account/orders
- Search with filters

---

### Portfolios / Creative Sites

**Primary Skills:**
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `high-end-visual-design` | Premium aesthetic | Overall design direction |
| `gsap-core` | Timeline sequences | Complex animations |
| `design-taste-frontend` | Anti-generic design | Unique visual identity |
| `frontend-design` | Production code | Implementation |

**shadcn Components (Minimal):**
```
Layout:       card, aspect-ratio
Navigation:   navigation-menu
Feedback:     dialog (for project details)
Forms:        button, input, textarea (contact form)
```

**Timeline Animations:**
```javascript
// Project showcase timeline
const tl = gsap.timeline({ scrollTrigger: { trigger: ".projects", scrub: 1 } });
tl.from(".project-1", { x: -100, autoAlpha: 0 })
  .from(".project-2", { x: 100, autoAlpha: 0 }, "<0.2")
  .from(".project-3", { x: -100, autoAlpha: 0 }, "<0.2");

// Text reveal effect
gsap.from(".reveal-text", {
  clipPath: "inset(0 100% 0 0)",
  duration: 1.5,
  ease: "power4.inOut",
  scrollTrigger: { trigger: ".hero", start: "top center" }
});

// Parallax layers
gsap.to(".parallax-bg", {
  y: -100,
  scrollTrigger: { trigger: ".hero", scrub: true }
});
```

**Page Structure:**
- Hero with name/title
- About section
- Project showcase (masonry or grid)
- Skills/tools
- Contact form
- Social links

---

### Documentation / Blogs

**Primary Skills:**
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `ui-styling` | shadcn + Tailwind | Content styling |
| `frontend-design` | Layout and typography | Page structure |
| `gsap-core` | Subtle animations | Reading experience |

**shadcn Components:**
```
Layout:       card, separator, aspect-ratio
Navigation:   navigation-menu, breadcrumb, tabs
Data:         table, badge
Feedback:     alert, collapsible
Forms:        input (search), button
```

**Subtle Animations:**
```javascript
// Code block copy feedback
gsap.from(".copy-button", { scale: 0.8, duration: 0.2 });

// Section heading reveal
gsap.from(".heading", {
  autoAlpha: 0,
  y: 20,
  duration: 0.6,
  scrollTrigger: { trigger: ".heading", start: "top 90%" }
});
```

**Page Structure:**
- Sidebar navigation (table of contents)
- Main content area
- Search functionality
- Code blocks with syntax highlighting
- Table of contents (sticky)
- Previous/Next navigation

---

## Mobile Projects

### React Native / Expo Apps

**Primary Skills:**
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `expo-overview` | Expo entry point | Starting any Expo project |
| `expo-router` | Navigation and routing | File-based routing setup |
| `expo-native-ui` | Native UI components | iOS/Android native feel |
| `expo-design-system` | Theme and tokens | Consistent design system |
| `expo-animation` | Reanimated + Gesture Handler | Smooth animations |
| `expo-data-fetching` | API calls and caching | Data layer |
| `expo-ui` | @expo/ui components | Native pickers, sheets, toggles |

**Expo Skills Flow:**
```
1. expo-overview (always first)
   ↓
2. Choose navigation: expo-router
   ↓
3. Choose UI: expo-native-ui OR expo-ui
   ↓
4. Add features: expo-animation, expo-data-fetching
   ↓
5. Polish: expo-design-system
```

**Component Patterns:**
```typescript
// Expo UI - Native components
import { Column, Row, Button, Text, BottomSheet } from "@expo/ui/components";

// Expo Native UI - Apple HIG styling
import { Card, ListItem, Form } from "@expo/native-ui";

// Expo Design System - Theme tokens
import { useTheme } from "@/theme";
const { colors, spacing, typography } = useTheme();
```

**Animation Setup:**
```typescript
// expo-animation skill
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// Swipe to delete gesture
const gesture = Gesture.Pan()
  .onUpdate((e) => { translateX.value = e.translationX; })
  .onEnd(() => { translateX.value = withSpring(0); });
```

---

### Mobile Navigation Patterns

**Tab Navigation (Bottom Tabs):**
```
Skills: expo-router (NativeTabs)
Components: expo-ui (List for settings)
```

```typescript
// expo-router NativeTabs
import { NativeTabs, NativeStack } from "expo-router";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Screen name="index" options={{ title: "Home", tabBarIcon: HomeIcon }} />
      <NativeTabs.Screen name="search" options={{ title: "Search", tabBarIcon: SearchIcon }} />
      <NativeTabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: UserIcon }} />
    </NativeTabs>
  );
}
```

**Stack Navigation:**
```
Skills: expo-router (NativeStack)
Components: expo-native-ui (headers, toolbars)
```

**Drawer/Sidebar:**
```
Skills: expo-router + expo-ui (BottomSheet)
Components: expo-ui (Menu, List)
```

---

### Mobile-Specific Screens

#### Home/Feed Screen
```
Skills: expo-data-fetching, expo-design-system
Components: FlatList, Card, Avatar, Badge
Animations: Pull-to-refresh, infinite scroll
```

```typescript
// Pull to refresh pattern
import { FlatList, RefreshControl } from "react-native";

<FlatList
  data={items}
  renderItem={renderItem}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
/>
```

#### Profile Screen
```
Skills: expo-native-ui, expo-design-system
Components: Avatar, Card, List, Form
Animations: Profile header parallax
```

#### Settings Screen
```
Skills: expo-ui (native controls)
Components: List, Switch, Picker, Slider
Pattern: iOS Settings-style grouped rows
```

```typescript
// expo-ui List - Native grouped rows
import { List, Switch, Picker, Slider } from "@expo/ui/components";

<List>
  <List.Group header="Account">
    <List.Item title="Notifications">
      <Switch value={enabled} onValueChange={setEnabled} />
    </List.Item>
    <List.Item title="Language">
      <Picker value={lang} onValueChange={setLang} options={languages} />
    </List.Item>
  </List.Group>
  <List.Group header="Appearance">
    <List.Item title="Dark Mode">
      <Switch value={darkMode} onValueChange={setDarkMode} />
    </List.Item>
  </List.Group>
</List>
```

#### Search Screen
```
Skills: expo-data-fetching, expo-ui
Components: Input, List, Card, Badge
Animations: Search suggestions, filter transitions
```

#### Onboarding/Welcome Screen
```
Skills: expo-animation, expo-design-system
Components: Button, Card, AspectRatio
Animations: Page transitions, illustrated sequences
```

```typescript
// Onboarding carousel with Reanimated
import Animated, { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

const scrollY = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler({ onScroll: (e) => { scrollY.value = e.contentOffset.y; } });

<Animated.ScrollView onScroll={scrollHandler}>
  <OnboardingPage1 progress={scrollY} />
  <OnboardingPage2 progress={scrollY} />
  <OnboardingPage3 progress={scrollY} />
</Animated.ScrollView>
```

#### Login/Signup Screen
```
Skills: expo-ui (Form), expo-design-system
Components: Input, Button, Checkbox, Link
Pattern: Email/password with social logins
```

#### Detail/Item Screen
```
Skills: expo-router (params), expo-native-ui
Components: Card, Image, ScrollView, Divider
Animations: Hero image shared element transition
```

#### Checkout/Payment Screen
```
Skills: expo-ui (Form, BottomSheet)
Components: Input, Button, List, Radio
Pattern: Multi-step form with validation
```

#### Chat/Messaging Screen
```
Skills: expo-data-fetching, expo-ui
Components: FlatList, Input, Avatar, Bubble
Animations: Message send animation, typing indicator
```

#### Notification Screen
```
Skills: expo-data-fetching, expo-native-ui
Components: List, Badge, Avatar
Pattern: grouped by date, read/unread states
```

#### Map/Location Screen
```
Skills: expo-native-ui (Maps integration)
Components: MapView, Marker, Callout
Pattern: List + Map toggle view
```

---

### Mobile App Patterns

#### Modal/Bottom Sheet
```typescript
// expo-ui BottomSheet - Real SwiftUI/Compose
import { BottomSheet } from "@expo/ui/components";

<BottomSheet visible={showSheet} onDismiss={() => setShowSheet(false)}>
  <Column padding={16}>
    <Text size="lg" weight="bold">Options</Text>
    {/* Sheet content */}
  </Column>
</BottomSheet>
```

#### Pull-to-Refresh
```typescript
import { RefreshControl } from "react-native";

<ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
  {/* Content */}
</ScrollView>
```

#### Infinite Scroll
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
/>
```

#### Skeleton Loading
```
Skills: expo-design-system, expo-native-ui
Components: Skeleton, Card
Pattern: Shimmer effect while loading
```

---

## Game Development

### 2D Games
```
Skills: 2d-games, game-art, game-audio, game-design
Engine: Godot (GDScript), Unity (C#), or Web (Phaser/PixiJS)
Patterns: Sprite animation, tilemap, collision, camera
```

### 3D Games
```
Skills: 3d-games, game-art, game-audio, game-design
Engine: Godot, Unity, or Unreal Engine
Patterns: Shaders, physics, lighting, terrain
```

### Mobile Games
```
Skills: mobile-games, game-developer
Considerations: Touch input, performance, battery
```

### Web Games
```
Skills: web-games, game-developer
Patterns: WebGL, Canvas, PWA
```

### 3D Models → 2D Sprites (Blender)
```
Skills: text-to-blender, blender-cameras, blender-lighting, blender-rendering, game-art
Needs: blender MCP connected (Blender 5.1+, MCP add-on server running)
Patterns: orthographic camera per direction, one fixed light rig, transparent PNG frames -> Godot AnimatedSprite2D
```

### 3D Game Assets (Blender → Godot)
```
Skills: text-to-blender, blender-modeling, blender-materials, blender-uv-texturing, blender-export
Patterns: glTF/GLB export, real-world scale, applied transforms
```

---

## Desktop Applications

### Electron Apps
```
Skills: frontend-design, ui-styling, design-system
Components: shadcn/ui (adapted for Electron)
Patterns: IPC communication, native menus, auto-updates
```

### Tauri Apps
```
Skills: frontend-design, ui-styling
Stack: Rust backend + Web frontend
Components: shadcn/ui or custom
```

---

## Skill Reference

### Priority workflow skills (Pocock + Karpathy)

| Skill | Load when | Notes |
|-------|-----------|-------|
| `karpathy-guidelines` | Any code change | Always-on discipline: think first, surgical diffs, name assumptions, verifiable success. |
| `tdd` | Building or fixing behavior test-first | Beats `test-driven-development` / `superpowers-tdd`; load one, not both. |
| `diagnosing-bugs` | A hard bug or perf regression | Beats `systematic-debugging` / `root-cause-tracing`; load one, not both. |
| `code-review` | Reviewing a working diff | `/review` (gstack) stays the PR gate. |
| `research` | Investigating a question against primary sources | Beats `research-methodology` / `web-researcher`. |
| `domain-modeling`, `codebase-design`, `improve-codebase-architecture` | Domain vocabulary, module seams, deepening passes | Architecture trio; `codebase-design` is the shared vocabulary. |
| `prototype` | A design question needs a throwaway spike | |
| `resolving-merge-conflicts` | In-progress merge/rebase conflict | |
| `ask-matt` | Unsure which Pocock skill fits | User-invoked only. |
| `to-spec`, `to-tickets`, `implement`, `triage`, `wayfinder`, `grill-with-docs`, `setup-matt-pocock-skills` | Issue-shaped work, triage, multi-session epics | User-invoked only (`disable-model-invocation: true`); name them explicitly. |

Full precedence, ranking and tie-breaks: `GLOBAL-RULES.md` → "Skill precedence".

### Diagrams & Architecture

| Skill | Use Case |
|-------|----------|
| `archify` | Validated architecture, workflow, sequence, data-flow, lifecycle/state, ERD, class, tree, timeline and waterfall diagrams plus one-page explainers — typed JSON in, checked standalone HTML out. Needs the local Node runtime, so it is installed from upstream (`npx -y skills@latest add https://archify.si --skill archify --agent opencode --copy --yes`) rather than shipped in `skills-upload/`. |

### Animation Skills
| Skill | Use Case |
|-------|----------|
| `web-animation` | React scroll reveals, fade-ins, stagger, hover cards, page transitions (Framer Motion + CSS) |
| `gsap-core` | DOM/SVG animations, scroll-driven |
| `expo-animation` | React Native Reanimated + Gesture Handler |
| `emilkowalski-motion` | Micro-interactions, state transitions |
| `impeccable-design-polish` | Final audit → refine → animate → harden pass |

Choose one implementation per effect: `web-animation` for React/CSS reveals, `gsap-core` for timelines and scroll-driven sequences. Every animation gates on `prefers-reduced-motion` and animates `transform`/`opacity` only.

### Design Skills
| Skill | Use Case |
|-------|----------|
| `design-phase` | Gate before UI build: screen map, tokens, `@esuiss` inventory, static screens, sign-off |
| `suiss-ui` | Default component source (`@esuiss` registry via the shadcn MCP) |
| `frontend-design` | Application screens and components when no direction skill fits |
| `ui-ux-pro-max` | Design-system intel: styles, palettes, fonts, UX rules, GSAP presets (reference, not a workflow) |
| `design-taste-frontend` | Default direction for landing pages, portfolios and redesigns |
| `high-end-visual-design` | Luxury/expensive feel |
| `minimalist-ui` | Clean, editorial interfaces |
| `industrial-brutalist-ui` | Raw, mechanical interfaces |
| `gpt-taste` | GSAP-heavy motion design |

`ui-ux-pro-max` search: `python ~/.claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`. The `${CLAUDE_PLUGIN_ROOT}` path in its SKILL.md only applies to plugin installs; this repo links the skill instead.

### Component Skills
| Skill | Use Case |
|-------|----------|
| `radix-ui` | Radix Themes (pre-styled) + Radix Primitives; theming, dark mode |
| `astryx` | Meta's Astryx design system (React 19 + StyleX) through the `astryx` CLI. Only for projects on `@astryxdesign/*` or when Astryx is asked for. Needs `npm i -g @astryxdesign/cli`; `astryx` MCP (hosted docs) in `mcp-servers.json` |
| `ui-styling` | shadcn/ui + Tailwind |
| `ui-ux-design-pro` | Complex dashboards, data UI |
| `chart-builder` | Data visualization |
| `design-system` | Token architecture |

### Content Skills
| Skill | Use Case |
|-------|----------|
| `blog-post` | Articles, guides |
| `copywriter` | Conversion-focused copy |
| `storyteller` | Narrative content |
| `proofreader` | Grammar and style check |

### Research Skills
| Skill | Use Case |
|-------|----------|
| `web-researcher` | Online research |
| `competitor-analyst` | Competitive analysis |
| `market-researcher` | Market sizing |
| `fact-checker` | Claim verification |

### Product Skills
| Skill | Use Case |
|-------|----------|
| `product-manager` | PRDs, user stories |
| `prd-generator` | Product requirements |
| `requirements-discovery` | Stakeholder interviews |
| `user-journey-mapping` | UX flows |

### Review & Compliance Skills
| Skill | Use Case |
|-------|----------|
| `website-compliance-checklist` | 20-item pre-launch audit of a public/client site: privacy + terms + refunds, cookie consent, dark patterns, hidden fees, fake reviews, unsupported claims, accessibility (alt/contrast/keyboard), business details, unsubscribe, asset licenses, data deletion. **Not legal advice.** Run before launch or client delivery |
| `game-release-compliance` | Game version of the checklist (G1–G20): license, AI-authorship record, asset license log, Godot/addon notices, AI disclosure, name/trademark, honest store claims, content and photosensitivity warnings, privacy and multiplayer RPC security, secrets, game accessibility, EULA/credits. **Not legal advice.** Run before a public repo push, build or store page |
| `compliance-audit` | GDPR / HIPAA / PCI DSS / SOC 2 / ISO control mapping |
| `accessibility-audit` | WCAG 2.2 AA triage for pages, components, PRs |
| `html-seo-review` | On-page SEO + crawlability for static HTML |
| `terms-of-service` | Draft ToS / Privacy Policy / EULA text |

### 3D / WebGL Skills
| Skill | Use Case |
|-------|----------|
| `threeui-integration` | Add ThreeUI Community (Three.js/shader) backgrounds, heroes, buttons, text effects to an existing web project. 43 components / 104 variants. Requires a browser preview + `npm run build` before claiming done |

### Meta / Discovery
| Skill | Use Case |
|-------|----------|
| `find-skills` | Discover and install skills that aren't already in this workspace. Searches the open ecosystem (`npx skills find <query>`, leaderboard at https://skills.sh/), verifies install count/source before recommending, then installs with `npx skills add <owner/repo@skill> -g -y`. Use when a task has no matching skill above |

---

## Catalog archive (aitmpl.com)

The entire claude-code-templates catalog is on disk but **not loaded**:

| Path | Contents | Loaded? |
|---|---|---|
| `~/.opencode/catalog-archive/skills/<category>/<name>/` | 925 skills, 31 categories | No |
| `~/.opencode/catalog-archive/agents/<category>/<name>.md` | 423 Claude-format agents | No |
| `~/.opencode/catalog-archive/manifest.json` | Every component: type, category, description, downloads, crew, archive path, live flag | No |
| `~/.opencode/SKILLS-CATALOG.md` | Human/agent-readable index grouped by category, with live markers | No |
| `~/.opencode/skills/` | Only what the model can actually see | Yes |
| `~/.opencode/agent/` | Only crews and promoted subagents | Yes |

### Why not install everything live

Skill names and descriptions are injected into every request, as is the subagent roster. Loading the full catalog would add roughly **221k tokens of metadata** before any work starts — past most context windows. The archive gives full coverage without that cost.

### Promote a skill

```powershell
New-Item -ItemType Junction -Path "$HOME\.opencode\skills\<name>" `
  -Target "$HOME\.opencode\catalog-archive\skills\<category>\<name>"
powershell -File ~/.opencode/sync-global.ps1 -NoMcp
```

Junctions mean the archive copy stays the single source of truth. Demote with `Remove-Item "$HOME\.opencode\skills\<name>"` — this removes the link, not the archive.

### Promote an agent

Copy `catalog-archive/agents/<category>/<name>.md` into `~/.opencode/agent/`, then:
1. Replace Claude frontmatter (`name`, `tools`, `model`) with OpenCode frontmatter (`description`, `mode: subagent`, optional `permission`).
2. Remove any `context-manager` JSON protocol — replace it with reading `AGENTS.md`, tokens and component files from the repo.
3. Run `sync-global.ps1 -NoMcp` to mirror it into OpenCode and Claude Code.

### Rules

- **Promote per task, not per category.** A category with 30 skills is a reading list, not a stack.
- **Check for an existing equivalent first** — the catalog duplicates many skills already installed (`react-best-practices`, `clean-code`, `writing-plans`).
- **Read before running.** Archived skills may ship scripts; nothing executes at install time, but a promoted skill's script can be invoked. Inspect `scripts/` first.
- **Regenerate the index** after catalog updates: `node ~/.opencode/scripts/build-catalog.mjs`.
- **Never bulk-promote.** If you need broad coverage, search the index at task time instead.

---

## Icons

`phosphor-icons/` in the workspace root is a local, license-clean Phosphor set
(MIT): **1,512 icons × 6 weights** (`thin, light, regular, bold, fill, duotone`)
as SVG, flat SVG (no background rect) and PNG, plus woff2/woff/ttf fonts.

```html
<!-- 256×256 viewBox, stroke=currentColor → color with CSS `color` -->
<img src="/icons/acorn.svg" alt="" width="24" height="24" />
```

Naming: `SVGs/<weight>/<name>.svg`, `PNGs/<weight>/<name>-<weight>.png`.
Because it is MIT-licensed and vendored locally, it satisfies the asset-license
item of `website-compliance-checklist` and needs no CDN request (which also keeps
it out of the third-party cookie/SDK inventory).

---

## Component Reference

### shadcn/ui Categories

**Layout:**
accordion, aspect-ratio, card, collapsible, resizable, scroll-area, separator, sheet, tabs

**Forms:**
button, button-group, checkbox, combobox, field, input, input-group, input-otp, label, native-select, radio-group, select, slider, switch, textarea, toggle, toggle-group

**Navigation:**
breadcrumb, context-menu, dropdown-menu, menubar, navigation-menu, pagination, sidebar

**Data Display:**
avatar, badge, chart, hover-card, item, kbd, popover, progress, skeleton, table, tooltip

**Feedback:**
alert, alert-dialog, dialog, drawer, sonner, spinner

**Overlays:**
command, empty

---

## Animation Reference

### GSAP Quick Reference

**Basic Tweens:**
```javascript
gsap.to(element, { x: 100, duration: 1 });
gsap.from(element, { autoAlpha: 0, y: 50 });
gsap.fromTo(element, { scale: 0 }, { scale: 1 });
gsap.set(element, { display: "none" });
```

**Easing:**
```javascript
ease: "power1.out"      // Gentle deceleration (default)
ease: "power3.inOut"    // Smooth acceleration/deceleration
ease: "back.out(1.7)"   // Slight overshoot
ease: "elastic.out(1, 0.3)" // Bouncy spring
```

**Stagger:**
```javascript
gsap.from(".item", { y: 50, stagger: 0.1 }); // Sequential
gsap.from(".item", { y: 50, stagger: { each: 0.1, from: "center" } }); // From center
gsap.from(".item", { y: 50, stagger: { each: 0.1, from: "random" } }); // Random order
```

**ScrollTrigger:**
```javascript
gsap.from(".box", {
  scrollTrigger: {
    trigger: ".box",
    start: "top 80%",   // When top of box hits 80% of viewport
    end: "bottom 20%",
    scrub: true,         // Tie animation to scroll position
    pin: true            // Pin element during animation
  },
  y: 100,
  autoAlpha: 0
});
```

**Timeline:**
```javascript
const tl = gsap.timeline();
tl.from(".hero", { autoAlpha: 0 })
  .from(".title", { y: 50, autoAlpha: 0 }, "-=0.5") // Overlap by 0.5s
  .from(".subtitle", { y: 30, autoAlpha: 0 })
  .from(".cta", { scale: 0, ease: "back.out(1.7)" });
```

### React Native Reanimated Quick Reference

**Shared Values:**
```typescript
const offset = useSharedValue(0);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));
```

**Gestures:**
```typescript
const gesture = Gesture.Pan()
  .onUpdate((e) => { offset.value = e.translationX; })
  .onEnd(() => { offset.value = withSpring(0); });
```

**Animations:**
```typescript
withSpring(value)      // Spring animation
withTiming(value)      // Linear timing
withDecay()            // Momentum-based
withRepeat()           // Repeat animation
withSequence()         // Chain animations
withDelay()            // Delay start
```

---

## Quick Reference: Project Setup

### New Landing Page
```bash
# 1. Skills to load: modern-web-guidance, frontend-design, gsap-core, ui-styling, design-taste-frontend
# 2. Initialize shadcn
npx shadcn@latest init
# 3. Add components
npx shadcn@latest add button card navigation-menu separator
# 4. Add GSAP
npm install gsap
# 5. Build with skill guidance
```

### New SaaS Dashboard
```bash
# 1. Skills to load: modern-web-guidance, ui-ux-pro-max, design-system, chart-builder, ui-styling
# 2. Initialize shadcn
npx shadcn@latest init
# 3. Add dashboard components
npx shadcn@latest add dashboard-01 table card sidebar tabs
# 4. Add charts
npm install recharts
# 5. Build with skill guidance
```

### New Expo Mobile App
```bash
# 1. Skills to load: expo-overview, expo-router, expo-native-ui
# 2. Create Expo project
npx create-expo-app my-app
# 3. Set up routing
npx expo install expo-router
# 4. Add UI components
npx expo install @expo/ui
# 5. Build with skill guidance
```

### New Portfolio Site
```bash
# 1. Skills to load: modern-web-guidance, high-end-visual-design, gsap-core, design-taste-frontend
# 2. Initialize shadcn (minimal)
npx shadcn@latest init
# 3. Add minimal components
npx shadcn@latest add button card
# 4. Add GSAP
npm install gsap
# 5. Build with skill guidance
```

---

## Tips for Using Skills

1. **Start with the skill description** - Match your task to the skill's "When to Use" section
2. **Combine skills** - Many projects benefit from multiple skills working together
3. **Follow the workflow** - Each skill has a specific workflow for best results
4. **Use reference files** - Skills have reference files for deeper guidance
5. **Trust the skill** - Let the skill guide the architecture and patterns
6. **Iterate** - Start with one skill, add more as needed
7. **Check compatibility** - Some skills are designed to work together

---

*Last updated: 2026*
*For questions, ask: "Use [skill-name] to [task]"*
