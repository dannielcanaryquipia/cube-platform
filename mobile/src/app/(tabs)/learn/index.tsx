import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Bento } from '@/components/bento';
import { Card, ListRow, PageHeader, PageScroll, Progress, Screen, SearchLaunch, SectionTitle } from '@/components/ui';
import { Radius, Spacing, Type } from '@/constants/theme';
import { SETS } from '@/data/sets';
import { useTheme } from '@/hooks/use-theme';
import { useProgress } from '@/lib/progress';

const STEPS = [
  { href: '/notation', title: 'Notation', sub: 'Moves & finger tricks' },
  { href: '/cross', title: 'Cross', sub: 'Build the white cross' },
  ...SETS.map((s) => ({ href: `/set/${s.id}`, title: s.title, sub: s.subtitle, setId: s.id })),
  { href: '/solve', title: 'Solve', sub: 'Paint & solve a cube' },
];

export default function LearnScreen() {
  const c = useTheme();
  const progress = useProgress() as Record<string, string>;
  const totalCases = SETS.reduce((n, s) => n + s.cases.length, 0);
  const totalLearned = Object.values(progress).filter((v) => v === 'learned').length;

  return (
    <Screen>
      <PageScroll>
        <SearchLaunch />
        <PageHeader
          title="Learning path"
          lede="Work through the steps in order, or jump to a set. Progress stays on this device."
        >
          <Progress label={`${totalLearned} of ${totalCases} cases`} value={totalCases ? (100 * totalLearned) / totalCases : 0} />
        </PageHeader>

        <Card padded={false}>
          {STEPS.map((step, i) => {
            const set = 'setId' in step ? SETS.find((s) => s.id === step.setId) : undefined;
            const learned = set ? set.cases.filter((x: any) => progress[x.id] === 'learned').length : null;
            return (
              <Link key={step.href} href={step.href as any} asChild>
                <ListRow
                  title={`${i + 1}. ${step.title}`}
                  sub={step.sub}
                  last={i === STEPS.length - 1}
                  left={
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: c.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={[Type.smallBold, { color: c.accent }]}>{i + 1}</Text>
                    </View>
                  }
                  right={
                    learned != null ? (
                      <Text style={[Type.small, { color: c.muted, fontVariant: ['tabular-nums'] }]}>
                        {learned}/{set!.cases.length}
                      </Text>
                    ) : undefined
                  }
                />
              </Link>
            );
          })}
        </Card>

        <SectionTitle title="Your progress" count={`${totalLearned}/${totalCases}`} />
        <Bento minWidth={140} max={4} gap={Spacing.two}>
          {SETS.map((s) => {
            const learnedCount = s.cases.filter((x: any) => progress[x.id] === 'learned').length;
            return (
              <Link key={s.id} href={`/set/${s.id}` as any} asChild>
                <Pressable>
                  <Card style={{ gap: 6 }}>
                    <Text style={[Type.smallBold, { color: c.ink }]}>{s.title}</Text>
                    <Text style={[Type.small, { color: c.muted }]}>
                      {learnedCount} of {s.cases.length}
                    </Text>
                    <View style={{ height: 5, borderRadius: Radius.pill, backgroundColor: c.surface2, overflow: 'hidden' }}>
                      <View style={{ height: '100%', width: `${(100 * learnedCount) / s.cases.length}%`, backgroundColor: c.accent }} />
                    </View>
                  </Card>
                </Pressable>
              </Link>
            );
          })}
        </Bento>
      </PageScroll>
    </Screen>
  );
}
