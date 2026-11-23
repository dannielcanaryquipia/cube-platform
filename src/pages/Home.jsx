import { Link } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { Icon } from "@astryxdesign/core/Icon";
import { ArrowRight } from "@phosphor-icons/react";
import { SETS } from "../data/sets.js";
import { useProgress } from "../lib/progress.js";
import CaseImage from "../components/CaseImage.jsx";
import { NOTATION } from "../data/notation.js";

export default function Home() {
  const progress = useProgress();
  const showcase = { f2l: "f2l-8", "advanced-f2l": "af2l-br-3", oll: "oll-27", pll: "pll-t" };

  const steps = [
    {
      n: 1,
      title: "Notation",
      sub: "Moves & finger tricks",
      intro: "R, R', R2, wide moves, M E S slices and x y z rotations, with the finger trick for each.",
      path: "/notation",
      meta: `${NOTATION.reduce((n, s) => n + s.moves.length, 0)} moves`,
      learned: null,
      total: null,
    },
    ...SETS.map((s, i) => {
      const learned = s.cases.filter((c) => progress[c.id] === "learned").length;
      const ex = s.cases.find((c) => c.id === showcase[s.id]) || s.cases[0];
      return {
        n: i + 2,
        title: s.title,
        sub: s.subtitle,
        intro: s.intro,
        path: s.path,
        meta: `${learned}/${s.cases.length} learned`,
        learned,
        total: s.cases.length,
        ex,
        view: s.view,
      };
    }),
  ];

  return (
    <VStack gap={6}>
      <VStack gap={3}>
        <Heading level={1}>Learn CFOP on the 3x3, one layer at a time.</Heading>
        <Text type="body" color="secondary">
          Start with how to read moves, then work through F2L, OLL and PLL. Every case has a diagram you can recognise at a glance and a 3D cube that shows the algorithm move by move.
        </Text>
        <Button label="Start with notation" variant="primary" endContent={<Icon icon={ArrowRight} size="sm" />} href="/notation" as={Link} width="fit-content" />
      </VStack>
      <VStack gap={3}>
        {steps.map((st) => (
          <Card key={st.path} elevation="low">
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <Text weight="bold">{st.n}. {st.title}</Text>
                <Text type="supporting" color="secondary">{st.sub}</Text>
              </HStack>
              <Text type="body" color="secondary">{st.intro}</Text>
              {st.total != null && (
                <ProgressBar label={`${st.learned} of ${st.total} learned`} value={(100 * st.learned) / st.total} hasValueLabel />
              )}
              <HStack gap={2} vAlign="center" hAlign="between">
                <HStack gap={2} vAlign="center">
                  {st.ex && <VStack width={72}><CaseImage alg={st.ex.alg} view={st.view} slot={st.ex.slot} /></VStack>}
                  <Text type="supporting" color="secondary">{st.meta}</Text>
                </HStack>
                <Button label="Open" variant="secondary" size="sm" href={st.path} as={Link} />
              </HStack>
            </VStack>
          </Card>
        ))}
      </VStack>
    </VStack>
  );
}
