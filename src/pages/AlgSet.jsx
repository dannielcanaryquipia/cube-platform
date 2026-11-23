import { useMemo, useState } from "react";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { matchCase } from "../lib/search.js";
import { useProgress } from "../lib/progress.js";
import { useStars } from "../lib/stars.js";
import CaseGrid from "../components/CaseGrid.jsx";

const STATUS = [["all", "All"], ["starred", "Starred"], ["new", "Not started"], ["learning", "Learning"], ["learned", "Learned"]];

export default function AlgSet({ set }) {
  const [group, setGroup] = useState("all");
  const [status, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");
  const progress = useProgress();
  const stars = useStars();
  const cases = useMemo(() => set.cases.map((c) => ({ ...c, set })), [set]);
  const filtered = cases.filter((c) =>
    (group === "all" || c.group === group) &&
    (status === "all" ||
      (status === "new" ? !progress[c.id] :
       status === "starred" ? !!stars[c.id] :
       progress[c.id] === status)) &&
    matchCase(c, q));
  const groups = set.groups.filter((g) => group === "all" || g === group);
  const learned = cases.filter((c) => progress[c.id] === "learned").length;
  const starredCount = cases.filter((c) => !!stars[c.id]).length;
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <Heading level={1}>{set.title} <Text as="span" color="secondary">{set.subtitle}</Text></Heading>
        <Text type="body" color="secondary">{set.intro}</Text>
        <Text type="supporting" color="secondary">{learned} of {cases.length} learned · {starredCount} starred</Text>
      </VStack>
      <VStack gap={3}>
        <TextInput label={`Filter ${set.title}`} value={q} onChange={(v) => setQ(v)} placeholder={`Filter ${set.title}`} />
        <VStack gap={2}>
          <Text type="supporting" color="secondary">Category</Text>
          <HStack gap={2} wrap="wrap" className="chips--scroll">
            <Button label={`All (${cases.length})`} variant={group === "all" ? "primary" : "secondary"} size="sm" onClick={() => setGroup("all")} />
            {set.groups.map((g) => (
              <Button key={g} label={`${g} (${cases.filter((c) => c.group === g).length})`} variant={group === g ? "primary" : "secondary"} size="sm" onClick={() => setGroup(g)} />
            ))}
          </HStack>
        </VStack>
        <VStack gap={2}>
          <Text type="supporting" color="secondary">Show</Text>
          <HStack gap={2} wrap="wrap" className="chips--scroll">
            {STATUS.map(([k, label]) => (
              <Button key={k} label={k === "starred" ? `${label} (${starredCount})` : label} variant={status === k ? "primary" : "secondary"} size="sm" onClick={() => setStatusFilter(k)} />
            ))}
          </HStack>
        </VStack>
      </VStack>
      {filtered.length === 0 && <CaseGrid cases={[]} />}
      {groups.map((g) => {
        const list = filtered.filter((c) => c.group === g);
        if (!list.length) return null;
        return (
          <VStack key={g} gap={2}>
            <Heading level={2}>{g} <Text as="span" color="secondary">{list.length}</Text></Heading>
            <CaseGrid cases={list} />
          </VStack>
        );
      })}
    </VStack>
  );
}
