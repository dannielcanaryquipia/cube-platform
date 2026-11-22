import CaseCard from "./CaseCard.jsx";
import { useProgress } from "../lib/progress.js";

export default function CaseGrid({ cases }) {
  const progress = useProgress();
  if (!cases.length) return <p className="empty">No cases match. Try a case name like "T perm", a shape like "fish", or part of an alg like "R U R'".</p>;
  return <div className="grid">{cases.map((c) => <CaseCard key={c.id} c={c} status={progress[c.id]} />)}</div>;
}
