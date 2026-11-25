import { useSyncExternalStore } from "react";
import { getJSON, setJSON } from "./storage";

// Per-device starred/saved cases, independent from learning/learned progress.
const KEY = "cube-stars-v1";
let state = {};
let hydrated = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const raw = await getJSON(KEY, {});
  state = raw && typeof raw === "object" ? raw : {};
  emit();
}
void hydrate();

export function isStarred(id) { return !!state[id]; }

export function toggleStar(id) {
  state = { ...state };
  if (state[id]) delete state[id]; else state[id] = true;
  void setJSON(KEY, state);
  emit();
}

export function useStars() {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => state,
    () => state,
  );
}
