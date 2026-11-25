import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Bento, BentoCell } from '@/components/bento';
import { CubePlayer } from '@/components/cube-player';
import { Btn, FieldLabel, Hint, Input, PageScroll, Screen, SectionTitle, Wrap } from '@/components/ui';
import { Radius, Rubik, Spacing, Type } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { applyMoves, movesToString, parseAlg, solved } from '@/lib/cube';
import { solveCrossAsync } from '@/lib/solve';

const EXAMPLES = [
  { scramble: "B' R' U F2 R D2 L' U R D B' R D2 B' D' L' F' L F' R", cross: 'U R B2 D R F D' },
  { scramble: "L' U R' U2 L' R D2 B' F2 D' F' U' D' F2 D' F R' D R D'", cross: "D2 B D R' F' D" },
  { scramble: "F U R2 B2 R D2 F U' L2 B F2 U' R2 L' B' L' D2 F' R L'", cross: "D2 L' B2 D' F' L'" },
];

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];

function randomScramble() {
  const moves: { face: string; amount: number }[] = [];
  let last = '';
  for (let i = 0; i < 20; i++) {
    let f = '';
    do { f = FACES[(Math.random() * 6) | 0]; } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return movesToString(moves);
}

const STEPS = [
  ['Find the four white edges', 'They are the pieces with a white sticker and one other colour — white-green, white-red, white-blue and white-orange. The four white corners come later, in F2L.'],
  ['Work on the bottom', 'Keep white on the bottom the whole time. You can see the other edges forming and you avoid solving the cross on top and flipping the cube, which wastes moves.'],
  ['Match every edge to its centre', "Each white edge belongs between the white centre and its own colour's centre: the white-green edge sits under the green centre, the white-red edge under the red centre, and so on."],
  ['Insert in as few moves as you can', 'Bring an edge to the top, turn U until it is above its slot, then turn that face twice (F2, R2 …) to drop it straight down. If the white sticker faces the side, do one setup turn first so white ends on the bottom.'],
  ['Plan during inspection', 'In a real solve you get 15 seconds to look before you start. Find all four white edges and plan the whole cross, then solve it in one smooth sequence without stopping to think.'],
] as const;

const TIPS = [
  { t: 'Stay on the bottom', d: 'Solving white on top and flipping at the end doubles your work. Keep white down and build underneath.' },
  { t: 'Aim for eight moves or fewer', d: 'A good cross is short. Count your moves and look for an order that solves two edges at once.' },
  { t: 'The side colour must match', d: 'An edge in the right slot but turned the wrong way is not solved — its side sticker has to line up with the centre next to it.' },
  { t: 'Look ahead to F2L', d: 'While you finish the last cross edge, spot a corner-edge pair so you can flow straight into F2L without a pause.' },
];

export default function CrossScreen() {
  const c = useTheme();
  const { isWide } = useLayout();
  const [cur, setCur] = useState({ ...EXAMPLES[0], title: 'Worked example 1' });
  const [typed, setTyped] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('');

  const fromScramble = async (scramble: string, title: string) => {
    if (busy) return;
    setBusy(true);
    setErr('');
    setPhase('Preparing solver…');
    try {
      const cross = await solveCrossAsync(applyMoves(solved(), parseAlg(scramble)), setPhase);
      setCur({ scramble, cross, title });
    } catch {
      setErr('Could not solve that scramble. Try another.');
    } finally {
      setBusy(false);
      setPhase('');
    }
  };

  const applyTyped = () => {
    const moves = parseAlg(typed);
    if (!moves.length) {
      setErr("Enter moves like R U R' U2 F");
      return;
    }
    setErr('');
    void fromScramble(movesToString(moves), 'Your scramble');
  };

  const crossLen = parseAlg(cur.cross).length;

  const lesson = (
    <View style={{ gap: Spacing.three, minWidth: 0, flex: 1 }}>
      <BentoCell>
        <SectionTitle title="What you are making" />
        <Text style={[Type.body, { color: c.muted }]}>
          A plus sign of white on the bottom face, where every edge&apos;s second colour matches the centre beside it. When it is right, the bottom is a white cross and the four sides each show a short matching stripe.
        </Text>
      </BentoCell>
      <BentoCell>
        <SectionTitle title="How to build it" />
        <View style={{ gap: Spacing.three }}>
          {STEPS.map(([title, body]) => (
            <Text key={title} style={[Type.body, { color: c.ink }]}>
              <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.ink }]}>{title}. </Text>
              <Text style={[Type.body, { color: c.muted }]}>{body}</Text>
            </Text>
          ))}
        </View>
      </BentoCell>
      <BentoCell>
        <SectionTitle title="Habits for a fast cross" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three }}>
          {TIPS.map((t) => (
            <View key={t.t} style={{ gap: 4, minWidth: 0, flexGrow: 1, flexBasis: 200 }}>
              <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.ink }]}>{t.t}</Text>
              <Text style={[Type.body, { color: c.muted }]}>{t.d}</Text>
            </View>
          ))}
        </View>
        <Link href="/set/f2l" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Go on to F2L"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 4,
              minHeight: 44,
              alignSelf: 'flex-start',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={[Type.body, { color: c.muted }]}>Cross done?</Text>
            <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.accent }]}>Go on to F2L</Text>
            <Ionicons name="arrow-forward" size={16} color={c.accent} />
          </Pressable>
        </Link>
      </BentoCell>
    </View>
  );

  const player = (
    <BentoCell style={{ borderRadius: Radius.lg, gap: Spacing.three }}>
      <View style={{ gap: 2 }}>
        <Text style={[Type.fieldLabel, { color: c.accent }]}>{cur.title}</Text>
        <Text style={[Type.supporting, { color: c.muted }]}>a {crossLen}-move cross from a full scramble</Text>
      </View>
      <CubePlayer
        key={cur.scramble + cur.cross}
        alg={cur.cross}
        setup={cur.scramble}
        anchor="start"
        showFingers
        phases={[{ label: 'Cross', len: 999 }]}
      />
      <Wrap gap={Spacing.two}>
        {EXAMPLES.map((e, i) => (
          <Btn
            key={i}
            label={`Example ${i + 1}`}
            size="sm"
            variant={cur.scramble === e.scramble ? 'primary' : 'ghost'}
            onPress={() => setCur({ ...e, title: `Worked example ${i + 1}` })}
          />
        ))}
        <Btn
          label={busy ? (phase || 'Solving…') : 'Scramble'}
          size="sm"
          variant="ghost"
          disabled={busy}
          icon={<Ionicons name="shuffle-outline" size={16} color={c.ink} />}
          onPress={() => { void fromScramble(randomScramble(), 'Your scramble'); }}
        />
      </Wrap>
      <View style={{ gap: Spacing.two }}>
        <FieldLabel>Or type a scramble</FieldLabel>
        <Input
          value={typed}
          onChangeText={setTyped}
          placeholder="R U R' U' F2 L …"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus={false}
          returnKeyType="done"
          onSubmitEditing={applyTyped}
        />
        <Btn label="Apply" size="sm" onPress={applyTyped} disabled={busy} />
        {!!err && <Text style={[Type.small, { color: c.danger }]}>{err}</Text>}
      </View>
      <Text style={[Type.body, { color: c.ink }]}>
        Scramble: <Text style={[Type.small, { color: c.muted }]}>{cur.scramble}</Text>
      </Text>
      <Text style={[Type.body, { color: c.ink }]}>
        Cross solution: <Text style={[Type.small, { color: c.muted }]}>{cur.cross}</Text>
      </Text>
    </BentoCell>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Cross', headerBackTitle: 'Back' }} />
      <PageScroll keyboardShouldPersistTaps="handled">
        <View style={{ gap: Spacing.two }}>
          <Text style={[Type.h1, { color: c.ink }]}>
            Cross <Text style={[Type.h3, { color: c.muted }]}>The first step of CFOP</Text>
          </Text>
          <Hint>
            Before F2L you build a white cross on the bottom: the four white edges, each lined up with its matching centre. It is solved intuitively, not with a memorised algorithm, so the goal is to see it and plan it rather than recall moves.
          </Hint>
        </View>

        <Bento minWidth={280} max={2}>
          {isWide ? lesson : player}
          {isWide ? player : lesson}
        </Bento>
      </PageScroll>
    </Screen>
  );
}
