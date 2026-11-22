import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { NOTATION, TIPS } from "../data/notation.js";
import CubePlayer from "../components/CubePlayer.jsx";

export default function Notation() {
  const [secId, setSecId] = useState(NOTATION[0].id);
  const [sel, setSel] = useState(NOTATION[0].moves[0]);
  const [custom, setCustom] = useState("R U R' U'");
  const [tried, setTried] = useState(null);
  const active = NOTATION.find((s) => s.id === secId);

  const pickSection = (s) => { setSecId(s.id); setSel(s.moves[0]); setTried(null); };

  return (
    <div>
      <h1 className="page-title">Notation <small>Read any algorithm</small></h1>
      <p className="lede">Algorithms are a list of moves. Pick a group, then a move to watch it on the cube. Hold the cube with yellow on top and green facing you.</p>

      <div className="chips chips--scroll ntabs" role="tablist" aria-label="Move groups">
        {NOTATION.map((s) => (
          <button key={s.id} role="tab" aria-selected={secId === s.id}
            className={`chip ${secId === s.id ? "chip--on" : ""}`} onClick={() => pickSection(s)}>{s.title}</button>
        ))}
        <button role="tab" aria-selected={secId === "habits"}
          className={`chip ${secId === "habits" ? "chip--on" : ""}`} onClick={() => setSecId("habits")}>Habits</button>
      </div>

      <div className="notation">
        <div className="notation__list">
          {active ? (
            <section className="nsec">
              <h2>{active.title}</h2>
              <p>{active.text}</p>
              <div className="mgrid">
                {active.moves.map((mv) => (
                  <button key={mv.m} className={`mtile ${sel.m === mv.m && !tried ? "mtile--on" : ""}`} onClick={() => { setSel(mv); setTried(null); }}>
                    <span className="mtile__m">{mv.m}</span>
                    <span className="mtile__d">{mv.d}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="nsec">
              <h2>Habits worth building</h2>
              <div className="tips">{TIPS.map((t) => <div key={t.t} className="tip"><b>{t.t}</b><p>{t.d}</p></div>)}</div>
            </section>
          )}
          <p className="next-link">Ready? <Link to="/cross">Go on to the Cross <ArrowRight weight="bold" aria-hidden="true" /></Link></p>
        </div>
        <aside className="notation__player">
          <div className="sticky">
            <div className="now">
              <span className="now__m">{tried ? "Your alg" : sel.m}</span>
              <span className="now__d">{tried ? tried : sel.d}</span>
            </div>
            <CubePlayer key={tried || sel.m} alg={tried || sel.m} anchor="start" autoLoop compact showFingers />
            {!tried && sel.trick && <p className="trick"><b>Finger trick</b> {sel.trick}</p>}
            <form className="try" onSubmit={(e) => { e.preventDefault(); if (custom.trim()) setTried(custom.trim()); }}>
              <label htmlFor="try">Try your own moves</label>
              <div className="try__row">
                <input id="try" className="filter-input mono" value={custom} onChange={(e) => setCustom(e.target.value)} />
                <button className="btn btn--sm">Play</button>
              </div>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
