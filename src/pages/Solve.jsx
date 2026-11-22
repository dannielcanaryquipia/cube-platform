import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [scramble, setScramble] = useState("");       // notation of the current setup ("" if hand-painted)
  const [typed, setTyped] = useState("");
  const [typeErr, setTypeErr] = useState("");

  const apply = (loc, alg) => { setColor(colorsOf(loc)); setResult(null); setScramble(alg); };
  const onPaint = (slot) => { setResult(null); setScramble(""); setColor((c) => c.map((v, i) => (i === slot ? paint : v))); };
  const doReset = () => { apply(solved(), ""); setTyped(""); setTypeErr(""); };
  const applyTyped = (e) => {
    e.preventDefault();
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
    <div>
      <h1 className="page-title">Solve <small>Paint your cube, get a CFOP solution</small></h1>
      <p className="lede">Colour every sticker to match the cube in your hands — hold it white on the bottom, yellow on top, green in front, like the centres shown. Then solve it and watch the method stage by stage in 3D.</p>

      <div className={`solve ${result?.stages ? "solve--result" : ""}`}>
        <div className="solve__editor">
          <div className="palette" role="group" aria-label="Pick a colour">
            {PAINTS.map((f) => (
              <button key={f} className={`swatch ${paint === f ? "swatch--on" : ""}`} onClick={() => setPaint(f)}
                style={{ background: COLORS[f] }} aria-label={FACE_NAME[f]} title={FACE_NAME[f]} />
            ))}
          </div>
          <NetEditor color={color} onPaint={onPaint} />
          <div className="solve__actions">
            <button className="btn" onClick={doSolve} disabled={solving}><Cube weight="fill" aria-hidden="true" />{solving ? "Solving…" : "Solve"}</button>
            <button className="btn btn--ghost btn--sm" onClick={() => { const s = randomScramble(); apply(s.loc, s.alg); }}><Shuffle aria-hidden="true" />Scramble</button>
            <button className="btn btn--ghost btn--sm" onClick={doReset}><ArrowCounterClockwise aria-hidden="true" />Reset</button>
          </div>
          {scramble && <p className="scramble-line"><span>Scramble</span> <code className="mono">{scramble}</code></p>}
          <form className="try" onSubmit={applyTyped}>
            <label htmlFor="scr">Or type a scramble in notation</label>
            <div className="try__row">
              <input id="scr" className="filter-input mono" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="R U R' U' F2 L D2 …" />
              <button className="btn btn--sm">Apply</button>
            </div>
            {typeErr && <span className="note note--warn">{typeErr}</span>}
          </form>
          {result?.error && <p className="note note--warn">{result.error}</p>}
        </div>

        <div className="solve__out">
          {!result?.stages && !solving && (
            <div className="solve__hint">
              <p>The solution follows CFOP: a white <b>Cross</b>, then the <b>F2L</b> pairs, then <b>OLL</b> and <b>PLL</b> from this site's own algorithm sets — each last-layer stage links to its lesson.</p>
              <p className="hint">Cross and F2L are found by a computer search, so they are short but may not match a hand-learned solution.</p>
            </div>
          )}
          {result?.stages && (
            <>
              <div className="solve__summary">
                <b>{result.moveCount}</b> moves · {result.stages.length} stages
              </div>
              <div className="solve__player">
                <CubePlayer key={result.alg} alg={result.alg} setup={scrambleSetup} anchor="start" showFingers
                  phases={result.stages.map((s) => ({ label: s.caseId ? `${s.stage} · ${s.caseName}` : s.stage, len: s.moves.length }))} />
              </div>
              <ol className="stages">
                {result.stages.map((s, i) => (
                  <li key={i} className="stage">
                    <div className="stage__head">
                      <span className="stage__name">{s.stage}</span>
                      {s.caseId
                        ? <Link to={`/case/${s.caseId}`} state={{ from: "/solve" }} className="stage__case">{s.caseName}<CaretRight aria-hidden="true" /></Link>
                        : s.caseName && <span className="stage__case stage__case--muted">{s.caseName}</span>}
                    </div>
                    <p className="stage__desc">{PHASE_INFO[s.stage.split(" ")[0]]}</p>
                    <div className="stage__moves">
                      {s.moves.length
                        ? s.moves.map((m, j) => <span key={j} className="stage__move">{m}</span>)
                        : <span className="stage__move stage__move--none" aria-hidden="true">—</span>}
                      {s.moves.length > 0 && <span className="stage__count">{s.moves.length} {s.moves.length === 1 ? "move" : "moves"}</span>}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
