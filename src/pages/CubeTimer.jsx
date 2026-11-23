import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
import { Play, Stop, ArrowCounterClockwise, Trash, Timer, Flag } from "@phosphor-icons/react";
import { movesToString } from "../lib/cube.js";

const FACES = ["U", "D", "L", "R", "F", "B"];
function randomScramble() {
  const moves = [];
  let last = "";
  for (let i = 0; i < 20; i++) {
    let f; do { f = FACES[(Math.random() * 6) | 0]; } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return movesToString(moves);
}

function format(ms) {
  if (ms == null || Number.isNaN(ms)) return "—";
  const total = Math.floor(Math.abs(ms) / 10);
  const cs = total % 100;
  const s = Math.floor(total / 100) % 60;
  const m = Math.floor(total / 6000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function loadJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || ""); return v ?? fallback; } catch { return fallback; }
}
function saveJSON(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

function normalizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => {
    if (typeof x === "number") return { t: x, penalty: "ok", scramble: "", at: Date.now() };
    if (x && typeof x.t === "number") return { t: x.t, penalty: x.penalty || "ok", scramble: x.scramble || "", at: x.at || Date.now() };
    return null;
  }).filter(Boolean).slice(0, 100);
}

function effectiveMs(solve) {
  if (!solve || solve.penalty === "dnf") return null;
  return solve.t + (solve.penalty === "+2" ? 2000 : 0);
}

