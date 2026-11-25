import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Bento } from '@/components/bento';
import { Btn, Card, ListRow, PageScroll, Progress, Screen, SearchLaunch } from '@/components/ui';
import { Radius, Spacing, Type } from '@/constants/theme';
import { SETS } from '@/data/sets';
import { NOTATION } from '@/data/notation';
import { useTheme } from '@/hooks/use-theme';
import { bootLog } from '@/lib/boot-log';
import { useProgress } from '@/lib/progress';

export default function HomeScreen() {
  useEffect(() => {
    bootLog('home screen mounted');
  }, []);
  const c = useTheme();
  const progress = useProgress() as Record<string, string>;

  const total = SETS.reduce((n, s) => n + s.cases.length, 0);
  const learned = Object.values(progress).filter((v) => v === 'learned').length;
  const pct = total ? (100 * learned) / total : 0;
  let next: { set: (typeof SETS)[number]; item: { id: string } } | null = null;
  for (const s of SETS) {
    const item = s.cases.find((x: { id: string }) => progress[x.id] !== 'learned');
    if (item) {
      next = { set: s, item };
      break;
    }
  }

  const steps = [
    {
      title: 'Notation',
      sub: `${NOTATION.reduce((n: number, s: { moves: unknown[] }) => n + s.moves.length, 0)} moves`,
      path: '/notation',
    },
    ...SETS.map((s) => {
      const n = s.cases.filter((x: { id: string }) => progress[x.id] === 'learned').length;
      return {
        title: s.title,
        sub: `${n}/${s.cases.length} learned`,
        path: `/set/${s.id}`,
      };
    }),
  ];

  return (
    <Screen>
      <PageScroll>
        <SearchLaunch />

        <Card style={{ padding: Spacing.five, borderRadius: Radius.xl, gap: Spacing.four }}>
          <View style={{ gap: 6 }}>
            <Text style={[Type.eyebrow, { color: c.accent }]}>CFOP · 3×3</Text>
            <Text style={[Type.h1, { color: c.ink }]}>Layer by Layer</Text>
            <Text style={[Type.supporting, { color: c.muted }]}>
              Moves first, then F2L, OLL and PLL. Open a set, tap a case, press play.
            </Text>
          </View>
          <Progress label={`${learned} of ${total} cases learned`} value={pct} />
          {next ? (
            <Link href={`/case/${next.item.id}` as any} asChild>
              <Btn
                label={`Continue ${next.set.title}`}
                fullWidth
                endIcon={<Ionicons name="arrow-forward" size={18} color={c.accentInk} />}
              />
            </Link>
          ) : (
            <Link href="/notation" asChild>
              <Btn
                label="Start with notation"
                fullWidth
                endIcon={<Ionicons name="arrow-forward" size={18} color={c.accentInk} />}
              />
            </Link>
          )}
        </Card>

        <Bento minWidth={160} max={2} gap={Spacing.two}>
          <Link href="/timer" asChild>
            <Pressable>
              <Card style={{ gap: 4, minHeight: 88, justifyContent: 'center' }}>
                <Ionicons name="timer-outline" size={20} color={c.accent} />
                <Text style={[Type.smallBold, { color: c.ink }]}>Timer</Text>
                <Text style={[Type.small, { color: c.muted }]}>Inspect & solve</Text>
              </Card>
            </Pressable>
          </Link>
          <Link href="/solve" asChild>
            <Pressable>
              <Card style={{ gap: 4, minHeight: 88, justifyContent: 'center' }}>
                <Ionicons name="color-palette-outline" size={20} color={c.accent} />
                <Text style={[Type.smallBold, { color: c.ink }]}>Paint & solve</Text>
                <Text style={[Type.small, { color: c.muted }]}>Any scramble</Text>
              </Card>
            </Pressable>
          </Link>
        </Bento>

        <Card padded={false}>
          {steps.map((st, i) => (
            <Link key={st.path} href={st.path as any} asChild>
              <ListRow
                title={`${i + 1}. ${st.title}`}
                sub={st.sub}
                last={i === steps.length - 1}
                left={
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      backgroundColor: c.accentSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={[Type.smallBold, { color: c.accent }]}>{i + 1}</Text>
                  </View>
                }
              />
            </Link>
          ))}
        </Card>
      </PageScroll>
    </Screen>
  );
}
