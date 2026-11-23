import { useSyncExternalStore } from "react";

export const DEFAULT_COLORS = { U: "#facc15", D: "#f4f4f2", F: "#22c55e", B: "#3b82f6", R: "#f97316", L: "#ef4444", X: "#7c8591" };
export const FACE_NAME = { U: "Yellow", D: "White", F: "Green", B: "Blue", R: "Orange", L: "Red" };
export const FACE_KEYS = ["U", "D", "F", "B", "R", "L"];

const KEY = "cube-colors-v1";
let colors = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_COLORS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COLORS, ...parsed };
  } catch {
    return { ...DEFAULT_COLORS };
  }
}

function emit() { for (const l of listeners) l(); }

export function getCubeColors() { return colors; }

export function setCubeColor(face, value) {
  if (!(face in DEFAULT_COLORS)) return;
  colors = { ...colors, [face]: value };
  try { localStorage.setItem(KEY, JSON.stringify(colors)); } catch {}
  emit();
}

export function resetCubeColors() {
  colors = { ...DEFAULT_COLORS };
  try { localStorage.removeItem(KEY); } catch {}
  emit();
}

export function subscribeCubeColors(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useCubeColors() {
  return useSyncExternalStore(subscribeCubeColors, getCubeColors, getCubeColors);
}