function aoN(history, n) {
  const slice = history.slice(0, n);
  if (slice.length < n) return null;
  const vals = slice.map((s) => (s.penalty === "dnf" ? Infinity : effectiveMs(s)));
  const dnfs = vals.filter((v) => v === Infinity).length;
  if (n === 5 ? dnfs >= 2 : dnfs >= 2) return "DNF";
  const sorted = [...vals].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  if (trimmed.some((v) => v === Infinity)) return "DNF";
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

export default function CubeTimer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState(() => normalizeHistory(loadJSON("cube-timer-history", [])));
  const [scramble, setScramble] = useState(() => localStorage.getItem("cube-timer-scramble") || randomScramble());
  const [inspectionOn, setInspectionOn] = useState(() => loadJSON("cube-timer-inspection", false));
  const [holdToStart, setHoldToStart] = useState(() => loadJSON("cube-timer-hold", true));
  const [inspecting, setInspecting] = useState(false);
  const [inspectionLeft, setInspectionLeft] = useState(15000);
  const [armed, setArmed] = useState(false);

  const startRef = useRef(0);
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const inspectingRef = useRef(false);
  const armedRef = useRef(false);
  const inspectStartRef = useRef(0);
  const inspectRafRef = useRef(0);
  const spaceHeldRef = useRef(false);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { inspectingRef.current = inspecting; }, [inspecting]);
  useEffect(() => { armedRef.current = armed; }, [armed]);
  useEffect(() => { saveJSON("cube-timer-history", history); }, [history]);
  useEffect(() => { saveJSON("cube-timer-inspection", inspectionOn); }, [inspectionOn]);
  useEffect(() => { saveJSON("cube-timer-hold", holdToStart); }, [holdToStart]);
  useEffect(() => { try { localStorage.setItem("cube-timer-scramble", scramble); } catch {} }, [scramble]);

  useEffect(() => {
    if (!running) return;
    startRef.current = performance.now() - elapsed;
    const tick = () => { setElapsed(performance.now() - startRef.current); rafRef.current = requestAnimationFrame(tick); };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  useEffect(() => {
    if (!inspecting) return;
    inspectStartRef.current = performance.now();
    const tick = () => {
      const left = 15000 - (performance.now() - inspectStartRef.current);
      setInspectionLeft(left);
      inspectRafRef.current = requestAnimationFrame(tick);
    };
    inspectRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(inspectRafRef.current);
  }, [inspecting]);

  const newScramble = useCallback(() => setScramble(randomScramble()), []);

  const finishSolve = useCallback((t) => {
    const solve = { t, penalty: "ok", scramble, at: Date.now() };
    setHistory((h) => [solve, ...h].slice(0, 100));
    setScramble(randomScramble());
  }, [scramble]);

  const stopTimer = useCallback(() => {
    if (!runningRef.current) return;
    const t = performance.now() - startRef.current;
    cancelAnimationFrame(rafRef.current);
    setRunning(false);
    setElapsed(t);
    finishSolve(t);
  }, [finishSolve]);

  const startTimer = useCallback(() => {
    cancelAnimationFrame(inspectRafRef.current);
    setInspecting(false);
    setInspectionLeft(15000);
    setElapsed(0);
    startRef.current = performance.now();
    setRunning(true);
  }, []);

  const startInspection = useCallback(() => {
    setElapsed(0);
    setInspectionLeft(15000);
    setInspecting(true);
  }, []);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    cancelAnimationFrame(inspectRafRef.current);
    setRunning(false);
    setInspecting(false);
    setArmed(false);
    setElapsed(0);
    setInspectionLeft(15000);
  }, []);

  useEffect(() => {
    const down = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (e.target.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
      if (e.repeat) return;
      if (runningRef.current) { stopTimer(); return; }
      if (holdToStart) {
        spaceHeldRef.current = true;
        setArmed(true);
      } else {
        if (inspectionOn && !inspectingRef.current) startInspection();
        else startTimer();
      }
    };
    const up = (e) => {
      if (e.code !== "Space" && e.key !== " ") return;
      if (!holdToStart) return;
      if (!spaceHeldRef.current) return;
      e.preventDefault();
      spaceHeldRef.current = false;
      const wasArmed = armedRef.current;
      setArmed(false);
      if (runningRef.current) return;
      if (!wasArmed) return;
      if (inspectionOn && !inspectingRef.current) startInspection();
      else startTimer();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [holdToStart, inspectionOn, startInspection, startTimer, stopTimer]);

  const updatePenalty = useCallback((idx, penalty) => {
    setHistory((h) => h.map((s, i) => i === idx ? { ...s, penalty } : s));
  }, []);
  const deleteSolve = useCallback((idx) => {
    setHistory((h) => h.filter((_, i) => i !== idx));
  }, []);

  const stats = useMemo(() => {
    const valid = history.map(effectiveMs).filter((v) => v != null);
    const best = valid.length ? Math.min(...valid) : null;
    const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    const ao5 = aoN(history, 5);
    const ao12 = aoN(history, 12);
    return { best, avg, ao5, ao12, count: history.length };
  }, [history]);

  const display = inspecting ? Math.ceil(inspectionLeft / 1000) : format(elapsed);
  const inspectWarn = inspecting && inspectionLeft <= 3000 && inspectionLeft > 0;
  const inspectOver = inspecting && inspectionLeft <= 0;

  return (
    <VStack>
      <Heading level={1}>Cube Timer <Text as="span" color="secondary">Time your solves</Text></Heading>
      <Text type="body" color="secondary">Practice with scrambles, inspection, penalties, and Ao5/Ao12. Hold or tap Space to control the timer.</Text>

      <Grid columns={{ minWidth: 320, max: 2 }} gap={3} className="timer-bento bento-list">
        <GridSpan columns="full">
          <VStack className="bento-cell timer-main" gap={3}>
            <HStack gap={2} wrap="wrap" hAlign="between" vAlign="start">
              <VStack gap={1} style={{ minWidth: 0, flex: 1 }}>
                <Text weight="bold">Scramble</Text>
                <Text type="body" className="mono" style={{ wordBreak: "break-word" }}>{scramble}</Text>
              </VStack>
              <Button label="New scramble" variant="secondary" size="sm" icon={<Icon icon={ArrowCounterClockwise} size="sm" />} onClick={newScramble} isDisabled={running || inspecting} />
            </HStack>

            <VStack className={`timer-display mono ${armed ? "timer-display--armed" : ""} ${inspectWarn ? "timer-display--warn" : ""} ${inspectOver ? "timer-display--over" : ""}`} aria-live="polite">
              {display}
            </VStack>
            <Text type="supporting" color="secondary">
              {running ? "Solving… press Space to stop." : inspecting ? (inspectOver ? "Inspection over — start now (+2/DNF rules apply in WCA)." : "Inspecting… press Space to start.") : armed ? "Release Space to start." : holdToStart ? "Hold Space to arm, release to start." : "Press Space to start inspection or solve."}
            </Text>

            <HStack gap={2} wrap="wrap">
              {!running && !inspecting
                ? <Button label={inspectionOn ? "Start inspection" : "Start"} variant="primary" size="lg" icon={<Icon icon={Play} size="md" weight="fill" />} onClick={inspectionOn ? startInspection : startTimer} />
                : inspecting
                  ? <Button label="Start solve" variant="primary" size="lg" icon={<Icon icon={Play} size="md" weight="fill" />} onClick={startTimer} />
                  : <Button label="Stop" variant="primary" size="lg" icon={<Icon icon={Stop} size="md" weight="fill" />} onClick={stopTimer} />}
              <Button label="Reset" variant="secondary" size="md" icon={<Icon icon={ArrowCounterClockwise} size="sm" />} isDisabled={running} onClick={reset} />
            </HStack>

            <HStack gap={2} wrap="wrap" className="chips--scroll">
              <Button label={`Inspection: ${inspectionOn ? "On" : "Off"}`} variant={inspectionOn ? "primary" : "secondary"} size="sm" icon={<Icon icon={Timer} size="sm" />} onClick={() => setInspectionOn((v) => !v)} isDisabled={running || inspecting} />
              <Button label={`Hold to start: ${holdToStart ? "On" : "Off"}`} variant={holdToStart ? "primary" : "secondary"} size="sm" icon={<Icon icon={Flag} size="sm" />} onClick={() => setHoldToStart((v) => !v)} isDisabled={running || inspecting} />
            </HStack>
          </VStack>
        </GridSpan>

        <VStack className="bento-cell timer-stat"><Text as="span" className="timer-stat__label">Best</Text><b className="mono">{stats.best != null ? format(stats.best) : "—"}</b></VStack>
        <VStack className="bento-cell timer-stat"><Text as="span" className="timer-stat__label">Average</Text><b className="mono">{stats.avg != null ? format(stats.avg) : "—"}</b></VStack>
        <VStack className="bento-cell timer-stat"><Text as="span" className="timer-stat__label">Ao5</Text><b className="mono">{typeof stats.ao5 === "number" ? format(stats.ao5) : stats.ao5 || "—"}</b></VStack>
        <VStack className="bento-cell timer-stat"><Text as="span" className="timer-stat__label">Ao12</Text><b className="mono">{typeof stats.ao12 === "number" ? format(stats.ao12) : stats.ao12 || "—"}</b></VStack>

        <GridSpan columns="full">
          <VStack className="bento-cell" gap={2}>
            <HStack gap={2} wrap="wrap" hAlign="between" vAlign="center">
              <Heading level={2}>Recent solves</Heading>
              <Text type="supporting" color="secondary">{stats.count} solves</Text>
            </HStack>
            {history.length === 0 ? (
              <Text type="body" color="secondary">No solves yet. Start a solve to build your session.</Text>
            ) : (
              <VStack gap={2}>
                {history.slice(0, 20).map((s, i) => {
                  const ms = effectiveMs(s);
                  const isBest = stats.best != null && ms === stats.best;
                  return (
                    <HStack key={s.at + "-" + i} gap={2} wrap="wrap" hAlign="between" vAlign="center" className="solve-row">
                      <VStack gap={0} style={{ minWidth: 0, flex: 1 }}>
                        <Text type="body" className="mono">{s.penalty === "dnf" ? "DNF" : format(ms)} {s.penalty === "+2" ? "(+2)" : ""} {isBest ? "★" : ""}</Text>
                        {s.scramble && <Text type="supporting" color="secondary" style={{ wordBreak: "break-word" }}>{s.scramble}</Text>}
                      </VStack>
                      <HStack gap={1} wrap="wrap">
                        <Button label="OK" variant={s.penalty === "ok" ? "primary" : "secondary"} size="sm" onClick={() => updatePenalty(i, "ok")} />
                        <Button label="+2" variant={s.penalty === "+2" ? "primary" : "secondary"} size="sm" onClick={() => updatePenalty(i, "+2")} />
                        <Button label="DNF" variant={s.penalty === "dnf" ? "primary" : "secondary"} size="sm" onClick={() => updatePenalty(i, "dnf")} />
                        <Button label="Delete" variant="secondary" size="sm" icon={<Icon icon={Trash} size="sm" />} onClick={() => deleteSolve(i)} />
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            )}
            {history.length > 0 && <Button label="Clear session" variant="secondary" size="sm" onClick={() => { setHistory([]); try { localStorage.removeItem("cube-timer-history"); } catch {} }} />}
          </VStack>
        </GridSpan>
      </Grid>
    </VStack>
  );
}
