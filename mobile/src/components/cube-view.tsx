// Android uses cube-view.android.tsx (SVG). Do not mount GLView there — expo-gl
// native-crashes the release APK and JS cannot catch it.
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { PanResponder, PixelRatio, View } from 'react-native';

import { invertMoves, parseAlg } from '@/lib/cube';
import { CubeEngine, withOrientation, type CubeColors, type CubeMove } from '@/lib/cube3d';
import { bootLog } from '@/lib/boot-log';

export type CubeViewHandle = {
  play: () => void;
  pause: () => void;
  reset: () => void;
  jump: (i: number) => void;
  step: (dir: number) => void;
  setSpeed: (s: number) => void;
};

export type CubeState = {
  index: number;
  total: number;
  playing: boolean;
};

type Props = {
  alg: string;
  setup?: string;
  height?: number;
  stickering?: string;
  slot?: string;
  colors: CubeColors;
  autoPlay?: boolean;
  autoLoop?: boolean;
  speed?: number;
  interactive?: boolean;
  anchor?: 'start' | 'end';
  onState?: (s: CubeState) => void;
  onComplete?: () => void;
  onReady?: () => void;
  onError?: (msg: string) => void;
};

const LOOP_PAUSE = 900;
const MOVE_MS = 240;

export const CubeView = forwardRef<CubeViewHandle, Props>(function CubeView(
  {
    alg,
    setup = '',
    height = 280,
    stickering = 'full',
    slot = 'FR',
    colors,
    autoPlay = false,
    autoLoop = false,
    speed = 1,
    interactive = true,
    anchor = 'end',
    onState,
    onComplete,
    onReady,
    onError,
  },
  ref
) {
  const engineRef = useRef<CubeEngine | null>(null);
  const rafRef = useRef(0);
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const algMoves = useMemo(() => parseAlg(alg) as CubeMove[], [alg]);
  // cubing.js setupAnchor "end": show the case (inverse of the alg), then playing the alg solves it.
  const setupMoves = useMemo(() => {
    const base = parseAlg(withOrientation(setup)) as CubeMove[];
    if (anchor !== 'end') return base;
    return [...base, ...(invertMoves(algMoves) as CubeMove[]).filter((m) => m.amount)];
  }, [algMoves, anchor, setup]);
  const total = algMoves.length;
  const [viewSize, setViewSize] = useState({ w: 0, h: height });

  const live = useRef({
    index: 0,
    playing: false,
    speed,
    autoLoop,
    setupMoves,
    algMoves,
    total,
    onState,
    onComplete,
  });
  live.current.setupMoves = setupMoves;
  live.current.algMoves = algMoves;
  live.current.total = total;
  live.current.speed = speed;
  live.current.autoLoop = autoLoop;
  live.current.onState = onState;
  live.current.onComplete = onComplete;

  const emit = useCallback(() => {
    const s = live.current;
    s.onState?.({ index: s.index, total: s.total, playing: s.playing });
  }, []);

  const applyIndex = useCallback((index: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.anim) engine.finishAnim(true);
    const s = live.current;
    engine.resetSolved();
    engine.applyMovesInstant(s.setupMoves);
    engine.applyMovesInstant(s.algMoves.slice(0, index));
    s.index = index;
    emit();
  }, [emit]);

  const pause = useCallback(() => {
    live.current.playing = false;
    if (loopTimer.current) {
      clearTimeout(loopTimer.current);
      loopTimer.current = null;
    }
    emit();
  }, [emit]);

  const playNext = useCallback(() => {
    const engine = engineRef.current;
    const s = live.current;
    if (!engine || !s.playing) return;
    if (s.index >= s.total) {
      s.playing = false;
      emit();
      if (s.autoLoop) {
        loopTimer.current = setTimeout(() => {
          if (!engineRef.current) return;
          applyIndex(0);
          s.playing = true;
          emit();
          playNext();
        }, LOOP_PAUSE);
      } else {
        s.onComplete?.();
      }
      return;
    }
    const move = s.algMoves[s.index];
    engine.startMove(move.face, move.amount, MOVE_MS / Math.max(0.25, s.speed), () => {
      s.index += 1;
      emit();
      playNext();
    });
  }, [applyIndex, emit]);

  const play = useCallback(() => {
    const s = live.current;
    if (s.playing) return;
    if (s.index >= s.total) applyIndex(0);
    s.playing = true;
    emit();
    playNext();
  }, [applyIndex, emit, playNext]);

  const reset = useCallback(() => {
    pause();
    applyIndex(0);
  }, [applyIndex, pause]);

  const jump = useCallback(
    (i: number) => {
      pause();
      applyIndex(Math.max(0, Math.min(live.current.total, i | 0)));
    },
    [applyIndex, pause]
  );

  const step = useCallback(
    (dir: number) => {
      pause();
      applyIndex(Math.max(0, Math.min(live.current.total, live.current.index + dir)));
    },
    [applyIndex, pause]
  );

  useImperativeHandle(
    ref,
    () => ({
      play,
      pause,
      reset,
      jump,
      step,
      setSpeed: (v: number) => {
        live.current.speed = v;
      },
    }),
    [jump, pause, play, reset, step]
  );

  const lastPan = useRef({ x: 0, y: 0 });
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => interactive,
      onMoveShouldSetPanResponder: (_, g) => interactive && (Math.abs(g.dx) > 2 || Math.abs(g.dy) > 2),
      onPanResponderGrant: () => {
        lastPan.current = { x: 0, y: 0 };
      },
      onPanResponderMove: (_, g) => {
        const dx = g.dx - lastPan.current.x;
        const dy = g.dy - lastPan.current.y;
        lastPan.current = { x: g.dx, y: g.dy };
        engineRef.current?.orbit(dx, dy);
      },
    })
  ).current;

  useEffect(() => {
    engineRef.current?.recolor(colors);
  }, [colors]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const bufW = engine.gl.drawingBufferWidth;
    const bufH = engine.gl.drawingBufferHeight;
    if (bufW > 1 && bufH > 1) {
      engine.setSize(bufW, bufH);
      return;
    }
    const pr = PixelRatio.get();
    engine.setSize(Math.max(1, Math.round(viewSize.w * pr)), Math.max(1, Math.round(viewSize.h * pr)));
  }, [viewSize.h, viewSize.w]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!engineRef.current) {
        bootLog('cube gl context timeout');
        onError?.('Could not start the 3D cube. Reload this screen and try again.');
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [onError]);

  useEffect(() => {
    return () => {
      if (loopTimer.current) clearTimeout(loopTimer.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      const engine = engineRef.current;
      engineRef.current = null;
      engine?.dispose();
    };
  }, []);

  const onContextCreate = useCallback(
    (gl: ExpoWebGLRenderingContext) => {
      try {
        bootLog('cube gl context', { w: gl.drawingBufferWidth, h: gl.drawingBufferHeight });
        if (engineRef.current) {
          engineRef.current.dispose();
          engineRef.current = null;
        }
        const engine = new CubeEngine(gl, { colors, stickering, slot });
        engineRef.current = engine;
        applyIndex(0);
        onReady?.();
        if (autoPlay) {
          live.current.playing = true;
          emit();
          playNext();
        }
        const loop = () => {
          if (!engineRef.current || engineRef.current.disposed) return;
          engine.tick();
          engine.render();
          if (engineRef.current?.disposed) return;
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        bootLog('cube gl failed', msg);
        onError?.(msg);
      }
    },
    [applyIndex, autoPlay, colors, emit, onError, onReady, playNext, slot, stickering]
  );

  return (
    <View
      collapsable={false}
      style={{ width: '100%', height }}
      onLayout={(e) => {
        const { width, height: nextH } = e.nativeEvent.layout;
        if (width < 2 || nextH < 2) return;
        setViewSize((prev) => (prev.w === Math.round(width) && prev.h === Math.round(nextH) ? prev : { w: Math.round(width), h: Math.round(nextH) }));
      }}
      {...(interactive ? pan.panHandlers : null)}
      accessibilityLabel="3D Rubik's cube"
    >
      {viewSize.w > 0 ? (
        <GLView
          collapsable={false}
          pointerEvents="none"
          style={{ width: viewSize.w, height: viewSize.h }}
          onContextCreate={onContextCreate}
          msaaSamples={0}
        />
      ) : null}
    </View>
  );
});
