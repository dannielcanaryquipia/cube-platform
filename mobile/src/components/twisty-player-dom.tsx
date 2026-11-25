'use dom';

import { TwistyPlayer } from 'cubing/twisty';
import { useEffect, useRef } from 'react';

// Metro split-chunks cubing's 3D renderer (`import("./twisty-dynamic-3d-…")`).
// Load it here so the module is already in this bundle and play() does not
// hit "Requiring unknown module".
import '../../node_modules/cubing/dist/lib/cubing/chunks/twisty-dynamic-3d-HSYJR5CM.js';

type TwistyCommand = {
  seq: number;
  name: 'play' | 'pause' | 'toggle' | 'reset' | 'jump' | 'step' | 'speed' | 'end' | 'idle';
  arg?: number;
};

const MASKS: Record<string, string> = {
  F2L: 'EDGES:----DDDD----,CORNERS:----DDDD,CENTERS:------',
  OLL: 'EDGES:DDDDOOOODDDD,CORNERS:DDDDOOOO,CENTERS:DDDDD-',
  PLL: 'EDGES:DDDD----DDDD,CORNERS:DDDD----,CENTERS:DDDDD-',
};

const LONGITUDE: Record<string, number> = { FR: 31, FL: -31, BR: 149, BL: -149 };

type Props = {
  alg: string;
  setup?: string;
  stickering?: string;
  slot?: string;
  anchor?: 'start' | 'end';
  autoLoop?: boolean;
  autoPlay?: boolean;
  speed?: number;
  colors: Record<string, string>;
  command?: TwistyCommand;
  frameWidth: number;
  frameHeight: number;
  bg: string;
  onState: (s: { index: number; total: number; playing: boolean }) => Promise<void>;
  onReady: () => Promise<void>;
  onComplete: () => Promise<void>;
  onError: (msg: string) => Promise<void>;
  dom?: import('expo/dom').DOMProps;
};

function setupAlg(setup: string) {
  const s = setup.trim();
  if (!s) return 'z2';
  if (/^z2\b/i.test(s)) return s;
  return `z2 ${s}`;
}

function applyCubeColors(p: TwistyPlayer, c: Record<string, string>) {
  const map = { U: c.U, D: c.D, F: c.F, B: c.B, L: c.L, R: c.R };
  for (const [face, val] of Object.entries(map)) {
    if (!val) continue;
    const k = face.toLowerCase();
    p.style.setProperty(`--color-${k}`, val);
    p.style.setProperty(`--${k}-color`, val);
  }
  const cubingFaceToApp: Record<string, string> = { U: 'D', D: 'U', F: 'F', B: 'B', R: 'L', L: 'R' };
  const orig: Record<string, { regular: number[]; dim: number[] }> = {
    U: { regular: [0xffffff], dim: [0xefefef] },
    L: { regular: [0xff8800, 0xffc100], dim: [0xc1aa00] },
    F: { regular: [0x00ff00], dim: [0x00c100] },
    R: { regular: [0xff0000], dim: [0xaa0000] },
    B: { regular: [0x2266ff, 0x66aaff], dim: [0x497cc1] },
    D: { regular: [0xffff00], dim: [0xc1c100] },
  };
  const toHex = (s: string) => {
    const m = String(s).trim();
    if (m[0] !== '#') return null;
    const h = m.slice(1);
    return parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  };
  const dimColor = (hex: number) => {
    const r = (hex >> 16) & 255;
    const g = (hex >> 8) & 255;
    const b = hex & 255;
    return ((Math.round(r * 0.55) << 16) | (Math.round(g * 0.55) << 8) | Math.round(b * 0.55)) >>> 0;
  };
  const applyToObject = (obj: { traverse?: (fn: (node: any) => void) => void }) => {
    obj.traverse?.((node) => {
      const mats = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
      for (const mat of mats) {
        if (!mat?.color || typeof mat.color.getHex !== 'function') continue;
        const hex = mat.color.getHex();
        let cf = mat.userData?.cubingFace;
        let kind = mat.userData?.cubingKind;
        if (!cf || !kind) {
          outer: for (const [face, kinds] of Object.entries(orig)) {
            for (const [k, vals] of Object.entries(kinds)) {
              if (vals.includes(hex)) {
                cf = face;
                kind = k;
                break outer;
              }
            }
          }
        }
        if (!cf || !kind) continue;
        mat.userData.cubingFace = cf;
        mat.userData.cubingKind = kind;
        const base = toHex(c[cubingFaceToApp[cf]]);
        if (base == null) continue;
        const next = kind === 'dim' ? dimColor(base) : base;
        if (next !== hex) {
          mat.color.setHex(next);
          mat.needsUpdate = true;
        }
      }
    });
  };
  void (async () => {
    if (typeof p.experimentalCurrentThreeJSPuzzleObject !== 'function') return;
    for (let i = 0; i < 8; i++) {
      try {
        const obj = await p.experimentalCurrentThreeJSPuzzleObject();
        applyToObject(obj);
      } catch {
        /* puzzle object not ready yet */
      }
      await new Promise((r) => setTimeout(r, 120));
    }
  })();
}

function sizePlayer(p: TwistyPlayer, w: number, h: number) {
  const pxW = `${Math.max(1, Math.round(w))}px`;
  const pxH = `${Math.max(1, Math.round(h))}px`;
  p.style.display = 'block';
  p.style.width = pxW;
  p.style.height = pxH;
  p.style.maxWidth = '100%';
  p.style.maxHeight = '100%';
}

