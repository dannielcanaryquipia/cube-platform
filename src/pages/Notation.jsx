import { useState } from "react";
import { Link } from "react-router-dom";
import { NOTATION, TIPS } from "../data/notation.js";
import CubePlayer from "../components/CubePlayer.jsx";

export default function Notation() {
  const [sel, setSel] = useState(NOTATION[0].moves[0]);
  const [custom, setCustom] = useState("R U R' U'");
  const [tried, setTried] = useState(null);
  return (
    <div>
      <h1 className="page-title">Notation <small>Read any algorithm</small></h1>
      <p className="lede">Algorithms are written as a list of moves. Pick a move to watch it on the cube. Hold the cube with yellow on top and green facing you.</p>
      <div className="notation">
        <div className="notation__list">
          {NOTATION.map((sec) => (
            <section key={sec.id} className="nsec">
              <h2>{sec.title}</h2>
              <p>{sec.text}</p>
              <div className="mgrid">
                {sec.moves.map((mv) => (
                  <button key={mv.m} className={`mtile ${sel.m === mv.m && !tried ? "mtile--on" : ""}`} onClick={() => { setSel(mv); setTried(null); }}>
                    <span className="mtile__m">{mv.m}</span>
                    <span className="mtile__d">{mv.d}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          <section className="nsec">
            <h2>Habits worth building</h2>
            <div className="tips">{TIPS.map((t) => <div key={t.t} className="tip"><b>{t.t}</b><p>{t.d}</p></div>)}</div>
            <p className="next-link">Ready? <Link to="/f2l">Go on to F2L →</Link></p>
          </section>
        </div>
        <aside className="notation__player">
          <div className="sticky">
            <div className="now">
              <span className="now__m">{tried ? "Your alg" : sel.m}</span>
              <span className="now__d">{tried ? tried : sel.d}</span>
            </div>
            <CubePlayer key={tried || sel.m} alg={tried || sel.m} anchor="start" autoLoop compact />
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
