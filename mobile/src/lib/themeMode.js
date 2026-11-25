import { useSyncExternalStore } from "react";
import { getJSON, setJSON } from "./storage";

const KEY = "cube-theme-mode-v1";
const MODES = ["system", "light", "dark"];

let mode = "system";
let hydrated = false;
const listeners = new Set();
const emit = () => { for (const l of listeners) l(); };

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const v = await getJSON(KEY, "system");
  mode = MODES.includes(v) ? v : "system";
  emit();
}
void hydrate();

export function getThemeMode() { return mode; }

export function setThemeMode(next) {
  if (!MODES.includes(next) || next === mode) return;
  mode = next;
  void setJSON(KEY, next);
  emit();
}

function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useThemeMode() {
  return useSyncExternalStore(subscribe, getThemeMode, getThemeMode);
}

export const THEME_MODES = MODES;
