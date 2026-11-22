import { Link, useLocation } from "react-router-dom";
import CaseImage from "./CaseImage.jsx";

export default function CaseCard({ c, status }) {
  const loc = useLocation();
  return (
    <Link to={`/case/${c.id}`} state={{ from: loc.pathname + loc.search }} className="card" aria-label={`${c.name}: ${c.alg}`}>
      <div className="card__img"><CaseImage alg={c.alg} view={c.set.view} slot={c.slot} /></div>
      <div className="card__title">
        <span>{c.name}</span>
        {status && <span className={`dot dot--${status}`} title={status === "learned" ? "Learned" : "Learning"} />}
      </div>
      <code className="alg">{c.alg}</code>
    </Link>
  );
}
