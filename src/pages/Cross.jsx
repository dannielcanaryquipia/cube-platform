import { useState } from "react";
import { Link } from "react-router-dom";
import { VStack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Grid } from "@astryxdesign/core/Grid";
import { GridSpan } from "@astryxdesign/core/Grid";
import { Text } from "@astryxdesign/core/Text";
import { Heading } from "@astryxdesign/core/Heading";
import { Button } from "@astryxdesign/core/Button";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Icon } from "@astryxdesign/core/Icon";
import { Shuffle, ArrowRight } from "@phosphor-icons/react";
import { solved, applyMoves, parseAlg, movesToString } from "../lib/cube.js";
import { solveCross } from "../lib/solve.js";
import CubePlayer from "../components/CubePlayer.jsx";

const EXAMPLES = [
  { scramble: "B' R' U F2 R D2 L' U R D B' R D2 B' D' L' F' L F' R", cross: "U R B2 D R F D" },
  { scramble: "L' U R' U2 L' R D2 B' F2 D' F' U' D' F2 D' F R' D R D'", cross: "D2 B D R' F' D" },
  { scramble: "F U R2 B2 R D2 F U' L2 B F2 U' R2 L' B' L' D2 F' R L'", cross: "D2 L' B2 D' F' L'" },
];

const FACES = ["U", "D", "L", "R", "F", "B"];
function randomScramble() {
  const moves = [];
  let last = "";
  for (let i = 0; i < 20; i++) {
    let f; do { f = FACES[(Math.random() * 6) | 0]; } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return movesToString(moves);
}

const STEPS = [
  ["Find the four white edges", "They are the pieces with a white sticker and one other colour — white-green, white-red, white-blue and white-orange. The four white corners come later, in F2L."],
  ["Work on the bottom", "Keep white on the bottom the whole time. You can see the other edges forming and you avoid solving the cross on top and flipping the cube, which wastes moves."],
  ["Match every edge to its centre", "Each white edge belongs between the white centre and its own colour's centre: the white-green edge sits under the green centre, the white-red edge under the red centre, and so on."],
  ["Insert in as few moves as you can", "Bring an edge to the top, turn U until it is above its slot, then turn that face twice (F2, R2 …) to drop it straight down. If the white sticker faces the side, do one setup turn first so white ends on the bottom."],
  ["Plan during inspection", "In a real solve you get 15 seconds to look before you start. Find all four white edges and plan the whole cross, then solve it in one smooth sequence without stopping to think."],
];

const TIPS = [
  { t: "Stay on the bottom", d: "Solving white on top and flipping at the end doubles your work. Keep white down and build underneath." },
  { t: "Aim for eight moves or fewer", d: "A good cross is short. Count your moves and look for an order that solves two edges at once." },
  { t: "The side colour must match", d: "An edge in the right slot but turned the wrong way is not solved — its side sticker has to line up with the centre next to it." },
  { t: "Look ahead to F2L", d: "While you finish the last cross edge, spot a corner-edge pair so you can flow straight into F2L without a pause." },
];

export default function Cross() {
  const [cur, setCur] = useState({ ...EXAMPLES[0], title: "Worked example 1" });
  const [typed, setTyped] = useState("");
  const [err, setErr] = useState("");

  const fromScramble = (scramble, title) => setCur({ scramble, cross: solveCross(applyMoves(solved(), parseAlg(scramble))), title });
  const applyTyped = (e) => {
    e.preventDefault();
    const moves = parseAlg(typed);
    if (!moves.length) { setErr("Enter moves like R U R' U2 F"); return; }
    setErr(""); fromScramble(movesToString(moves), "Your scramble");
  };
  const crossLen = parseAlg(cur.cross).length;
  return (
    <VStack>
      <Heading level={1}>Cross <Text as="span" color="secondary">The first step of CFOP</Text></Heading>
      <Text type="body" color="secondary">Before F2L you build a white cross on the bottom: the four white edges, each lined up with its matching centre. It is solved intuitively, not with a memorised algorithm, so the goal is to see it and plan it rather than recall moves.</Text>
      <VStack className="notation">
        <Grid columns={{ minWidth: 260, max: 2 }} gap={3} className="notation__list bento-list">
          <VStack gap={2} className="bento-cell">
            <Heading level={2}>What you are making</Heading>
            <Text type="body" color="secondary">A plus sign of white on the bottom face, where every edge's second colour matches the centre beside it. When it is right, the bottom is a white cross and the four sides each show a short matching stripe.</Text>
          </VStack>
          <VStack gap={2} className="bento-cell">
            <Heading level={2}>How to build it</Heading>
            <VStack gap={1}>
              {STEPS.map(([t, d]) => <Text key={t} type="body"><Text weight="bold">{t}.</Text> {d}</Text>)}
            </VStack>
          </VStack>
          <GridSpan columns="full">
            <VStack gap={2} className="bento-cell">
              <Heading level={2}>Habits for a fast cross</Heading>
              <Grid columns={{ minWidth: 220, max: 2 }} gap={3}>{TIPS.map((t) => <VStack key={t.t} gap={1}><Text weight="bold">{t.t}</Text><Text type="body" color="secondary">{t.d}</Text></VStack>)}</Grid>
              <Text type="body" color="secondary">Cross done? <Link to="/f2l">Go on to F2L <Icon icon={ArrowRight} size="sm" weight="bold" aria-hidden="true" style={{ display: "inline-block", verticalAlign: "-0.15em" }} /></Link></Text>
            </VStack>
          </GridSpan>
        </Grid>
        <VStack as="aside" className="notation__player">
          <VStack className="sticky">
            <VStack className="now">
              <Text as="span" className="now__m">{cur.title}</Text>
              <Text as="span" className="now__d">a {crossLen}-move cross from a full scramble</Text>
            </VStack>
            <CubePlayer key={cur.scramble + cur.cross} alg={cur.cross} setup={cur.scramble} anchor="start"
              showFingers phases={[{ label: "Cross", len: 999 }]} />
            <HStack gap={2} wrap="wrap">
              {EXAMPLES.map((e, i) => (
                <Button key={i} label={`Example ${i + 1}`} variant={cur.scramble === e.scramble ? "primary" : "secondary"} size="sm"
                  onClick={() => setCur({ ...e, title: `Worked example ${i + 1}` })} />
              ))}
              <Button label="Scramble" variant="secondary" size="sm" icon={<Icon icon={Shuffle} size="sm" />} onClick={() => fromScramble(randomScramble(), "Your scramble")} />
            </HStack>
            <VStack gap={2}>
              <TextInput label="Or type a scramble" value={typed} onChange={(v) => setTyped(v)} placeholder="R U R' U' F2 L …" />
              <Button label="Apply" variant="primary" size="sm" type="submit" onClick={applyTyped} />
            </VStack>
            {err && <Text type="body" color="secondary">{err}</Text>}
            <Text type="body">Scramble: {cur.scramble}</Text>
            <Text type="body">Cross solution: {cur.cross}</Text>
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  );
}
