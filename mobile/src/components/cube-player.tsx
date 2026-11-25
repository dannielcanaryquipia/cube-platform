import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';

import { CubeView, type CubeViewHandle } from '@/components/cube-view';
import Hands from '@/components/hands';
import { Chip, IconButton } from '@/components/ui';
import { Radius, Rubik, Spacing, Type, shadow } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { moveToString, parseAlg } from '@/lib/cube';
import { useCubeColors } from '@/lib/cubeColors';

type Phase = { label: string; len: number };

type Props = {
  alg: string;
  setup?: string;
  height?: number;
  stickering?: 'full' | 'F2L' | 'OLL' | 'PLL' | string;
  slot?: string;
  showFingers?: boolean;
  phases?: Phase[] | null;
  autoLoop?: boolean;
  autoPlay?: boolean;
  compact?: boolean;
  chrome?: boolean;
  anchor?: 'start' | 'end';
  speed?: number;
  onComplete?: () => void;
};

const SPEEDS = [0.5, 1, 2, 3, 5, 10];

function phaseLabelFor(phases: Phase[] | null | undefined, index: number, total: number) {
  if (!phases || !phases.length) return null;
  let acc = 0;
  for (const p of phases) {
    acc += p.len;
    if (index < acc) return p.label;
  }
  return phases[phases.length - 1]?.label ?? null;
}

