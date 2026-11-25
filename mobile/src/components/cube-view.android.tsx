import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';

import { StickerCube } from '@/components/sticker-cube';
import { applyMoves, invertMoves, parseAlg, solved } from '@/lib/cube';

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
  colors: Record<string, string>;
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

function locAt(setupMoves: { face: string; amount: number }[], algMoves: { face: string; amount: number }[], index: number) {
  return applyMoves(solved(), [...setupMoves, ...algMoves.slice(0, index)]);
}

/**
 * Android release APKs native-crash inside expo-gl / three.js (uncaught from JS).
 * This path is SVG-only so F2L / boot / notation stay up. Play still steps the alg.
 */
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
    anchor = 'end',
    onState,
    onComplete,
    onReady,
  },
  ref
) {
  const algMoves = useMemo(() => parseAlg(alg), [alg]);
  const setupMoves = useMemo(() => {
    const base = parseAlg(setup.trim());
    if (anchor !== 'end') return base;
    return [...base, ...invertMoves(algMoves).filter((m: { amount: number }) => m.amount)];
  }, [algMoves, anchor, setup]);
  const total = algMoves.length;
  const [index, setIndex] = useState(0);
  const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const applyIndex = useCallback(
    (next: number) => {
      const s = live.current;
      s.index = next;
      setIndex(next);
      emit();
    },
    [emit]
  );

  const pause = useCallback(() => {
    live.current.playing = false;
    if (loopTimer.current) {
      clearTimeout(loopTimer.current);
      loopTimer.current = null;
    }
    emit();
  }, [emit]);

  const playNext = useCallback(() => {
    const s = live.current;
    if (!s.playing) return;
    if (s.index >= s.total) {
      s.playing = false;
      emit();
      if (s.autoLoop) {
        loopTimer.current = setTimeout(() => {
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
    loopTimer.current = setTimeout(() => {
      applyIndex(s.index + 1);
      playNext();
    }, MOVE_MS / Math.max(0.25, s.speed));
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

  useEffect(() => {
    applyIndex(0);
    onReady?.();
    if (autoPlay) {
      live.current.playing = true;
      emit();
      playNext();
    }
    return () => {
      live.current.playing = false;
      if (loopTimer.current) clearTimeout(loopTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alg, setup, anchor]);

  const loc = useMemo(() => locAt(setupMoves, algMoves, index), [algMoves, index, setupMoves]);
  const cubeSize = Math.max(120, Math.min(280, height - 24));

  return (
    <View
      collapsable={false}
      style={{ width: '100%', height, alignItems: 'center', justifyContent: 'center' }}
      accessibilityLabel="Rubik's cube"
    >
      <StickerCube loc={loc} colors={colors} stickering={stickering} slot={slot} size={cubeSize} />
    </View>
  );
});
