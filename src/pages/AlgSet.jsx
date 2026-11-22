import { useMemo, useState } from "react";
import { matchCase } from "../lib/search.js";
import { useProgress } from "../lib/progress.js";
import CaseGrid from "../components/CaseGrid.jsx";

const STATUS = [["all", "All"], ["new", "Not started"], ["learning", "Learning"], ["learned", "Learned"]];

export default function AlgSet({ set }) {
  const [group, setGroup] = useState("all");
  const [status, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const progress = useProgress();
  const cases = useMemo(() => set.cases.map((c) => ({ ...c, set })), [set]);
  const filtered = cases.filter((c) =>
    (group === "all" || c.group === group) &&
    (status === "all" || (status === "new" ? !progress[c.id] : progress[c.id] === status)) &&
    matchCase(c, q));
  const groups = set.groups.filter((g) => group === "all" || g === group);
  const learned = cases.filter((c) => progress[c.id] === "learned").length;
  return (
    <div>
      <div className="set-head">
        <div>
          <h1 className="page-title">{set.title} <small>{set.subtitle}</small></h1>
          <p className="lede">{set.intro}</p>
        </div>
        <div className="set-stats"><b>{learned}</b><span>of {cases.length} learned</span></div>
      </div>
      <div className="filters">
        <input className="filter-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${set.title}`} aria-label={`Filter ${set.title} cases`} />
        <div className="chips" role="group" aria-label="Category">
          <button className={`chip ${group === "all" ? "chip--on" : ""}`} onClick={() => setGroup("all")}>All <span>{cases.length}</span></button>
          {set.groups.map((g) => (
            <button key={g} className={`chip ${group === g ? "chip--on" : ""}`} onClick={() => setGroup(g)}>{g} <span>{cases.filter((c) => c.group === g).length}</span></button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Progress">
          {STATUS.map(([k, label]) => <button key={k} className={`chip chip--sm ${status === k ? "chip--on" : ""}`} onClick={() => setStatusFilter(k)}>{label}</button>)}
        </div>
      </div>
      {filtered.length === 0 && <CaseGrid cases={[]} />}
      {groups.map((g) => {
        const list = filtered.filter((c) => c.group === g);
        if (!list.length) return null;
        return (
          <section key={g} className="group">
            <h2 className="group__title">{g} <span>{list.length}</span></h2>
            <CaseGrid cases={list} />
          </section>
        );
      })}
    </div>
  );
}
