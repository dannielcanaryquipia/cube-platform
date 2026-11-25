# Design Tokens

Source of truth: `src/constants/theme.ts` (exact Layer by Layer website palette).

Do not introduce a second system. Native chrome (tab bar, stack headers) uses these brand colours as tint / background, not a generic iOS blue.

| Role | Light | Dark |
|------|-------|------|
| bg | `#f5f3ee` | `#12161c` |
| surface | `#ffffff` | `#1a2029` |
| ink | `#1c232d` | `#e8ebef` |
| muted | `#646b75` | `#9aa3ae` |
| line | `#dcd7cc` | `#2d3642` |
| accent | `#1f6f5c` | `#52b79a` |
| learning | `#d99a1e` | `#e5b04a` |
| learned | `#1f6f5c` | `#52b79a` |
| star | `#f5b301` | `#f5b301` |

- **Type:** Rubik 400–800, named styles in `Type`.
- **Space:** 4-point scale `Spacing.half` … `Spacing.seven`.
- **Radius:** 14 default (`Radius.md`) with `borderCurve: 'continuous'`.
- **Shadow:** `boxShadow` strings via `shadow('sm'|'md'|'lg')` — no legacy `shadowOpacity`.
- **Motion:** Reanimated springs; respect reduced motion.
