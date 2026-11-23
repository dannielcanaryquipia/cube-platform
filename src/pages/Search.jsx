import { VStack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
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
    <VStack gap={4}>
      <VStack gap={2}>
        <Heading level={1}>{q ? <>Results for “{q}”</> : "All algorithms"}</Heading>
        <Text type="body" color="secondary">{total} case{total === 1 ? "" : "s"}. Search by name (OLL 27, Jb), shape (fish, headlights), group (corner in slot) or alg text (R U R' U').</Text>
      </VStack>
      {results.length === 0 && <CaseGrid cases={[]} />}
      {results.map(({ s, cases }) => (
        <VStack key={s.id} gap={2}>
          <Heading level={2}>{s.title} <Text as="span" color="secondary">{cases.length}</Text></Heading>
          <CaseGrid cases={cases} />
        </VStack>
      ))}
    </VStack>
  );
}
