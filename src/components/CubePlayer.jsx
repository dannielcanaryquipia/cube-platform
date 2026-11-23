import { useEffect, useRef, useState, useCallback } from "react";
import { TwistyPlayer } from "cubing/twisty";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { SkipBack, CaretLeft, CaretRight, Play, Pause } from "@phosphor-icons/react";
import { parseAlg, moveToString } from "../lib/cube.js";
import { useCubeColors } from "../lib/cubeColors.js";
import Hands from "./Hands.jsx";

const SPEEDS = [0.5, 1, 2, 3, 5, 10];

const MASKS = {
  F2L: "EDGES:----DDDD----,CORNERS:----DDDD,CENTERS:------",
  OLL: "EDGES:DDDDOOOODDDD,CORNERS:DDDDOOOO,CENTERS:DDDDD-",
  PLL: "EDGES:DDDD----DDDD,CORNERS:DDDD----,CENTERS:DDDDD-",
};

const LONGITUDE = { FR: 31, FL: -31, BR: 149, BL: -149 };

export default function CubePlayer({ alg, stickering = "full", anchor = "end", autoLoop = false, compact = false, slot, setup = "", showFingers = false, phases = null }) {
  const host = useRef(null);
  const player = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef({ running: false, startedAt: 0, base: 0, raf: 0 });
  const moves = parseAlg(alg).map(moveToString);
  const cubeColors = useCubeColors();

  const stopTimer = useCallback(() => {
    const t = timerRef.current;
    if (t.running) {
      t.base += performance.now() - t.startedAt;
      t.running = false;
    }
    if (t.raf) { cancelAnimationFrame(t.raf); t.raf = 0; }
    setElapsedMs(t.base);
  }, []);

  const tickTimerRef = useRef(() => {});
  tickTimerRef.current = () => {
    const t = timerRef.current;
    if (!t.running) return;
    setElapsedMs(t.base + (performance.now() - t.startedAt));
    t.raf = requestAnimationFrame(tickTimerRef.current);
  };

  const startTimer = useCallback(() => {
    const t = timerRef.current;
    if (t.running) return;
    t.running = true;
    t.startedAt = performance.now();
    if (t.raf) cancelAnimationFrame(t.raf);
    t.raf = requestAnimationFrame(tickTimerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    const t = timerRef.current;
    t.running = false;
    t.startedAt = 0;
    t.base = 0;
    if (t.raf) { cancelAnimationFrame(t.raf); t.raf = 0; }
    setElapsedMs((prev) => (prev === 0 ? prev : 0));
  }, []);

  let phaseLabel = null;
  if (phases && phases.length) {
    let acc = 0;
    for (const p of phases) { acc += p.len; if (index < acc) { phaseLabel = p.label; break; } }
    if (!phaseLabel) phaseLabel = phases[phases.length - 1].label;
  }

  const applyCubeColors = useCallback((p, c) => {
    if (!p) return;
    const map = { U: c.U, D: c.D, F: c.F, B: c.B, L: c.L, R: c.R };
    for (const [face, val] of Object.entries(map)) {
      const k = face.toLowerCase();
      p.style.setProperty(`--color-${k}`, val);
      p.style.setProperty(`--${k}-color`, val);
    }
    // cubing.js 3D: setup uses z2, so cubing internal faces map to our oriented faces as U<->D, R<->L.
    const cubingFaceToApp = { U: "D", D: "U", F: "F", B: "B", R: "L", L: "R" };
    // SRGB values as cubing.js renders them (regular + dim). Dim stickers must be recolored too (OLL 2L, PLL masked, etc).
    const orig = {
      U: { regular: [0xffffff], dim: [0xefefef] },
      L: { regular: [0xff8800, 0xffc100], dim: [0xc1aa00] },
      F: { regular: [0x00ff00], dim: [0x00c100] },
      R: { regular: [0xff0000], dim: [0xaa0000] },
      B: { regular: [0x2266ff, 0x66aaff], dim: [0x497cc1] },
      D: { regular: [0xffff00], dim: [0xc1c100] },
    };
    const toHex = (s) => {
      const m = String(s).trim();
      if (m[0] !== "#") return null;
      const h = m.slice(1);
      return parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
    };
    const dimColor = (hex) => {
      const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
      // Darken while preserving hue; keeps dimmed stickering readable with custom colors.
      return ((Math.round(r * 0.55) << 16) | (Math.round(g * 0.55) << 8) | Math.round(b * 0.55)) >>> 0;
    };
    const applyToObject = (obj) => {
      if (!obj) return;
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
          const appFace = cubingFaceToApp[cf];
          const base = toHex(c[appFace]);
          if (base == null) continue;
          const next = kind === "dim" ? dimColor(base) : base;
          if (next !== hex) { mat.color.setHex(next); mat.needsUpdate = true; }
        }
      });
    };
    const tryApply3D = async () => {
      if (typeof p.experimentalCurrentThreeJSPuzzleObject !== "function") return;
      for (let i = 0; i < 8; i++) {
        try {
          const obj = await p.experimentalCurrentThreeJSPuzzleObject();
          applyToObject(obj);
        } catch {}
        await new Promise((r) => setTimeout(r, 120));
      }
    };
    void tryApply3D();
  }, []);

  useEffect(() => { applyCubeColors(player.current, cubeColors); }, [cubeColors, applyCubeColors]);

  useEffect(() => {
    const p = new TwistyPlayer({
      puzzle: "3x3x3",
      alg,
      experimentalSetupAlg: setup ? `z2 ${setup}` : "z2",
      experimentalSetupAnchor: anchor,
      ...(MASKS[stickering] ? { experimentalStickeringMaskOrbits: MASKS[stickering] } : {}),
      background: "none",
      controlPanel: "none",
      hintFacelets: "none",
      tempoScale: speed,
      viewerLink: "none",
      ...(slot && slot !== "FR" ? { cameraLongitude: LONGITUDE[slot] } : {}),
    });
    p.style.width = "100%";
    p.style.height = "100%";
    applyCubeColors(p, cubeColors);
    host.current.appendChild(p);
    player.current = p;
    resetTimer();
    const model = p.experimentalModel;
    const onTime = async (info) => {
      const indexer = await model.indexer.get();
      const n = indexer.numAnimatedLeaves();
      let done = 0;
      while (done < n && indexer.indexToMoveStartTimestamp(done) + indexer.moveDuration(done) <= info.timestamp) done++;
      setIndex(info.atEnd ? n : done);
      if (info.atEnd) stopTimer();
    };
    const onPlay = (info) => {
      setPlaying(info.playing);
      if (info.playing) startTimer();
      else stopTimer();
    };
    model.detailedTimelineInfo.addFreshListener(onTime);
    model.playingInfo.addFreshListener(onPlay);
    let loopTimer;
    if (autoLoop) {
      const onEnd = (info) => {
        if (info.atEnd) { clearTimeout(loopTimer); loopTimer = setTimeout(() => { p.jumpToStart(); p.play(); }, 900); }
      };
      model.detailedTimelineInfo.addFreshListener(onEnd);
      setTimeout(() => p.play(), 400);
    }
    const timer = timerRef.current;
    return () => {
      clearTimeout(loopTimer);
      if (timer.raf) { cancelAnimationFrame(timer.raf); timer.raf = 0; }
      model.detailedTimelineInfo.removeFreshListener(onTime);
      model.playingInfo.removeFreshListener(onPlay);
      p.remove();
      player.current = null;
    };
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- speed/cubeColors are synced by dedicated effects; recreating the player on them would break playback
  }, [alg, stickering, anchor, autoLoop, slot, setup, resetTimer, startTimer, stopTimer, applyCubeColors]);

  useEffect(() => { if (player.current) player.current.tempoScale = speed; }, [speed]);

  const step = useCallback((dir) => {
    const p = player.current; if (!p) return;
    p.pause();
    p.controller.animationController.play({ direction: dir, untilBoundary: "move", autoSkipToOtherEndIfStartingAtBoundary: false });
  }, []);
  const jumpTo = useCallback(async (i) => {
    const p = player.current; if (!p) return;
    p.pause();
    const indexer = await p.experimentalModel.indexer.get();
    const n = indexer.numAnimatedLeaves();
    if (i <= 0) resetTimer();
    if (i >= n) { stopTimer(); p.jumpToEnd(); return; }
    p.experimentalModel.timestampRequest.set(indexer.indexToMoveStartTimestamp(i));
  }, [resetTimer, stopTimer]);
  const toggle = () => {
    const p = player.current; if (!p) return;
    if (!playing && index >= moves.length) { resetTimer(); p.jumpToStart(); }
    p.togglePlay();
  };

  useEffect(() => {
    if (compact) return;
    const onKey = (e) => {
      if (e.target.closest("input, textarea")) return;
      if (e.key === " ") { e.preventDefault(); toggle(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Home") jumpTo(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <VStack className={`player ${compact ? "player--compact" : ""}`}>
      {phaseLabel && <VStack className="player__phase">{phaseLabel}</VStack>}
      <VStack className="player__stage" ref={host} />
      {!compact && (
        <ol className="moves" aria-label="Moves">
          {moves.map((m, i) => (
            <li key={i}>
              <button
                className={`move ${i < index ? "move--done" : ""} ${i === index && index < moves.length ? "move--next" : ""}`}
                onClick={() => jumpTo(i)} title={`Go to move ${i + 1}`}
              >{m}</button>
            </li>
          ))}
        </ol>
      )}
      <HStack gap={2} wrap="wrap" className="controls">
        <button className="ctl" onClick={() => jumpTo(0)} aria-label="Restart" title="Restart (Home)">
          <Icon icon={SkipBack} size="md" weight="fill" />
        </button>
        {!compact && <button className="ctl" onClick={() => step(-1)} aria-label="Previous move" title="Previous move (←)">
          <Icon icon={CaretLeft} size="md" weight="bold" />
        </button>}
        <button className="ctl ctl--main" onClick={toggle} aria-label={playing ? "Pause" : "Play"} title="Play / pause (space)">
          {playing ? <Icon icon={Pause} size="md" weight="fill" /> : <Icon icon={Play} size="md" weight="fill" />}
        </button>
        {!compact && <button className="ctl" onClick={() => step(1)} aria-label="Next move" title="Next move (→)">
          <Icon icon={CaretRight} size="md" weight="bold" />
        </button>}
        {!compact && (
          <HStack gap={1} className="speed" role="group" aria-label="Speed">
            {SPEEDS.map((s) => (
              <button key={s} className={`chip chip--sm ${s === speed ? "chip--on" : ""}`} onClick={() => setSpeed(s)}>{s}×</button>
            ))}
          </HStack>
        )}
        {!compact && <Text as="span" className="counter">{index} / {moves.length} · {(elapsedMs / 1000).toFixed(2)}s</Text>}
      </HStack>
      {showFingers && <Hands move={moves[index]} />}
    </VStack>
  );
}
