import { useSyncExternalStore } from "react";

// Per-browser starred/saved cases, independent from learning/learned progress.
const KEY = "cube-stars-v1";
let state = {};
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
  state = raw && typeof raw === "object" ? raw : {};
} catch { state = {}; }
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export function isStarred(id) { return !!state[id]; }

export function toggleStar(id) {
  state = { ...state };
  if (state[id]) delete state[id]; else state[id] = true;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  emit();
}

export function useStars() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state);
}
