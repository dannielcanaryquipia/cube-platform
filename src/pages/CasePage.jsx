import { Link, useLocation, useParams } from "react-router-dom";
import { findCase } from "../data/sets.js";
import { setStatus, useProgress } from "../lib/progress.js";
import CaseImage from "../components/CaseImage.jsx";
import CubePlayer from "../components/CubePlayer.jsx";

export default function CasePage() {
  const { id } = useParams();
  const loc = useLocation();
  const progress = useProgress();
  const c = findCase(id);
  if (!c) return <p className="empty">That case doesn't exist. <Link to="/">Back to the start</Link></p>;
  const list = c.set.cases;
  const i = list.findIndex((x) => x.id === c.id);
  const prev = list[i - 1], next = list[i + 1];
  const from = loc.state?.from || c.set.path;
  const status = progress[c.id];
  return (
    <div className="case">
      <div className="case__nav">
        <Link to={from} className="back">← {from.startsWith("/search") ? "Search results" : c.set.title}</Link>
        <div className="case__pn">
          {prev ? <Link to={`/case/${prev.id}`} state={loc.state}>‹ {prev.name}</Link> : <span />}
          {next ? <Link to={`/case/${next.id}`} state={loc.state}>{next.name} ›</Link> : <span />}
        </div>
      </div>
      <div className="case__grid">
        <div className="case__info">
          <p className="eyebrow">{c.set.title} · {c.group}</p>
          <h1 className="page-title">{c.name}</h1>
          <div className="case__img"><CaseImage alg={c.alg} view={c.set.view} slot={c.slot} /></div>
          <code className="alg alg--big">{c.alg}</code>
          {c.generated && <p className="note">This alg was found by a computer search for the shortest R, U and F solution. It works, but a hand-picked one may feel better.</p>}
          {c.basedOn && <p className="note">Mirror of <Link to={`/case/${c.basedOn}`}>{c.basedOn.replace("f2l-", "F2L ")}</Link> for the {c.group.toLowerCase()}.</p>}
          <div className="status" role="group" aria-label="Your progress">
            {[["", "Not started"], ["learning", "Learning"], ["learned", "Learned"]].map(([k, label]) => (
              <button key={label} className={`chip ${(status || "") === k ? "chip--on" : ""}`} onClick={() => setStatus(c.id, k || undefined)}>{label}</button>
            ))}
          </div>
          <p className="hint">Space plays or pauses. Arrow keys step one move. Click any move to jump to it.</p>
        </div>
        <div className="case__player">
          <CubePlayer key={c.id} alg={c.alg} stickering={c.set.stickering} anchor="end" slot={c.slot} />
        </div>
      </div>
    </div>
  );
}
