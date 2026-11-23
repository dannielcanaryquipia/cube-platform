import { useEffect, useRef, useState, useCallback } from "react";
import { TwistyPlayer } from "cubing/twisty";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { SkipBack, CaretLeft, CaretRight, Play, Pause } from "@phosphor-icons/react";
import { parseAlg, moveToString } from "../lib/cube.js";
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
  const moves = parseAlg(alg).map(moveToString);

  let phaseLabel = null;
  if (phases && phases.length) {
    let acc = 0;
    for (const p of phases) { acc += p.len; if (index < acc) { phaseLabel = p.label; break; } }
    if (!phaseLabel) phaseLabel = phases[phases.length - 1].label;
  }

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
    host.current.appendChild(p);
    player.current = p;
    const model = p.experimentalModel;
    const onTime = async (info) => {
      const indexer = await model.indexer.get();
      const n = indexer.numAnimatedLeaves();
      let done = 0;
      while (done < n && indexer.indexToMoveStartTimestamp(done) + indexer.moveDuration(done) <= info.timestamp) done++;
      setIndex(info.atEnd ? n : done);
    };
    const onPlay = (info) => setPlaying(info.playing);
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
    return () => {
      clearTimeout(loopTimer);
      model.detailedTimelineInfo.removeFreshListener(onTime);
      model.playingInfo.removeFreshListener(onPlay);
      p.remove();
      player.current = null;
    };
  }, [alg, stickering, anchor, autoLoop, slot, setup]);

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
    if (i >= n) { p.jumpToEnd(); return; }
    p.experimentalModel.timestampRequest.set(indexer.indexToMoveStartTimestamp(i));
  }, []);
  const toggle = () => {
    const p = player.current; if (!p) return;
    if (!playing && index >= moves.length) p.jumpToStart();
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
        {!compact && <Text as="span" className="counter">{index} / {moves.length}</Text>}
      </HStack>
      {showFingers && <Hands move={moves[index]} />}
    </VStack>
  );
}
