import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Bento, BentoCell } from '@/components/bento';
import { CubeNetEditor } from '@/components/cube-net-editor';
import { CubePlayer } from '@/components/cube-player';
import { Btn, Card, Chip, FieldLabel, Hint, Note, PageScroll, Screen, StageMove, Wrap } from '@/components/ui';
import { Radius, Rubik, Spacing, Type } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { applyMoves, invertMoves, movesToString, parseAlg, solved } from '@/lib/cube';
import { DEFAULT_COLORS, FACE_KEYS, FACE_NAME, resetCubeColors, setCubeColor, useCubeColors } from '@/lib/cubeColors';
import { colorsOf, solveCubeAsync } from '@/lib/solve';
import { getJSON, setJSON } from '@/lib/storage';

const PAINTS = ['U', 'F', 'R', 'B', 'L', 'D'] as const;
const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
const PHASE_INFO: Record<string, string> = {
  Cross: 'Solve the four white edges on the bottom.',
  F2L: 'Pair a white corner with its edge, then insert it.',
  OLL: 'Orient the last layer — make the whole top yellow.',
  PLL: 'Permute the last layer — send every piece home.',
};

function randomScramble() {
  const moves: { face: string; amount: number }[] = [];
  let last = '';
  for (let i = 0; i < 25; i++) {
    let f = '';
    do { f = FACES[(Math.random() * 6) | 0]; } while (f === last);
    last = f;
    moves.push({ face: f, amount: 1 + ((Math.random() * 3) | 0) });
  }
  return { loc: applyMoves(solved(), moves), alg: movesToString(moves) };
}

