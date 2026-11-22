import { Link } from "react-router-dom";
import { SETS } from "../data/sets.js";
import { useProgress } from "../lib/progress.js";
import CaseImage from "../components/CaseImage.jsx";
import { NOTATION } from "../data/notation.js";

export default function Home() {
  const progress = useProgress();
  const showcase = { f2l: "f2l-8", "advanced-f2l": "af2l-br-3", oll: "oll-27", pll: "pll-t" };
  return (
    <div className="home">
      <section className="hero">
        <h1>Learn CFOP on the 3x3, one layer at a time.</h1>
        <p>Start with how to read moves, then work through F2L, OLL and PLL. Every case has a diagram you can recognise at a glance and a 3D cube that shows the algorithm move by move.</p>
        <Link to="/notation" className="btn">Start with notation</Link>
      </section>
      <ol className="steps">
        <li className="step">
          <Link to="/notation" className="step__link">
            <span className="step__num">1</span>
            <div className="step__text"><h2>Notation</h2><p>R, R', R2, wide moves, M E S slices and x y z rotations, with the finger trick for each.</p></div>
            <span className="step__meta">{NOTATION.reduce((n, s) => n + s.moves.length, 0)} moves</span>
          </Link>
        </li>
        {SETS.map((s, i) => {
          const learned = s.cases.filter((c) => progress[c.id] === "learned").length;
          const ex = s.cases.find((c) => c.id === showcase[s.id]) || s.cases[0];
          return (
            <li className="step" key={s.id}>
              <Link to={s.path} className="step__link">
                <span className="step__num">{i + 2}</span>
                <div className="step__text">
                  <h2>{s.title} <small>{s.subtitle}</small></h2>
                  <p>{s.intro}</p>
                  <div className="bar" aria-label={`${learned} of ${s.cases.length} learned`}><span style={{ width: `${(100 * learned) / s.cases.length}%` }} /></div>
                </div>
                <div className="step__img"><CaseImage alg={ex.alg} view={s.view} slot={ex.slot} /></div>
                <span className="step__meta">{learned}/{s.cases.length} learned</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
