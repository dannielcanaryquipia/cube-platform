# Web → native migration progress

Parent: Layer by Layer website (`../`). Skill: `expo-web-to-native`.

| Screen | Bucket | Status |
|--------|--------|--------|
| Home | nativize-now | NativeTabs + large title + header search |
| Learn | nativize-now | Nested stack + path list |
| Timer | nativize-now | Nested stack; hold-to-start pad kept (custom) |
| Settings | nativize-now | Grouped sections + `@expo/ui` Picker/Switch |
| Search / Notation / Cross / Sets / Cases / Solve | nativize-now | Root stack headers; content already ported |
| 3D cube (`cubing.js`) | hybrid | WebView player — keep until a native player exists |

Logic/data already shared: `src/data/*`, `src/lib/*` (progress, stars, colours, solver). Storage is AsyncStorage, not `localStorage`.