export default function SolveScreen() {
  const c = useTheme();
  const COLORS = useCubeColors() as Record<string, string>;
  const [color, setColor] = useState<string[]>(() => colorsOf(solved()));
  const [paint, setPaint] = useState<string>('U');
  const [result, setResult] = useState<any>(null);
  const [solving, setSolving] = useState(false);
  const [scramble, setScramble] = useState('');
  const [typed, setTyped] = useState('');
  const [typeErr, setTypeErr] = useState('');
  const [undoStack, setUndoStack] = useState<string[][]>([]);
  const [humanSpeed, setHumanSpeed] = useState(2);
  const [now, setNow] = useState(() => Date.now());
  const [phase, setPhase] = useState('');

  useEffect(() => {
    void getJSON('cube-human-speed', 2).then((v) => {
      const n = Number(v);
      if (n >= 0.5 && n <= 10) setHumanSpeed(n);
    });
  }, []);

  useEffect(() => {
    if (!result?.stages) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [result?.stages]);

  const setPace = (v: number) => {
    const n = Math.max(0.5, Math.min(10, Math.round((Number.isFinite(v) ? v : 2) * 2) / 2));
    setHumanSpeed(n);
    void setJSON('cube-human-speed', n);
  };

  const pushUndo = () => setUndoStack((s) => [...s.slice(-49), color]);
  const apply = (loc: number[], alg: string) => { pushUndo(); setColor(colorsOf(loc)); setResult(null); setScramble(alg); };
  const onPaint = (slot: number) => { pushUndo(); setResult(null); setScramble(''); setColor((cur) => cur.map((v, i) => (i === slot ? paint : v))); };
  const undo = () => {
    setUndoStack((s) => {
      if (!s.length) return s;
      setColor(s[s.length - 1]);
      setResult(null);
      return s.slice(0, -1);
    });
  };
  const doReset = () => { pushUndo(); setColor(colorsOf(solved())); setResult(null); setScramble(''); setTyped(''); setTypeErr(''); };
  const submitTyped = () => {
    const moves = parseAlg(typed);
    if (!moves.length) { setTypeErr('Enter moves like R U R\' U2 F'); return; }
    setTypeErr('');
    apply(applyMoves(solved(), moves), movesToString(moves));
  };
  const doSolve = async () => {
    if (solving) return;
    setSolving(true);
    setResult(null);
    setPhase('Starting…');
    try {
      const next = await solveCubeAsync(color, setPhase);
      setResult(next);
    } finally {
      setSolving(false);
      setPhase('');
    }
  };

  const tps = Math.max(0.1, humanSpeed);
  const humanTime = result?.moveCount ? result.moveCount / tps : 0;
  const pace = humanTime < 30 ? 'fast' : humanTime < 60 ? 'solid' : 'long';
  const finishAt = new Date(now + humanTime * 1000).toLocaleTimeString();

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Solve', headerBackTitle: 'Back' }} />
      <PageScroll>
        <Bento minWidth={340} max={2}>
        <BentoCell style={{ gap: Spacing.four }}>
          <Hint>Colour every sticker to match your cube (white bottom, yellow top, green front), then solve it stage by stage.</Hint>
          <FieldLabel>Paint colour</FieldLabel>
          <Wrap gap={Spacing.two}>
            {PAINTS.map((f) => {
              const on = paint === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setPaint(f)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: Radius.sm,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: COLORS[f],
                    borderWidth: on ? 3 : 1,
                    borderColor: on ? c.ink : 'rgba(0,0,0,0.12)',
                  }}
                >
                  <Text style={[Type.smallBold, { color: f === 'D' || f === 'U' ? '#222' : '#fff' }]}>{f}</Text>
                </Pressable>
              );
            })}
          </Wrap>

          <CubeNetEditor color={color} onPaint={onPaint} />

          <Wrap gap={Spacing.two}>
            <Btn
              label={solving ? (phase || 'Solving…') : 'Solve'}
              onPress={() => { void doSolve(); }}
              disabled={solving}
              icon={<Ionicons name="cube-outline" size={18} color={c.accentInk} />}
            />
            <Btn label="Scramble" variant="ghost" onPress={() => { const s = randomScramble(); apply(s.loc, s.alg); }} />
            <Btn label="Undo" variant="ghost" onPress={undo} disabled={!undoStack.length} />
            <Btn label="Reset" variant="ghost" onPress={doReset} />
          </Wrap>

          {!!scramble && (
            <Text style={[Type.supporting, { color: c.muted }]}>
              Scramble: <Text style={[Type.smallBold, { color: c.ink }]}>{scramble}</Text>
            </Text>
          )}

          <View style={{ gap: Spacing.two, paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: c.line }}>
            <FieldLabel>Or type a scramble</FieldLabel>
            <TextInput
              value={typed}
              onChangeText={setTyped}
              placeholder="R U R' U' F2 L D2 …"
              placeholderTextColor={c.muted}
              style={{
                height: 42,
                borderWidth: 1,
                borderColor: c.line,
                backgroundColor: c.bg,
                color: c.ink,
                borderRadius: Radius.sm,
                paddingHorizontal: Spacing.three,
                fontFamily: Rubik.regular,
                fontSize: 15,
              }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Wrap gap={Spacing.two}>
              <Btn label="Apply" variant="ghost" size="sm" onPress={submitTyped} />
              {!!typeErr && <Text style={[Type.small, { color: c.danger }]}>{typeErr}</Text>}
            </Wrap>
          </View>

          {!!result?.error && <Note tone="warn"><Text style={[Type.supporting, { color: c.ink }]}>{result.error}</Text></Note>}

          <FieldLabel>Sticker colours</FieldLabel>
          <Text style={[Type.supporting, { color: c.muted }]}>Match colours to your physical cube. Resets to defaults.</Text>
          <Wrap gap={Spacing.three}>
            {(FACE_KEYS as string[]).map((face) => {
              const name = (FACE_NAME as Record<string, string>)[face] ?? face;
              const def = (DEFAULT_COLORS as Record<string, string>)[face];
              const changed = def && COLORS[face].toLowerCase() !== def.toLowerCase();
              return (
                <View key={face} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 120 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)', backgroundColor: COLORS[face] }} />
                  <Text style={[Type.small, { color: c.ink }]}>{name}</Text>
                  {changed && (
                    <Pressable onPress={() => setCubeColor(face, def)}>
                      <Text style={[Type.small, { color: c.accent }]}>{'Reset'}</Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </Wrap>
          <Btn label="Reset all colours" variant="ghost" size="sm" onPress={resetCubeColors} />
        </BentoCell>

        {result?.stages ? (
          <BentoCell>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Spacing.two }}>
              <FieldLabel>Solution</FieldLabel>
              <Text style={[Type.supporting, { color: c.muted }]}>
                <Text style={[Type.h1, { color: c.ink }]}>{result.moveCount}</Text> moves · {result.stages.length} stages
              </Text>
            </View>

            <CubePlayer
              key={result.alg}
              alg={result.alg}
              setup={movesToString(invertMoves(parseAlg(result.alg)))}
              anchor="start"
              showFingers
              phases={result.stages.map((s: any) => ({
                label: s.caseId ? `${s.stage} · ${s.caseName}` : s.stage,
                len: s.moves.length,
              }))}
            />

            {result.stages.map((s: any, i: number) => (
              <View key={i} style={{ paddingTop: Spacing.three, borderTopWidth: 1, borderTopColor: c.line, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: Spacing.two }}>
                  <Text style={[Type.body, { fontFamily: Rubik.bold, color: c.ink }]}>{s.stage}</Text>
                  {s.caseId ? (
                    <Link href={`/case/${s.caseId}` as any} asChild>
                      <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                        <Text style={[Type.supporting, { fontFamily: Rubik.semibold, color: c.accent }]}>{s.caseName}</Text>
                        <Ionicons name="chevron-forward" size={14} color={c.accent} />
                      </Pressable>
                    </Link>
                  ) : s.caseName ? (
                    <Text style={[Type.supporting, { color: c.muted }]}>{s.caseName}</Text>
                  ) : null}
                </View>
                <Text style={[Type.supporting, { color: c.muted }]}>{PHASE_INFO[s.stage.split(' ')[0]]}</Text>
                <Wrap gap={4}>
                  {s.moves.length ? s.moves.map((m: string, j: number) => <StageMove key={j} label={m} />) : <StageMove label="—" empty />}
                  {s.moves.length > 0 && <Text style={[Type.small, { color: c.muted, marginLeft: 'auto' }]}>{s.moves.length} {s.moves.length === 1 ? 'move' : 'moves'}</Text>}
                </Wrap>
              </View>
            ))}

            <Note>
              Drag the cube to spin it — same 3D player as the website. Works offline. Play time is on the cube controls.
            </Note>
          </BentoCell>
        ) : null}
        </Bento>

        {result?.stages ? (
          <BentoCell>
            <FieldLabel>Pace estimate</FieldLabel>
            <Text style={[Type.supporting, { color: c.muted }]}>Human speed (moves/sec)</Text>
            <Wrap gap={Spacing.two}>
              {[0.5, 1, 2, 3, 5, 10].map((n) => (
                <Chip key={n} small label={`${n}`} active={humanSpeed === n} onPress={() => setPace(n)} />
              ))}
            </Wrap>
            <Text style={[Type.body, { color: c.muted }]}>
              Estimated human time:{' '}
              <Text style={[Type.mono, { color: c.ink }]}>{humanTime.toFixed(1)}s</Text>
              {' · '}Finish at{' '}
              <Text style={[Type.mono, { color: c.ink }]}>{finishAt}</Text>
            </Text>
            <Text style={[Type.body, { color: c.muted }]}>
              Speedcuber time (10 moves/sec):{' '}
              <Text style={[Type.mono, { color: c.ink }]}>{(result.moveCount / 10).toFixed(2)}s</Text>
              {' · '}Yiheng Wang pace (12 moves/sec):{' '}
              <Text style={[Type.mono, { color: c.ink }]}>{(result.moveCount / 12).toFixed(2)}s</Text>
            </Text>
            <Hint>
              Computer found {result.moveCount} moves. At your speed that&apos;s a {pace} solve. Play the scramble on the cube — the running time sits next to the move counter.
            </Hint>
          </BentoCell>
        ) : null}

        {!result?.stages && !solving && (
          <Card style={{ gap: Spacing.two }}>
            <FieldLabel>How it solves</FieldLabel>
            <Text style={[Type.body, { color: c.muted }]}>
              The solution follows CFOP: Cross, F2L pairs, then OLL and PLL from this app&apos;s verified algorithm sets. Cross and F2L are found by computer search, so they are short but may differ from hand-learned solutions.
            </Text>
          </Card>
        )}
      </PageScroll>
    </Screen>
  );
}
