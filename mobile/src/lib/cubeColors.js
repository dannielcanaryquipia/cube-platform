import { useSyncExternalStore } from "react";
import { getJSON, setJSON, removeKey } from "./storage";

export const DEFAULT_COLORS = { U: "#facc15", D: "#f4f4f2", F: "#22c55e", B: "#3b82f6", R: "#f97316", L: "#ef4444", X: "#7c8591" };
export const FACE_NAME = { U: "Yellow", D: "White", F: "Green", B: "Blue", R: "Orange", L: "Red" };
export const FACE_KEYS = ["U", "D", "F", "B", "R", "L"];

const KEY = "cube-colors-v1";
let colors = { ...DEFAULT_COLORS };
let hydrated = false;
const listeners = new Set();
const emit = () => { for (const l of listeners) l(); };

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  const parsed = await getJSON(KEY, null);
  if (parsed && typeof parsed === "object") {
    colors = { ...DEFAULT_COLORS, ...parsed };
    emit();
  }
}
void hydrate();

export function getCubeColors() { return colors; }

export function setCubeColor(face, value) {
  if (!(face in DEFAULT_COLORS)) return;
  colors = { ...colors, [face]: value };
  void setJSON(KEY, colors);
  emit();
}

export function resetCubeColors() {
  colors = { ...DEFAULT_COLORS };
  void removeKey(KEY);
  emit();
}

export function subscribeCubeColors(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCubeColors() {
  return useSyncExternalStore(subscribeCubeColors, getCubeColors, getCubeColors);
}
