import { HashRouter, Routes, Route, NavLink, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Theme } from "@astryxdesign/core/theme";
import { LinkProvider } from "@astryxdesign/core/Link";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { themes, defaultThemeSlug } from "./astryx-themes.js";
import { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, List, X } from "@phosphor-icons/react";
import { SETS } from "./data/sets.js";
import Home from "./pages/Home.jsx";
import Notation from "./pages/Notation.jsx";
import Cross from "./pages/Cross.jsx";
import AlgSet from "./pages/AlgSet.jsx";
import Search from "./pages/Search.jsx";
import CasePage from "./pages/CasePage.jsx";
import Solve from "./pages/Solve.jsx";
import CubeTimer from "./pages/CubeTimer.jsx";

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
      <Icon icon={MagnifyingGlass} size="sm" aria-hidden="true" />
      <input ref={ref} value={q} onChange={(e) => go(e.target.value)} placeholder="Search cases or algs" aria-label="Search all algorithms" />
      <kbd>/</kbd>
    </label>
  );
}

function Shell() {
  const loc = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); setNavOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setNavOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navOpen]);
  const steps = [
    { path: "/notation", title: "Notation", sub: "Moves & finger tricks" },
    { path: "/cross", title: "Cross", sub: "Build the white cross" },
    ...SETS.map((s) => ({ path: s.path, title: s.title, sub: s.subtitle })),
    { path: "/solve", title: "Solve", sub: "Paint & solve a cube" },
    { path: "/timer", title: "Timer", sub: "Time your solves" },
  ];
  return (
    <VStack className="shell">
      <VStack as="aside" id="sidebar" className={`side ${navOpen ? "side--open" : ""}`}>
        <HStack className="side__top">
          <NavLink to="/" className="brand" end>
            <img src="favicon.svg" alt="" width="28" height="28" />
            <Text as="span">Layer by Layer</Text>
          </NavLink>
          <button className="side__close" onClick={() => setNavOpen(false)} aria-label="Close menu">
            <Icon icon={X} size="sm" aria-hidden="true" />
          </button>
        </HStack>
        <nav className="path" aria-label="Learning path">
          {steps.map((s, i) => (
            <NavLink key={s.path} to={s.path} className="path__item">
              <Text as="span" className="path__num">{i + 1}</Text>
              <Text as="span" className="path__text"><b>{s.title}</b><small>{s.sub}</small></Text>
            </NavLink>
          ))}
        </nav>
      </VStack>
      {navOpen && <VStack className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}
      <VStack className="main">
        <header className="top">
          <button className="hamburger" onClick={() => setNavOpen(true)} aria-label="Open menu" aria-expanded={navOpen} aria-controls="sidebar">
            <Icon icon={List} size="sm" aria-hidden="true" />
          </button>
          <SearchBox />
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notation" element={<Notation />} />
            <Route path="/cross" element={<Cross />} />
            {SETS.map((s) => <Route key={s.id} path={s.path} element={<AlgSet set={s} />} />)}
            <Route path="/solve" element={<Solve />} />
            <Route path="/timer" element={<CubeTimer />} />
            <Route path="/search" element={<Search />} />
            <Route path="/case/:id" element={<CasePage />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </VStack>
    </VStack>
  );
}

export default function App() {
  return (
    <Theme theme={themes[defaultThemeSlug]}>
      <LinkProvider component={Link}>
        <HashRouter><Shell /></HashRouter>
      </LinkProvider>
    </Theme>
  );
}
