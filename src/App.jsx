import { HashRouter, Routes, Route, NavLink, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { SETS } from "./data/sets.js";
import Home from "./pages/Home.jsx";
import Notation from "./pages/Notation.jsx";
import AlgSet from "./pages/AlgSet.jsx";
import Search from "./pages/Search.jsx";
import CasePage from "./pages/CasePage.jsx";

function SearchBox() {
  const nav = useNavigate();
  const loc = useLocation();
  const [params] = useSearchParams();
  const [q, setQ] = useState(loc.pathname === "/search" ? params.get("q") || "" : "");
  const ref = useRef(null);
  useEffect(() => { if (loc.pathname !== "/search") setQ(""); }, [loc.pathname]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "/" && !e.target.closest("input, textarea")) { e.preventDefault(); ref.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const go = (v) => { setQ(v); nav(v ? `/search?q=${encodeURIComponent(v)}` : "/search", { replace: loc.pathname === "/search" }); };
  return (
    <label className="search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
      <input ref={ref} value={q} onChange={(e) => go(e.target.value)} placeholder="Search cases or algs" aria-label="Search all algorithms" />
      <kbd>/</kbd>
    </label>
  );
}

function Shell() {
  const loc = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  const steps = [{ path: "/notation", title: "Notation", sub: "Moves & finger tricks" }, ...SETS.map((s) => ({ path: s.path, title: s.title, sub: s.subtitle }))];
  return (
    <div className="shell">
      <aside className="side">
        <NavLink to="/" className="brand" end>
          <img src="favicon.svg" alt="" width="28" height="28" />
          <span>Layer by Layer</span>
        </NavLink>
        <nav className="path" aria-label="Learning path">
          {steps.map((s, i) => (
            <NavLink key={s.path} to={s.path} className="path__item">
              <span className="path__num">{i + 1}</span>
              <span className="path__text"><b>{s.title}</b><small>{s.sub}</small></span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main">
        <header className="top"><SearchBox /></header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notation" element={<Notation />} />
            {SETS.map((s) => <Route key={s.id} path={s.path} element={<AlgSet set={s} />} />)}
            <Route path="/search" element={<Search />} />
            <Route path="/case/:id" element={<CasePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return <HashRouter><Shell /></HashRouter>;
}
