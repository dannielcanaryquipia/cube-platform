import { useEffect, useRef } from "react";
import { TwistyPlayer } from "cubing/twisty";
import { useCubeColors } from "../lib/cubeColors.js";

const SCRAMBLE_SETUP = "z2 F R U' R' F R U' R' F R U' R' F R U' R'";
const SOLVE_ALG = "R U R' F' R U R' F' R U R' F' R U R' F'";

export default function BootLoader({ onDone }) {
  const host = useRef(null);
  const doneRef = useRef(false);
  const colors = useCubeColors();
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone?.();
    };

    const p = new TwistyPlayer({
      puzzle: "3x3x3",
      alg: SOLVE_ALG,
      experimentalSetupAlg: SCRAMBLE_SETUP,
      experimentalSetupAnchor: "start",
      background: "none",
      controlPanel: "none",
      hintFacelets: "none",
      tempoScale: 10,
      viewerLink: "none",
    });
    p.style.width = "100%";
    p.style.height = "100%";

    // Apply custom/default cube colors to 3D materials
    const applyColors = async (c) => {
      try {
        if (typeof p.experimentalCurrentThreeJSPuzzleObject !== "function") return;
        const obj = await p.experimentalCurrentThreeJSPuzzleObject();
        const cubingFaceToApp = { U: "D", D: "U", F: "F", B: "B", R: "L", L: "R" };
        const orig = {
          U: { regular: [0xffffff], dim: [0xefefef] },
          L: { regular: [0xff8800, 0xffc100], dim: [0xc1aa00] },
          F: { regular: [0x00ff00], dim: [0x00c100] },
          R: { regular: [0xff0000], dim: [0xaa0000] },
          B: { regular: [0x2266ff, 0x66aaff], dim: [0x497cc1] },
          D: { regular: [0xffff00], dim: [0xc1c100] },
        };
        const toHex = (s) => { const m = String(s).trim(); if (m[0] !== "#") return null; const h = m.slice(1); return parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16); };
        const dimColor = (hex) => { const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255; return ((Math.round(r * 0.55) << 16) | (Math.round(g * 0.55) << 8) | Math.round(b * 0.55)) >>> 0; };
        obj.traverse?.((node) => {
          const mats = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
          for (const mat of mats) {
            if (!mat?.color || typeof mat.color.getHex !== "function") continue;
            const hex = mat.color.getHex();
            let cf = mat.userData?.cubingFace;
            let kind = mat.userData?.cubingKind;
            if (!cf || !kind) {
              outer: for (const [face, kinds] of Object.entries(orig)) {
                for (const [k, vals] of Object.entries(kinds)) {
                  if (vals.includes(hex)) { cf = face; kind = k; break outer; }
                }
              }
            }
            if (!cf || !kind) continue;
            mat.userData.cubingFace = cf;
            mat.userData.cubingKind = kind;
            const base = toHex(c[cubingFaceToApp[cf]]);
            if (base == null) continue;
            const next = kind === "dim" ? dimColor(base) : base;
            if (next !== hex) { mat.color.setHex(next); mat.needsUpdate = true; }
          }
        });
      } catch {}
    };

    host.current.appendChild(p);
    const applyWithRetry = async () => {
      for (let i = 0; i < 8; i++) {
        await applyColors(colorsRef.current);
        await new Promise((r) => setTimeout(r, 120));
      }
    };
    void applyWithRetry();

    const model = p.experimentalModel;
    const onTime = (info) => { if (info.atEnd) setTimeout(finish, 250); };
    model.detailedTimelineInfo.addFreshListener(onTime);

    const startTimer = setTimeout(() => p.play(), 300);
    const fallback = setTimeout(finish, 2400);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(fallback);
      model.detailedTimelineInfo.removeFreshListener(onTime);
      p.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f3ee", fontFamily: "Rubik,system-ui,-apple-system,Segoe UI,Roboto,sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }} role="status" aria-label="Loading">
        <div ref={host} style={{ width: 180, height: 180 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#646b75", letterSpacing: ".01em" }}>Solving…</span>
      </div>
    </div>
  );
}
