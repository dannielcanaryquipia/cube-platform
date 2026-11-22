import { useSyncExternalStore } from "react";

// Per-browser learning status for each case: "learning" | "learned" (absent = not started).
const KEY = "cube-progress-v1";
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { state = {}; }
const subs = new Set();
const emit = () => subs.forEach((f) => f());

export function setStatus(id, status) {
  state = { ...state };
  if (status) state[id] = status; else delete state[id];
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage off: keep in memory */ }
  emit();
}
export function useProgress() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => state);
}
export const NEXT = { undefined: "learning", learning: "learned", learned: undefined };
