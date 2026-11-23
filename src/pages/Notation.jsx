import { useState } from "react";
import { Link } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { ArrowRight } from "@phosphor-icons/react";
import { Icon } from "@astryxdesign/core/Icon";
import { NOTATION, TIPS } from "../data/notation.js";
import CubePlayer from "../components/CubePlayer.jsx";

export default function Notation() {
  const [secId, setSecId] = useState(NOTATION[0].id);
  const [sel, setSel] = useState(NOTATION[0].moves[0]);
  const [custom, setCustom] = useState("R U R' U'");
  const [tried, setTried] = useState(null);
  const active = NOTATION.find((s) => s.id === secId);

  const pickSection = (s) => { setSecId(s.id); setSel(s.moves[0]); setTried(null); };

  return (
    <VStack>
      <Heading level={1}>Notation <Text as="span" color="secondary">Read any algorithm</Text></Heading>
      <Text type="body" color="secondary">Algorithms are a list of moves. Pick a group, then a move to watch it on the cube. Hold the cube with yellow on top and green facing you.</Text>

      <HStack gap={1.5} wrap="wrap" className="chips chips--scroll ntabs" role="tablist" aria-label="Move groups">
        {NOTATION.map((s) => (
          <Button key={s.id} label={s.title} variant={secId === s.id ? "primary" : "secondary"} size="sm" onClick={() => pickSection(s)} />
        ))}
        <Button label="Habits" variant={secId === "habits" ? "primary" : "secondary"} size="sm" onClick={() => setSecId("habits")} />
      </HStack>

      <VStack className="notation">
        <Grid columns={{ minWidth: 280, max: 2 }} gap={3} className="notation__list bento-list">
          {active ? (
            <>
              <GridSpan columns="full">
                <VStack gap={2} className="bento-cell">
                  <Heading level={2}>{active.title}</Heading>
                  <Text type="body" color="secondary">{active.text}</Text>
                  <Grid columns={{ minWidth: 150, max: 4 }} gap={2}>
                    {active.moves.map((mv) => (
                      <button key={mv.m} className={`mtile ${sel.m === mv.m && !tried ? "mtile--on" : ""}`}
                        onClick={() => { setSel(mv); setTried(null); }}>
                        <span className="mtile__m">{mv.m}</span>
                        <span className="mtile__d">{mv.d}</span>
                      </button>
                    ))}
                  </Grid>
                </VStack>
              </GridSpan>
              <GridSpan columns="full">
                <VStack gap={2} className="bento-cell">
                  <Heading level={2}>Quick tips</Heading>
                  <Grid columns={{ minWidth: 220, max: 3 }} gap={2}>{TIPS.map((t) => <VStack key={t.t} gap={1}><Text weight="bold">{t.t}</Text><Text type="body" color="secondary">{t.d}</Text></VStack>)}</Grid>
                </VStack>
              </GridSpan>
            </>
          ) : (
            <GridSpan columns="full">
              <VStack gap={2} className="bento-cell">
                <Heading level={2}>Habits worth building</Heading>
                <Grid columns={{ minWidth: 220, max: 3 }} gap={2}>{TIPS.map((t) => <VStack key={t.t} gap={1} className="tip"><Text weight="bold">{t.t}</Text><Text type="body" color="secondary">{t.d}</Text></VStack>)}</Grid>
              </VStack>
            </GridSpan>
          )}
          <GridSpan columns="full">
            <VStack className="bento-cell" gap={1}>
              <Text type="body" color="secondary" className="next-link">Ready? <Link to="/cross">Go on to the Cross <Icon icon={ArrowRight} size="sm" weight="bold" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "-0.15em" }} /></Link></Text>
            </VStack>
          </GridSpan>
        </Grid>
        <VStack as="aside" className="notation__player">
          <VStack className="sticky">
            <VStack gap={1}>
              <Text weight="bold" size="xl">{tried ? "Your alg" : sel.m}</Text>
              <Text type="body" color="secondary">{tried ? tried : sel.d}</Text>
            </VStack>
            <CubePlayer key={tried || sel.m} alg={tried || sel.m} anchor="start" autoLoop compact showFingers />
            {!tried && sel.trick && <Text type="body">Finger trick: {sel.trick}</Text>}
            <VStack gap={2}>
              <TextInput label="Try your own moves" value={custom} onChange={(v) => setCustom(v)} />
              <Button label="Play" variant="primary" size="sm" onClick={() => { if (custom.trim()) setTried(custom.trim()); }} />
            </VStack>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
}
