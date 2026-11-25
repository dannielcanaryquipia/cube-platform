import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Btn, Card, Chip, FieldLabel, PageHeader, PageScroll, Screen } from '@/components/ui';
import { Radius, Rubik, Spacing, Type } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { getJSON, setJSON } from '@/lib/storage';
import {
  effectiveMs,
  formatStat,
  formatTime,
  normalizeHistory,
  randomScramble,
  sessionStats,
  type Penalty,
  type Solve,
} from '@/lib/timer-stats';

const HISTORY_KEY = 'cube-timer-history';
const SCRAMBLE_KEY = 'cube-timer-scramble';
const INSPECTION_KEY = 'cube-timer-inspection';
const HOLD_KEY = 'cube-timer-hold';

async function haptic(kind: 'select' | 'light' | 'medium' | 'warn' | 'error') {
  try {
    if (kind === 'select') await Haptics.selectionAsync();
    else if (kind === 'light') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (kind === 'medium') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (kind === 'warn') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (kind === 'error') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {}
}

export default function TimerScreen() {
  const c = useTheme();
  const { contentWidth, tileWidth } = useLayout();
  const timerSize = Math.round(Math.min(64, Math.max(40, contentWidth * 0.16)));
  const statW = tileWidth(148, Spacing.two);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<Solve[]>([]);
  const [scramble, setScramble] = useState(() => randomScramble());
  const [inspectionOn, setInspectionOn] = useState(false);
  const [holdToStart, setHoldToStart] = useState(true);
  const [inspecting, setInspecting] = useState(false);
  const [inspectionLeft, setInspectionLeft] = useState(15000);
  const [armed, setArmed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const inspectStartRef = useRef(0);
  const inspectRafRef = useRef<number | null>(null);
  const inspectionLeftRef = useRef(15000);
  const runningRef = useRef(false);
  const inspectingRef = useRef(false);
  const armedRef = useRef(false);
  const inspectionPenaltyRef = useRef<Penalty>('ok');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const HOLD_MS = 300;

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { inspectingRef.current = inspecting; }, [inspecting]);
  useEffect(() => { armedRef.current = armed; }, [armed]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [h, sc, insp, hold] = await Promise.all([
        getJSON(HISTORY_KEY, []),
        getJSON(SCRAMBLE_KEY, ''),
        getJSON(INSPECTION_KEY, false),
        getJSON(HOLD_KEY, true),
      ]);
      if (cancelled) return;
      setHistory(normalizeHistory(h));
      if (typeof sc === 'string' && sc.trim()) setScramble(sc);
      setInspectionOn(!!insp);
      setHoldToStart(hold !== false);
      setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (hydrated) void setJSON(HISTORY_KEY, history); }, [history, hydrated]);
  useEffect(() => { if (hydrated) void setJSON(INSPECTION_KEY, inspectionOn); }, [inspectionOn, hydrated]);
  useEffect(() => { if (hydrated) void setJSON(HOLD_KEY, holdToStart); }, [holdToStart, hydrated]);
  useEffect(() => { if (hydrated) void setJSON(SCRAMBLE_KEY, scramble); }, [scramble, hydrated]);

  const stopRaf = useCallback(() => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); rafRef.current = null; }, []);
  const stopInspectRaf = useCallback(() => { if (inspectRafRef.current != null) cancelAnimationFrame(inspectRafRef.current); inspectRafRef.current = null; }, []);

  useEffect(() => {
    if (!running) return;
    const tick = () => { setElapsed(performance.now() - startRef.current); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return stopRaf;
  }, [running, stopRaf]);

  useEffect(() => {
    if (!inspecting) return;
    inspectStartRef.current = performance.now();
    const tick = () => {
      const left = 15000 - (performance.now() - inspectStartRef.current);
      inspectionLeftRef.current = left;
      setInspectionLeft(left);
      inspectRafRef.current = requestAnimationFrame(tick);
    };
    inspectRafRef.current = requestAnimationFrame(tick);
    return stopInspectRaf;
  }, [inspecting, stopInspectRaf]);

  const newScramble = useCallback(() => setScramble(randomScramble()), []);

  const finishSolve = useCallback((t: number) => {
    const penalty = inspectionPenaltyRef.current;
    const solve: Solve = { t, penalty, scramble, at: Date.now() };
    inspectionPenaltyRef.current = 'ok';
    setHistory((h) => [solve, ...h].slice(0, 100));
    setScramble(randomScramble());
    if (penalty === 'dnf') void haptic('error');
    else if (penalty === '+2') void haptic('warn');
  }, [scramble]);

  const stopTimer = useCallback(() => {
    if (!runningRef.current) return;
    const t = performance.now() - startRef.current;
    stopRaf();
    setRunning(false);
    setElapsed(t);
    void haptic('light');
    finishSolve(t);
  }, [finishSolve, stopRaf]);

  const startTimer = useCallback(() => {
    if (inspectingRef.current) {
      const left = inspectionLeftRef.current;
      if (left <= -2000) inspectionPenaltyRef.current = 'dnf';
      else if (left <= 0) inspectionPenaltyRef.current = '+2';
      else inspectionPenaltyRef.current = 'ok';
    } else {
      inspectionPenaltyRef.current = 'ok';
    }
    stopInspectRaf();
    setInspecting(false);
    setInspectionLeft(15000);
    inspectionLeftRef.current = 15000;
    setElapsed(0);
    startRef.current = performance.now();
    setRunning(true);
    void haptic('medium');
  }, [stopInspectRaf]);

  const startInspection = useCallback(() => {
    setElapsed(0);
    setInspectionLeft(15000);
    inspectionLeftRef.current = 15000;
    inspectionPenaltyRef.current = 'ok';
    setInspecting(true);
  }, []);

  const reset = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    stopRaf();
    stopInspectRaf();
    setRunning(false);
    setInspecting(false);
    setArmed(false);
    setElapsed(0);
    setInspectionLeft(15000);
    inspectionLeftRef.current = 15000;
    inspectionPenaltyRef.current = 'ok';
  }, [stopRaf, stopInspectRaf]);

  const clearHold = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const onPressIn = () => {
    if (runningRef.current) return;
    if (!holdToStart) return;
    clearHold();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      setArmed(true);
      void haptic('select');
    }, HOLD_MS);
  };

  const onPressOut = () => {
    clearHold();
    if (runningRef.current) { stopTimer(); return; }
    if (holdToStart) {
      const wasArmed = armedRef.current;
      setArmed(false);
      if (!wasArmed) return;
    }
    if (inspectionOn && !inspectingRef.current) startInspection();
    else startTimer();
  };

  const onTap = () => {
    if (runningRef.current) { stopTimer(); return; }
    if (holdToStart) return;
    if (inspectionOn && !inspectingRef.current) startInspection();
    else startTimer();
  };

  const updatePenalty = useCallback((idx: number, penalty: Penalty) => {
    setHistory((h) => h.map((s, i) => i === idx ? { ...s, penalty } : s));
  }, []);
  const deleteSolve = useCallback((idx: number) => { setHistory((h) => h.filter((_, i) => i !== idx)); }, []);

  const stats = useMemo(() => sessionStats(history), [history]);

  const inspectWarn = inspecting && inspectionLeft <= 3000 && inspectionLeft > 0;
  const inspectOver = inspecting && inspectionLeft <= 0;
  const inspectPlus2 = inspecting && inspectionLeft <= 0 && inspectionLeft > -2000;
  const inspectDnf = inspecting && inspectionLeft <= -2000;
  const display = inspecting
    ? inspectDnf
      ? 'DNF'
      : inspectPlus2
        ? '+2'
        : String(Math.max(0, Math.ceil(inspectionLeft / 1000)))
    : formatTime(elapsed);
  const timerColor = inspectDnf ? c.danger : inspectOver || inspectWarn ? c.learning : armed || running ? c.accent : c.ink;
  const status = running
    ? 'Solving — tap the time to stop'
    : inspecting
      ? inspectDnf
        ? 'Inspection DNF — start anyway'
        : inspectPlus2
          ? 'Inspection +2 — start now'
          : 'Inspecting — tap the time to start'
      : armed
        ? 'Release to start'
        : holdToStart
          ? 'Hold the time to arm, release to start'
          : 'Tap the time to start';

  return (
    <Screen>
      <PageScroll>
        <PageHeader
          title="Cube Timer"
          lede="Practice with scrambles, inspection, penalties, and Ao5 / Ao12."
        />

        <Card style={{ gap: Spacing.three, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.three, minWidth: 0 }}>
            <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
              <FieldLabel>Scramble</FieldLabel>
              <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.ink, flexShrink: 1 }]}>{scramble}</Text>
            </View>
            <Btn label="New" size="sm" variant="ghost" onPress={newScramble} disabled={running || inspecting} />
          </View>

          <Pressable
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={holdToStart ? undefined : onTap}
            accessibilityRole="button"
            accessibilityLabel={status}
            style={({ pressed }) => ({
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: Spacing.four,
              paddingHorizontal: Spacing.three,
              borderRadius: Radius.md,
              borderWidth: 1,
              backgroundColor: armed ? c.accentSoft : c.bg,
              borderColor: armed ? c.accent : c.line,
              opacity: pressed && !running ? 0.96 : 1,
            })}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.45}
              style={[
                Type.timer,
                {
                  color: timerColor,
                  fontSize: timerSize,
                  lineHeight: timerSize + 8,
                  width: '100%',
                  textAlign: 'center',
                  includeFontPadding: false,
                },
              ]}
            >
              {display}
            </Text>
          </Pressable>

          <Text style={[Type.supporting, { color: c.muted, textAlign: 'center' }]}>{status}</Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            {!running && !inspecting ? (
              <Btn
                label={inspectionOn ? 'Start inspection' : 'Start'}
                onPress={inspectionOn ? startInspection : startTimer}
              />
            ) : inspecting ? (
              <Btn label="Start solve" onPress={startTimer} />
            ) : (
              <Btn label="Stop" onPress={stopTimer} />
            )}
            <Btn label="Reset" variant="ghost" onPress={reset} disabled={running} />
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            <Chip
              label={`Inspection: ${inspectionOn ? 'On' : 'Off'}`}
              active={inspectionOn}
              onPress={() => setInspectionOn((v) => !v)}
              disabled={running || inspecting}
            />
            <Chip
              label={`Hold to start: ${holdToStart ? 'On' : 'Off'}`}
              active={holdToStart}
              onPress={() => setHoldToStart((v) => !v)}
              disabled={running || inspecting}
            />
          </View>
        </Card>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, width: '100%' }}>
          <StatCard width={statW} label="Best" value={formatStat(stats.best)} />
          <StatCard width={statW} label="Mean" value={formatStat(stats.avg)} />
          <StatCard width={statW} label="σ" value={formatStat(stats.sd)} />
          <StatCard width={statW} label="Mo3" value={formatStat(stats.mo3)} />
          <StatCard width={statW} label="Ao5" value={formatStat(stats.ao5)} />
          <StatCard width={statW} label="Ao12" value={formatStat(stats.ao12)} />
        </View>

        <Card style={{ gap: Spacing.three, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three, minWidth: 0 }}>
            <FieldLabel>Recent solves</FieldLabel>
            <Text style={[Type.supporting, { color: c.muted }]}>{stats.count} solves</Text>
          </View>

          {history.length === 0 ? (
            <Text style={[Type.body, { color: c.muted }]}>No solves yet. Start a solve to build your session.</Text>
          ) : (
            history.slice(0, 20).map((s, i) => {
              const ms = effectiveMs(s);
              const isBest = stats.best != null && ms === stats.best;
              return (
                <View
                  key={s.at + '-' + i}
                  style={{
                    gap: Spacing.two,
                    paddingVertical: Spacing.three,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: c.line,
                    minWidth: 0,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.three, minWidth: 0 }}>
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text style={[Type.body, { fontFamily: Rubik.bold, color: c.ink }]}>
                        {s.penalty === 'dnf' ? 'DNF' : formatTime(ms)}
                        {s.penalty === '+2' ? ' (+2)' : ''}
                        {isBest ? ' ★' : ''}
                      </Text>
                      {!!s.scramble && (
                        <Text style={[Type.small, { color: c.muted }]}>{s.scramble}</Text>
                      )}
                    </View>
                    <Pressable onPress={() => deleteSolve(i)} hitSlop={8} accessibilityLabel="Delete solve">
                      <Ionicons name="trash-outline" size={18} color={c.muted} />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {(['ok', '+2', 'dnf'] as Penalty[]).map((p) => (
                      <Chip
                        key={p}
                        small
                        label={p.toUpperCase()}
                        active={s.penalty === p}
                        onPress={() => updatePenalty(i, p)}
                      />
                    ))}
                  </View>
                </View>
              );
            })
          )}

          {history.length > 0 && (
            <Btn label="Clear session" size="sm" variant="ghost" onPress={() => setHistory([])} />
          )}
        </Card>
      </PageScroll>
    </Screen>
  );
}

function StatCard({ label, value, width }: { label: string; value: string; width: number }) {
  const c = useTheme();
  return (
    <Card style={{ width, maxWidth: '100%', minWidth: 0, alignItems: 'center', gap: 2, padding: Spacing.three }}>
      <Text style={[Type.fieldLabel, { color: c.muted }]}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={[Type.h2, { fontFamily: Rubik.bold, color: c.ink, fontVariant: ['tabular-nums'], width: '100%', textAlign: 'center' }]}
      >
        {value}
      </Text>
    </Card>
  );
}
