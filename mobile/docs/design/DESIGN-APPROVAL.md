# Design Approval

- **Project:** Layer by Layer mobile
- **Design version:** v1.1-native-chrome
- **Date:** 2026-11-24
- **Approver:** Alma (requested native UI best-practice refinement of the existing port)
- **Reviewers:** design-studio, expo-native-ui / expo-web-to-native skills

This is a **chrome redesign of an existing, already-ported app**, not a greenfield D0–D7 static-lab cycle. Product screens, copy, algorithms, and brand tokens are already approved via the website.

## Scope approved

1. NativeTabs + nested large-title stacks.
2. System headers instead of in-page BackLink / duplicate H1 titles.
3. Header search on Home.
4. Settings as grouped native-feeling sections; keep the cube colour editor (no OS equivalent).
5. Keep website brand tokens, Rubik, cube diagrams, CFOP content.
6. Nativize, don’t reskin: if a screenshot could pass for the website, it is not done.

## Frozen

- `src/constants/theme.ts` palette and type scale
- `docs/design/SCREEN-MAP.md` routes
- Web app (`../src`) — do not change

## Change control

Post-v1.1 UI changes go through design-studio and an updated row here.
