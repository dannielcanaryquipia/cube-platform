import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import { Star } from "@phosphor-icons/react";
import { useStars } from "../lib/stars.js";
import CaseImage from "./CaseImage.jsx";

export default function CaseCard({ c, status }) {
  const stars = useStars();
  const starred = !!stars[c.id];
  return (
    <ClickableCard label={`${c.name}: ${c.alg}${starred ? " (starred)" : ""}`} elevation="low" padding={0} className="card"
      href={`/case/${c.id}`}>
      <VStack className="card__img"><CaseImage alg={c.alg} view={c.set.view} slot={c.slot} /></VStack>
      <HStack gap={1.5} hAlign="between" vAlign="center" className="card__title">
        <Text as="span">{c.name}</Text>
        <HStack gap={1} vAlign="center">
          {starred && <Icon icon={Star} size="sm" weight="fill" className="card__star" aria-label="Starred" />}
          {status && <Text as="span" className={`dot dot--${status}`} title={status === "learned" ? "Learned" : "Learning"} />}
        </HStack>
      </HStack>
      <VStack className="card__meta">
        <code className="alg">{c.alg}</code>
        {c.algs?.length > 1 && <Text as="span" type="supporting" color="secondary">{c.algs.length} algs</Text>}
      </VStack>
    </ClickableCard>
  );
}
