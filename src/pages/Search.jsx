import { useSearchParams } from "react-router-dom";
import { SETS } from "../data/sets.js";
import { matchCase } from "../lib/search.js";
import CaseGrid from "../components/CaseGrid.jsx";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const results = SETS.map((s) => ({ s, cases: s.cases.map((c) => ({ ...c, set: s })).filter((c) => matchCase(c, q)) })).filter((r) => r.cases.length);
  const total = results.reduce((n, r) => n + r.cases.length, 0);
  return (
    <div>
      <h1 className="page-title">{q ? <>Results for “{q}”</> : "All algorithms"}</h1>
      <p className="lede">{total} case{total === 1 ? "" : "s"}. Search by name (OLL 27, Jb), shape (fish, headlights), group (corner in slot) or alg text (R U R' U').</p>
      {results.length === 0 && <CaseGrid cases={[]} />}
      {results.map(({ s, cases }) => (
        <section key={s.id} className="group">
          <h2 className="group__title">{s.title} <span>{cases.length}</span></h2>
          <CaseGrid cases={cases} />
        </section>
      ))}
    </div>
  );
}
