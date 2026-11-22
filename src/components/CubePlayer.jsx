import { useEffect, useRef, useState, useCallback } from "react";
import { TwistyPlayer } from "cubing/twisty";
import { SkipBack, CaretLeft, CaretRight, Play, Pause } from "@phosphor-icons/react";
import { parseAlg, moveToString } from "../lib/cube.js";
import Hands from "./Hands.jsx";

const SPEEDS = [0.5, 1, 1.5, 2, 3];

// The cube is turned with z2 so white sits on the bottom. cubing.js stickerings follow the pieces,
// so its built-in "F2L"/"OLL"/"PLL" masks would end up upside down. These masks are written for
// that orientation. Order: EDGES UF UR UB UL DF DR DB DL FR FL BR BL, CORNERS UFR URB UBL ULF DRF DFL DLB DBR,
// CENTERS U L F R B D (cubing.js names, before the z2 turn: its U pieces are the white ones).
const MASKS = {
  F2L: "EDGES:----DDDD----,CORNERS:----DDDD,CENTERS:------",
  OLL: "EDGES:DDDDOOOODDDD,CORNERS:DDDDOOOO,CENTERS:DDDDD-",
  PLL: "EDGES:DDDD----DDDD,CORNERS:DDDD----,CENTERS:DDDDD-",
};

// 3D cube that plays an algorithm with play/pause, single-step and a clickable move list.
// anchor "end": the cube starts in the case and finishes solved. anchor "start": starts solved (notation demos).
// Camera angle so the slot being solved faces you.
const LONGITUDE = { FR: 31, FL: -31, BR: 149, BL: -149 };

export default function CubePlayer({ alg, stickering = "full", anchor = "end", autoLoop = false, compact = false, slot, setup = "", showFingers = false, phases = null }) {
  const host = useRef(null);
  const player = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0); // number of moves already done
  const [speed, setSpeed] = useState(1);
  const moves = parseAlg(alg).map(moveToString);

  // Which CFOP phase the next move belongs to (for the on-player badge).
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
      experimentalSetupAlg: setup ? `z2 ${setup}` : "z2", // yellow on top, white on the bottom, green in front (+ optional scramble)
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
      // count moves whose animation has fully finished at this timestamp
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
    // speed is applied separately so changing it does not rebuild the player
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className={`player ${compact ? "player--compact" : ""}`}>
      {phaseLabel && <div className="player__phase">{phaseLabel}</div>}
      <div className="player__stage" ref={host} />
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
      <div className="controls">
        <button className="ctl" onClick={() => jumpTo(0)} aria-label="Restart" title="Restart (Home)">
          <SkipBack weight="fill" />
        </button>
        {!compact && <button className="ctl" onClick={() => step(-1)} aria-label="Previous move" title="Previous move (←)">
          <CaretLeft weight="bold" />
        </button>}
        <button className="ctl ctl--main" onClick={toggle} aria-label={playing ? "Pause" : "Play"} title="Play / pause (space)">
          {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
        </button>
        {!compact && <button className="ctl" onClick={() => step(1)} aria-label="Next move" title="Next move (→)">
          <CaretRight weight="bold" />
        </button>}
        {!compact && (
          <div className="speed" role="group" aria-label="Speed">
            {SPEEDS.map((s) => (
              <button key={s} className={`chip chip--sm ${s === speed ? "chip--on" : ""}`} onClick={() => setSpeed(s)}>{s}×</button>
            ))}
          </div>
        )}
        {!compact && <span className="counter">{index} / {moves.length}</span>}
      </div>
      {showFingers && <Hands move={moves[index]} />}
    </div>
  );
}
