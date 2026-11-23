import { useSyncExternalStore } from "react";

const KEY = "cube-theme-mode-v1";
const MODES = ["system", "light", "dark"];

function load() {
  try {
    const v = localStorage.getItem(KEY);
    return MODES.includes(v) ? v : "system";
  } catch {
    return "system";
  }
}

let mode = load();
const listeners = new Set();
const emit = () => { for (const l of listeners) l(); };

export function getThemeMode() { return mode; }

export function setThemeMode(next) {
  if (!MODES.includes(next) || next === mode) return;
  mode = next;
  try { localStorage.setItem(KEY, next); } catch {}
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