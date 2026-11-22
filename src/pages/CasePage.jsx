import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { findCase } from "../data/sets.js";
import { setStatus, useProgress } from "../lib/progress.js";
import CaseImage from "../components/CaseImage.jsx";
import CubePlayer from "../components/CubePlayer.jsx";

function algsOf(c) {
  if (c.algs && c.algs.length) return c.algs;
  const algs = [{ alg: c.alg, label: "Standard" }];
  if (c.alt && c.alt !== c.alg) algs.push({ alg: c.alt, label: "Left hand" });
  return algs;
}

export default function CasePage() {
  const { id } = useParams();
  const loc = useLocation();
  const progress = useProgress();
  const [sel, setSel] = useState(0);
  const [seenId, setSeenId] = useState(id);
  if (id !== seenId) { setSeenId(id); setSel(0); } // reset selection when navigating to another case
  const c = findCase(id);
  if (!c) return <p className="empty">That case doesn't exist. <Link to="/">Back to the start</Link></p>;
  const algs = algsOf(c);
  const current = algs[Math.min(sel, algs.length - 1)];
  const list = c.set.cases;
  const i = list.findIndex((x) => x.id === c.id);
  const prev = list[i - 1], next = list[i + 1];
  const from = loc.state?.from || c.set.path;
  const status = progress[c.id];
  return (
    <div className="case">
      <div className="case__nav">
        <Link to={from} className="back"><ArrowLeft aria-hidden="true" />{from.startsWith("/search") ? "Search results" : c.set.title}</Link>
        <div className="case__pn">
          {prev ? <Link to={`/case/${prev.id}`} state={loc.state}><CaretLeft aria-hidden="true" />{prev.name}</Link> : <span />}
          {next ? <Link to={`/case/${next.id}`} state={loc.state}>{next.name}<CaretRight aria-hidden="true" /></Link> : <span />}
        </div>
      </div>
      <div className="case__grid">
        <div className="case__info">
          <p className="eyebrow">{c.set.title} · {c.group}</p>
          <h1 className="page-title">{c.name}</h1>
          <div className="case__img"><CaseImage alg={c.alg} view={c.set.view} slot={c.slot} /></div>
          <p className="img-cap">{c.set.title} recognition pattern</p>

          {algs.length > 1 ? (
            <div className="algs" role="listbox" aria-label="Algorithms — pick one to watch">
              {algs.map((a, idx) => (
                <button key={idx} role="option" aria-selected={idx === sel}
                  className={`alg-opt ${idx === sel ? "alg-opt--on" : ""}`} onClick={() => setSel(idx)}>
                  <span className="alg-opt__label">{a.label}</span>
                  <code className="alg">{a.alg}</code>
                </button>
              ))}
            </div>
          ) : (
            <code className="alg alg--big">{current.alg}</code>
          )}

          {current.label === "Left hand" && <p className="note">The left-hand mirror — solves the same case with L and U instead of R and U.</p>}
          {c.generated && <p className="note">Found by a computer search for a short R, U and F solution. It works, but a hand-picked alg may feel better.</p>}
          {c.basedOn && <p className="note">Mirror of <Link to={`/case/${c.basedOn}`}>{c.basedOn.replace("f2l-", "F2L ")}</Link> for the {c.group.toLowerCase()}.</p>}

          <div className="status" role="group" aria-label="Your progress">
            {[["", "Not started"], ["learning", "Learning"], ["learned", "Learned"]].map(([k, label]) => (
              <button key={label} className={`chip ${(status || "") === k ? "chip--on" : ""}`} onClick={() => setStatus(c.id, k || undefined)}>{label}</button>
            ))}
          </div>
          <p className="hint">Space plays or pauses. Arrow keys step one move. Click any move to jump to it.</p>
        </div>

        <div className="case__player">
          <CubePlayer key={c.id + sel} alg={current.alg} stickering={c.set.stickering} anchor="end" slot={c.slot}
            showFingers phases={[{ label: c.set.title, len: 999 }]} />
        </div>
      </div>
    </div>
  );
}
