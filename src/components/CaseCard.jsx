import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { ClickableCard } from "@astryxdesign/core/ClickableCard";
import CaseImage from "./CaseImage.jsx";

export default function CaseCard({ c, status }) {
  return (
    <ClickableCard label={`${c.name}: ${c.alg}`} elevation="low" padding={0} className="card"
      href={`/case/${c.id}`}>
      <VStack className="card__img"><CaseImage alg={c.alg} view={c.set.view} slot={c.slot} /></VStack>
      <VStack className="card__title">
        <Text as="span">{c.name}</Text>
        {status && <Text as="span" className={`dot dot--${status}`} title={status === "learned" ? "Learned" : "Learning"} />}
      </VStack>
      <VStack className="card__meta">
        <code className="alg">{c.alg}</code>
        {c.algs?.length > 1 && <Text as="span" type="supporting" color="secondary">{c.algs.length} algs</Text>}
      </VStack>
    </ClickableCard>
  );
}
