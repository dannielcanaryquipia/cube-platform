import { useState } from "react";
import { Link } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Icon } from "@astryxdesign/core/Icon";
import { Cube, Shuffle, ArrowCounterClockwise, CaretRight } from "@phosphor-icons/react";
import { solved, applyMoves, invertMoves, parseAlg, movesToString } from "../lib/cube.js";
import { solveCube, colorsOf } from "../lib/solve.js";
import { COLORS, FACE_NAME } from "../data/colors.js";
import NetEditor from "../components/NetEditor.jsx";
import CubePlayer from "../components/CubePlayer.jsx";

const PAINTS = ["U", "F", "R", "B", "L", "D"];
const FACES = ["U", "D", "L", "R", "F", "B"];

const PHASE_INFO = {
  Cross: "Solve the four white edges on the bottom.",
  F2L: "Pair a white corner with its edge, then insert it.",
  OLL: "Orient the last layer — make the whole top yellow.",
  PLL: "Permute the last layer — send every piece home.",
};

function randomScramble() {
  const moves = [];
  let last = "";
  for (let i = 0; i < 25; i++) {
    let f; do { f = FACES[(Math.random() * 6) | 0]; } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return { loc: applyMoves(solved(), moves), alg: movesToString(moves) };
}

export default function Solve() {
  const [color, setColor] = useState(() => colorsOf(solved()));
  const [paint, setPaint] = useState("U");
  const [result, setResult] = useState(null);
  const [solving, setSolving] = useState(false);
  const [scramble, setScramble] = useState("");
  const [typed, setTyped] = useState("");
  const [typeErr, setTypeErr] = useState("");
  const [humanSpeed, setHumanSpeed] = useState(() => {
    try { return Number(localStorage.getItem("cube-human-speed") || 2); } catch { return 2; }
  });

  const apply = (loc, alg) => { setColor(colorsOf(loc)); setResult(null); setScramble(alg); };
  const onPaint = (slot) => { setResult(null); setScramble(""); setColor((c) => c.map((v, i) => (i === slot ? paint : v))); };
  const doReset = () => { apply(solved(), ""); setTyped(""); setTypeErr(""); };
  const submitTyped = () => {
    const moves = parseAlg(typed);
    if (!moves.length) { setTypeErr("Enter moves like R U R' U2 F"); return; }
    setTypeErr("");
    apply(applyMoves(solved(), moves), movesToString(moves));
  };

  const doSolve = () => {
    setSolving(true); setResult(null);
    setTimeout(() => { setResult(solveCube(color)); setSolving(false); }, 20);
  };

  const scrambleSetup = result?.alg ? movesToString(invertMoves(parseAlg(result.alg))) : "";

  return (
    <VStack>
      <Heading level={1}>Solve <Text as="span" color="secondary">Paint your cube, get a CFOP solution</Text></Heading>
      <Text type="body" color="secondary">Colour every sticker to match the cube in your hands — hold it white on the bottom, yellow on top, green in front, like the centres shown. Then solve it and watch the method stage by stage in 3D.</Text>

      <Grid columns={{ minWidth: 340, max: 2 }} gap={3} className={`solve-bento bento-list ${result?.stages ? "solve-bento--result" : ""}`}>
        <VStack className="bento-cell solve__editor">
          <Text weight="bold">Cube editor</Text>
          <HStack gap={2} wrap="wrap" className="palette" role="group" aria-label="Pick a colour">
            {PAINTS.map((f) => (
              <button key={f} className={`swatch ${paint === f ? "swatch--on" : ""}`} onClick={() => setPaint(f)}
                style={{ background: COLORS[f] }} aria-label={FACE_NAME[f]} title={FACE_NAME[f]} />
            ))}
          </HStack>
          <NetEditor color={color} onPaint={onPaint} />
          <HStack gap={2} wrap="wrap" className="solve__actions">
            <Button label={solving ? "Solving…" : "Solve"} variant="primary" icon={<Icon icon={Cube} size="sm" weight="fill" />} isDisabled={solving} onClick={doSolve} />
            <Button label="Scramble" variant="secondary" size="sm" icon={<Icon icon={Shuffle} size="sm" />} onClick={() => { const s = randomScramble(); apply(s.loc, s.alg); }} />
            <Button label="Reset" variant="secondary" size="sm" icon={<Icon icon={ArrowCounterClockwise} size="sm" />} onClick={doReset} />
          </HStack>
          {scramble && <p className="scramble-line"><Text as="span">Scramble</Text> <code className="mono">{scramble}</code></p>}
          <form className="try" onSubmit={(e) => { e.preventDefault(); submitTyped(); }}>
            <TextInput label="Or type a scramble in notation" value={typed} onChange={(v) => setTyped(v)}
              onEnter={submitTyped} placeholder="R U R' U' F2 L D2 …" width="100%" />
            <HStack gap={2}>
              <Button label="Apply" variant="primary" size="sm" onClick={submitTyped} />
            </HStack>
            {typeErr && <Text as="span" className="note note--warn">{typeErr}</Text>}
          </form>
          {result?.error && <p className="note note--warn">{result.error}</p>}
        </VStack>

        {!result?.stages && !solving && (
          <VStack className="bento-cell solve__hint">
            <Text weight="bold">How it solves</Text>
            <p>The solution follows CFOP: a white <b>Cross</b>, then the <b>F2L</b> pairs, then <b>OLL</b> and <b>PLL</b> from this site's own algorithm sets — each last-layer stage links to its lesson.</p>
            <p className="hint">Cross and F2L are found by a computer search, so they are short but may not match a hand-learned solution.</p>
          </VStack>
        )}

        {result?.stages && (
          <VStack className="bento-cell solve__player-panel">
            <HStack gap={2} wrap="wrap" hAlign="between" vAlign="center">
              <Text weight="bold">Solution</Text>
              <Text as="span" className="solve__summary"><b>{result.moveCount}</b> moves · {result.stages.length} stages</Text>
            </HStack>
            <VStack className="solve__player">
              <CubePlayer key={result.alg} alg={result.alg} setup={scrambleSetup} anchor="start" showFingers
                phases={result.stages.map((s) => ({ label: s.caseId ? `${s.stage} · ${s.caseName}` : s.stage, len: s.moves.length }))} />
            </VStack>
          </VStack>
        )}

        {result?.stages && (
          <GridSpan columns="full">
            <VStack gap={2} className="solve__stages-wrap">
              <Text weight="bold">Stages</Text>
              <ol className="stages">
                {result.stages.map((s, i) => (
                  <li key={i} className="stage">
                    <HStack gap={2} hAlign="between" className="stage__head">
                      <Text as="span" className="stage__name">{s.stage}</Text>
                      {s.caseId
                        ? <Link to={`/case/${s.caseId}`} state={{ from: "/solve" }} className="stage__case">{s.caseName}<Icon icon={CaretRight} size="sm" aria-hidden="true" /></Link>
                        : s.caseName && <Text as="span" className="stage__case stage__case--muted">{s.caseName}</Text>}
                    </HStack>
                    <p className="stage__desc">{PHASE_INFO[s.stage.split(" ")[0]]}</p>
                    <HStack gap={1} wrap="wrap" className="stage__moves">
                      {s.moves.length
                        ? s.moves.map((m, j) => <Text as="span" key={j} className="stage__move">{m}</Text>)
                        : <Text as="span" className="stage__move stage__move--none" aria-hidden="true">—</Text>}
                      {s.moves.length > 0 && <Text as="span" className="stage__count">{s.moves.length} {s.moves.length === 1 ? "move" : "moves"}</Text>}
                    </HStack>
                  </li>
                ))}
              </ol>
            </VStack>
          </GridSpan>
        )}

        {result?.stages && (
          <GridSpan columns="full">
            <VStack className="bento-cell human-finish">
              <Text weight="bold">Pace estimate</Text>
              <HStack gap={2} wrap="wrap" className="human-finish__row">
                <label htmlFor="hspeed">Human speed (moves/sec)</label>
                <input id="hspeed" type="number" min="0.5" max="10" step="0.5" value={humanSpeed}
                  onChange={(e) => { const v = Number(e.target.value) || 2; setHumanSpeed(v); try { localStorage.setItem("cube-human-speed", String(v)); } catch {} }} />
              </HStack>
              <p className="human-finish__stat">
                Estimated human time: <b className="mono">{(result.moveCount / Math.max(0.1, humanSpeed)).toFixed(1)}s</b>
                {" · "}Finish at <b className="mono">{new Date(Date.now() + (result.moveCount / Math.max(0.1, humanSpeed)) * 1000).toLocaleTimeString()}</b>
              </p>
              <p className="human-finish__stat">
                Speedcuber time (10 moves/sec): <b className="mono">{(result.moveCount / 10).toFixed(2)}s</b>
                {" · "}Yiheng Wang pace (12 moves/sec): <b className="mono">{(result.moveCount / 12).toFixed(2)}s</b>
              </p>
              <p className="hint">Computer found {result.moveCount} moves. At your speed that's a {result.moveCount / Math.max(0.1, humanSpeed) < 30 ? "fast" : result.moveCount / Math.max(0.1, humanSpeed) < 60 ? "solid" : "long"} solve.</p>
            </VStack>
          </GridSpan>
        )}
      </Grid>
    </VStack>
  );
}