export default function TwistyPlayerDom({
  alg,
  setup = '',
  stickering = 'full',
  slot = 'FR',
  anchor = 'end',
  autoLoop = false,
  autoPlay = false,
  speed = 1,
  colors,
  command,
  frameWidth,
  frameHeight,
  bg,
  onState,
  onReady,
  onComplete,
  onError,
}: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const player = useRef<TwistyPlayer | null>(null);
  const completed = useRef(false);
  const lastCommandSeq = useRef(0);

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.documentElement.style.background = bg;
    document.body.style.margin = '0';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.background = bg;
  }, [bg]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    completed.current = false;
    let loopTimer: ReturnType<typeof setTimeout> | undefined;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    let readyFallback: ReturnType<typeof setTimeout> | undefined;
    let p: TwistyPlayer;
    try {
      p = new TwistyPlayer({
        puzzle: '3x3x3',
        alg: alg || '',
        experimentalSetupAlg: setupAlg(setup),
        experimentalSetupAnchor: anchor,
        ...(MASKS[stickering] ? { experimentalStickeringMaskOrbits: MASKS[stickering] } : {}),
        background: 'none',
        controlPanel: 'none',
        hintFacelets: 'none',
        tempoScale: speed,
        viewerLink: 'none',
        visualization: '3D',
        ...(slot && slot !== 'FR' && LONGITUDE[slot] != null ? { cameraLongitude: LONGITUDE[slot] } : {}),
      });
    } catch (e) {
      void onError(e instanceof Error ? e.message : String(e));
      return;
    }
    sizePlayer(p, frameWidth, frameHeight);
    p.style.background = bg;
    applyCubeColors(p, colors);
    el.replaceChildren(p);
    player.current = p;
    lastCommandSeq.current = 0;

    const model = p.experimentalModel;
    const report = async () => {
      try {
        const [indexer, info, playingInfo] = await Promise.all([
          model.indexer.get(),
          model.detailedTimelineInfo.get(),
          model.playingInfo.get(),
        ]);
        const n = indexer.numAnimatedLeaves();
        let done = 0;
        while (
          done < n &&
          indexer.indexToMoveStartTimestamp(done as never) + indexer.moveDuration(done as never) <= info.timestamp
        ) {
          done += 1;
        }
        const index = info.atEnd ? n : done;
        await onState({ index, total: n, playing: playingInfo.playing });
        if (info.atEnd && !completed.current) {
          completed.current = true;
          await onComplete();
        }
        if (!info.atEnd) completed.current = false;
      } catch {
        /* model not ready */
      }
    };

    model.detailedTimelineInfo.addFreshListener(() => {
      void report();
    });
    model.playingInfo.addFreshListener(() => {
      void report();
    });

    void report();
    const waitForCanvas = () => {
      const canvas = el.querySelector('canvas');
      if (canvas && canvas.getBoundingClientRect().height > 8) {
        void onReady();
        return;
      }
      readyTimer = setTimeout(waitForCanvas, 80);
    };
    waitForCanvas();
    readyFallback = setTimeout(() => void onReady(), 2500);

    if (autoLoop) {
      const onEnd = (info: { atEnd: boolean }) => {
        if (info.atEnd) {
          clearTimeout(loopTimer);
          loopTimer = setTimeout(() => {
            p.jumpToStart();
            p.play();
          }, 900);
        }
      };
      model.detailedTimelineInfo.addFreshListener(onEnd);
      setTimeout(() => p.play(), 400);
    } else if (autoPlay) {
      setTimeout(() => p.play(), 120);
    }

    return () => {
      clearTimeout(loopTimer);
      clearTimeout(readyTimer);
      clearTimeout(readyFallback);
      p.remove();
      player.current = null;
    };
    // colors/speed are applied by dedicated effects so playback is not rebuilt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alg, setup, stickering, slot, anchor, autoLoop, autoPlay, frameWidth, frameHeight, bg]);

  useEffect(() => {
    if (player.current) applyCubeColors(player.current, colors);
  }, [colors]);

  useEffect(() => {
    if (player.current) player.current.tempoScale = speed;
  }, [speed]);

  useEffect(() => {
    const p = player.current;
    if (!p || !command || command.name === 'idle') return;
    if (command.seq === lastCommandSeq.current) return;
    lastCommandSeq.current = command.seq;
    void (async () => {
      try {
        if (command.name === 'play') p.play();
        else if (command.name === 'pause') p.pause();
        else if (command.name === 'toggle') p.togglePlay();
        else if (command.name === 'reset') {
          p.timestamp = 0 as never;
          p.pause();
        } else if (command.name === 'end') {
          p.jumpToEnd();
          p.pause();
        } else if (command.name === 'speed') p.tempoScale = command.arg ?? 1;
        else if (command.name === 'jump') {
          const indexer = await p.experimentalModel.indexer.get();
          const n = indexer.numAnimatedLeaves();
          const i = Math.max(0, Math.min(n, command.arg ?? 0));
          p.pause();
          if (i >= n) p.jumpToEnd();
          else if (i <= 0) p.timestamp = 0 as never;
          else p.experimentalModel.timestampRequest.set(indexer.indexToMoveStartTimestamp(i as never));
        } else if (command.name === 'step') {
          p.pause();
          p.controller.animationController.play({
            direction: command.arg ?? 1,
            untilBoundary: 'move',
            autoSkipToOtherEndIfStartingAtBoundary: false,
          });
        }
      } catch (e) {
        await onError(e instanceof Error ? e.message : String(e));
      }
    })();
    // Only new command.seq is a real user action. Re-running play/toggle on each
    // parent render (index ticks) starts/stops the cube every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command?.seq]);

  return (
    <div
      ref={host}
      style={{
        width: frameWidth,
        height: frameHeight,
        background: bg,
        touchAction: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