export function CubePlayer({
  alg,
  setup = '',
  height,
  stickering = 'full',
  slot = 'FR',
  showFingers = false,
  phases = null,
  autoLoop = false,
  autoPlay = false,
  compact = false,
  chrome = true,
  anchor = 'end',
  speed: speedProp,
  onComplete,
}: Props) {
  const c = useTheme();
  const { contentWidth, isWide } = useLayout();
  const colors = useCubeColors() as Record<string, string>;
  const cubeRef = useRef<CubeViewHandle>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(speedProp ?? 1);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const clock = useRef({ running: false, startedAt: 0, base: 0, raf: 0 });
  const hadProgress = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const moves = useMemo(() => parseAlg(alg).map(moveToString), [alg]);
  const stageH = height ?? Math.round(Math.min(compact ? 300 : 460, Math.max(220, isWide ? 340 : contentWidth)));

  const setTempo = (v: number) => {
    const clamped = Math.max(0.25, Math.min(10, Math.round(v * 4) / 4));
    setSpeed(clamped);
    cubeRef.current?.setSpeed(clamped);
  };

  const toggle = () => {
    if (!playing && index >= (total || moves.length)) {
      cubeRef.current?.reset();
      setTimeout(() => cubeRef.current?.play(), 40);
      return;
    }
    if (playing) cubeRef.current?.pause();
    else cubeRef.current?.play();
  };

  const phase = phaseLabelFor(phases, index, total || moves.length);

  useEffect(() => {
    const t = clock.current;
    const tick = () => {
      if (!t.running) return;
      setElapsedMs(t.base + (performance.now() - t.startedAt));
      t.raf = requestAnimationFrame(tick);
    };
    if (playing) {
      if (!t.running) {
        t.running = true;
        t.startedAt = performance.now();
        t.raf = requestAnimationFrame(tick);
      }
      return () => {
        if (t.raf) cancelAnimationFrame(t.raf);
        t.raf = 0;
      };
    }
    if (t.running) {
      t.base += performance.now() - t.startedAt;
      t.running = false;
      if (t.raf) cancelAnimationFrame(t.raf);
      t.raf = 0;
      setElapsedMs(t.base);
    }
  }, [playing]);

  useEffect(() => {
    if (index > 0) hadProgress.current = true;
    if (index <= 0 && !playing && hadProgress.current) {
      hadProgress.current = false;
      const t = clock.current;
      t.running = false;
      t.startedAt = 0;
      t.base = 0;
      if (t.raf) cancelAnimationFrame(t.raf);
      t.raf = 0;
      setElapsedMs(0);
    }
  }, [index, playing]);

  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback((msg: string) => setError(msg), []);
  const onPlayerComplete = useCallback(() => {
    onCompleteRef.current?.();
  }, []);
  const onState = useCallback((s: { index: number; total: number; playing: boolean }) => {
    setIndex(s.index);
    setTotal(s.total);
    setPlaying(s.playing);
  }, []);

  return (
    <View style={{ gap: Spacing.three, width: '100%' }}>
      {phase && (
        <View style={{ alignSelf: 'center', backgroundColor: c.accentSoft, paddingHorizontal: 14, paddingVertical: 4, borderRadius: Radius.pill }}>
          <Text style={[Type.smallBold, { color: c.accent }]}>{phase}</Text>
        </View>
      )}

      <View
        collapsable={false}
        style={{
          height: stageH,
          width: '100%',
          maxWidth: compact ? 460 : undefined,
          alignSelf: 'center',
          borderRadius: chrome ? Radius.md : 0,
          // Android GLView (TextureView) will not create a context inside a
          // 0-width / overflow-clipped / elevated parent — that left the
          // player stuck on "Loading cube…".
          overflow: Platform.OS === 'android' ? 'visible' : 'hidden',
          backgroundColor: chrome ? c.surface2 : c.bg,
          borderWidth: chrome ? 1 : 0,
          borderColor: c.line,
          ...(chrome && Platform.OS !== 'android' ? shadow('sm', c.isDark) : null),
        }}
      >
        {!ready && !error && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 1, gap: 8 }}>
            <ActivityIndicator color={c.accent} />
            <Text style={[Type.small, { color: c.muted }]}>Loading cube…</Text>
          </View>
        )}
        {error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four }}>
            <Text style={[Type.supporting, { color: c.muted, textAlign: 'center' }]}>{error}</Text>
          </View>
        ) : (
          <CubeView
            ref={cubeRef}
            key={`${alg}|${setup}|${stickering}|${slot}|${anchor}`}
            alg={alg}
            setup={setup}
            height={stageH}
            stickering={stickering}
            slot={slot}
            colors={colors}
            autoLoop={autoLoop}
            autoPlay={autoPlay}
            speed={speed}
            anchor={anchor}
            onReady={onReady}
            onError={onError}
            onComplete={onPlayerComplete}
            onState={onState}
          />
        )}
      </View>

      {chrome && !compact && moves.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
          {moves.map((m, i) => {
            const done = i < index;
            const next = i === index && index < moves.length;
            return (
              <Pressable
                key={i}
                onPress={() => cubeRef.current?.jump(i)}
                accessibilityLabel={`Go to move ${i + 1}, ${m}`}
                style={{
                  minWidth: 40,
                  height: 36,
                  paddingHorizontal: 8,
                  borderRadius: 9,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done ? c.accentSoft : c.bg,
                  borderColor: next ? c.ink : done ? 'transparent' : c.line,
                }}
              >
                <Text style={[Type.mono, { color: done ? c.accent : c.ink }, next && { fontFamily: Rubik.bold }]}>{m}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {chrome ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, flexWrap: 'wrap' }}>
          <IconButton name="play-skip-back-outline" accessibilityLabel="Restart" onPress={() => cubeRef.current?.reset()} disabled={!ready} />
          {!compact && <IconButton name="chevron-back" accessibilityLabel="Previous move" onPress={() => cubeRef.current?.step(-1)} disabled={!ready} />}
          <IconButton name={playing ? 'pause' : 'play'} main size={54} accessibilityLabel={playing ? 'Pause' : 'Play'} onPress={toggle} disabled={!ready} />
          {!compact && <IconButton name="chevron-forward" accessibilityLabel="Next move" onPress={() => cubeRef.current?.step(1)} disabled={!ready} />}
          <View style={{ minWidth: 96, alignItems: 'flex-end' }}>
            <Text style={[Type.monoSmall, { color: c.muted }]}>
              {index} / {total || moves.length} · {(elapsedMs / 1000).toFixed(2)}s
            </Text>
          </View>
        </View>
      ) : null}

      {chrome && !compact ? (
        <View style={{ gap: Spacing.two }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {SPEEDS.map((s) => (
              <Chip key={s} label={`${s}×`} small active={speed === s} onPress={() => setTempo(s)} disabled={!ready} />
            ))}
          </View>
        </View>
      ) : null}

      {showFingers && <Hands move={moves[index]} />}
    </View>
  );
}
