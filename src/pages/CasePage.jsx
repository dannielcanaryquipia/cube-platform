import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { Icon } from "@astryxdesign/core/Icon";
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
  if (id !== seenId) { setSeenId(id); setSel(0); }
  const c = findCase(id);
  if (!c) return <Text type="body" color="secondary">That case doesn't exist. <Link to="/">Back to the start</Link></Text>;
  const algs = algsOf(c);
  const current = algs[Math.min(sel, algs.length - 1)];
  const list = c.set.cases;
  const i = list.findIndex((x) => x.id === c.id);
  const prev = list[i - 1], next = list[i + 1];
  const from = loc.state?.from || c.set.path;
  const status = progress[c.id];
  return (
    <VStack className="case">
      <HStack gap={4} hAlign="between" vAlign="center" className="case__nav">
        <Link to={from} className="back"><Icon icon={ArrowLeft} size="sm" aria-hidden="true" />{from.startsWith("/search") ? "Search results" : c.set.title}</Link>
        <HStack gap={4} className="case__pn">
          {prev ? <Link to={`/case/${prev.id}`} state={loc.state}><Icon icon={CaretLeft} size="sm" aria-hidden="true" />{prev.name}</Link> : <Text as="span" />}
          {next ? <Link to={`/case/${next.id}`} state={loc.state}>{next.name}<Icon icon={CaretRight} size="sm" aria-hidden="true" /></Link> : <Text as="span" />}
        </HStack>
      </HStack>
      <VStack className="case__grid">
        <VStack className="case__info">
          <Text type="supporting" color="accent">{c.set.title} · {c.group}</Text>
          <Heading level={1}>{c.name}</Heading>
          {algs.length > 1 && <Text type="supporting" color="secondary">{algs.length} algorithms available — pick one below</Text>}
          <VStack className="case__img"><CaseImage alg={c.alg} view={c.set.view} slot={c.slot} /></VStack>
          <Text type="supporting" color="secondary">{c.set.title} recognition pattern</Text>

          {algs.length > 1 ? (
            <VStack className="algs" role="listbox" aria-label="Algorithms — pick one to watch">
              {algs.map((a, idx) => (
                <Button key={idx} label={`${a.label}: ${a.alg}`} variant={idx === sel ? "primary" : "secondary"} size="sm"
                  onClick={() => setSel(idx)} />
              ))}
            </VStack>
          ) : (
            <code className="alg alg--big">{current.alg}</code>
          )}

          {(current.label === "Left hand" || current.label === "Left hand mirror") && <Text type="body" color="secondary">The left-hand mirror — solves the same case with L and U instead of R and U.</Text>}
          {c.generated && <Text type="body" color="secondary">Found by a computer search for a short R, U and F solution. It works, but a hand-picked alg may feel better.</Text>}
          {c.basedOn && <Text type="body" color="secondary">Mirror of <Link to={`/case/${c.basedOn}`}>{c.basedOn.replace("f2l-", "F2L ")}</Link> for the {c.group.toLowerCase()}.</Text>}

          <HStack gap={1.5} wrap="wrap" className="status chips--scroll" role="group" aria-label="Your progress">
            {[["", "Not started"], ["learning", "Learning"], ["learned", "Learned"]].map(([k, label]) => (
              <Button key={label} label={label} variant={(status || "") === k ? "primary" : "secondary"} size="sm" onClick={() => setStatus(c.id, k || undefined)} />
            ))}
          </HStack>
          <Text type="supporting" color="secondary">Space plays or pauses. Arrow keys step one move. Click any move to jump to it.</Text>
        </VStack>

        <VStack className="case__player">
          <CubePlayer key={c.id + sel} alg={current.alg} stickering={c.set.stickering} anchor="end" slot={c.slot}
            showFingers phases={[{ label: c.set.title, len: 999 }]} />
        </VStack>
      </VStack>
    </VStack>
  );
}
