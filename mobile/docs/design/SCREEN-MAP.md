# Screen Map

- **Project:** Layer by Layer (mobile)
- **Version:** v1.1-native-chrome
- **Last updated:** 2026-11-24
- **Design owner:** Alma / Design Studio

Native redesign of the existing Expo port. Product content (CFOP path, cases, algs, timer, solve) stays; chrome becomes OS-native.

## 1. Screens

| # | Screen | Route | Purpose | Primary action | Entry from | Exits to | Data shown |
|---|--------|-------|---------|----------------|------------|----------|------------|
| 1 | Home | `/` | Start the CFOP path | Open notation / a set | Launch | `/notation`, `/set/:id`, `/search` | Path cards, progress, search |
| 2 | Learn | `/learn` | Ordered path + progress | Open a step | Tab | `/notation`, `/cross`, `/set/:id`, `/solve` | Steps, learned counts |
| 3 | Timer | `/timer` | Practice solves | Start/stop timer | Tab | n/a | Scramble, time, Ao5/Ao12, history |
| 4 | Settings | `/settings` | Appearance, cube colours, about | Change theme / colours | Tab | n/a | Theme mode, face colours, about |
| 5 | Search | `/search` | Find cases/algs | Open a case | Home search, Learn | `/case/:id` | Filtered case list |
| 6 | Notation | `/notation` | Teach moves | Pick a move | Home, Learn | back | Move groups, 3D player |
| 7 | Cross | `/cross` | Cross lesson | Continue to F2L | Learn | `/set/f2l` | Steps |
| 8 | Alg set | `/set/:id` | Browse a CFOP set | Open a case | Home, Learn | `/case/:id` | Case grid, filters |
| 9 | Case | `/case/:id` | Learn one algorithm | Mark learned / star | Set, Search | prev/next case | Diagram, algs, 3D |
| 10 | Solve | `/solve` | Paint + solve | Solve cube | Learn | `/case/:id` | Net, stages |

## 2. Native chrome

- Bottom **NativeTabs**: Home, Learn, Timer, Settings (SF Symbols + Material `md`).
- Each tab is a nested **Stack** with large titles.
- Pushed screens (notation, cross, set, case, search, solve) live on the root stack with a system back button — no in-page BackLink.
- Search is a **header search bar** on Home (and the Search screen), not a website-style field as the page hero.

## 3. States

| Screen | Default | Empty | Error |
|--------|---------|-------|-------|
| Home | Path cards | n/a | n/a |
| Learn | Path + progress | 0 learned is valid | n/a |
| Timer | Pad + scramble | “No solves yet” | n/a |
| Settings | Grouped sections | n/a | n/a |
| Search | All cases | “No cases match” | n/a |
| Set | Case grid | “No cases match” | Set not found |
| Case | Diagram + algs | n/a | Case not found |
| Solve | Paint net | n/a | Invalid typed scramble |
