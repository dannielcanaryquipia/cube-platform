import { useSyncExternalStore } from "react";
import { getJSON, setJSON } from "./storage";

// Per-device learning status for each case: "learning" | "learned" (absent = not started).
const KEY = "cube-progress-v1";
let state = {};
let hydrated = false;
const subs = new Set();
const emit = () => subs.forEach((f) => f());

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const loaded = await getJSON(KEY, {});
  if (loaded && typeof loaded === "object") {
    state = loaded;
    emit();
  }
}
void hydrate();

export function setStatus(id, status) {
  state = { ...state };
  if (status) state[id] = status; else delete state[id];
  void setJSON(KEY, state);
  emit();
}

export function useProgress() {
  return useSyncExternalStore(
    (f) => { subs.add(f); return () => subs.delete(f); },
    () => state,
    () => state,
  );
}

export const NEXT = { undefined: "learning", learning: "learned", learned: undefined };
