import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { CaseGrid } from '@/components/case-card';
import {
  Card,
  Chip,
  Empty,
  FieldLabel,
  PageScroll,
  Screen,
  SearchField,
  SectionTitle,
} from '@/components/ui';
import { Spacing, Type } from '@/constants/theme';
import { SETS } from '@/data/sets';
import { useTheme } from '@/hooks/use-theme';
import { useProgress } from '@/lib/progress';
import { useStars } from '@/lib/stars';

const STATUS = [['all', 'All'], ['starred', 'Starred'], ['new', 'Not started'], ['learning', 'Learning'], ['learned', 'Learned']] as const;

function matchCase(c: any, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return c.name.toLowerCase().includes(s) || c.id.toLowerCase().includes(s) || c.alg.toLowerCase().includes(s) || c.group.toLowerCase().includes(s);
}

export default function SetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const set = SETS.find((s) => s.id === id);
  const c = useTheme();
  const progress = useProgress() as Record<string, string>;
  const stars = useStars() as Record<string, boolean>;
  const [group, setGroup] = useState('all');
  const [status, setStatusFilter] = useState<string>('all');
  const [q, setQ] = useState('');

  const cases = useMemo(() => (set ? set.cases.map((x: any) => ({ ...x, set })) : []), [set]);

  if (!set) {
    return (
      <Screen>
        <PageScroll>
          <Empty>Set not found.</Empty>
        </PageScroll>
      </Screen>
    );
  }

  const filtered = cases.filter((x: any) =>
    (group === 'all' || x.group === group) &&
    (status === 'all' ||
      (status === 'new' ? !progress[x.id] :
       status === 'starred' ? !!stars[x.id] :
       progress[x.id] === status)) &&
    matchCase(x, q)
  );
  const groups = set.groups.filter((g: string) => group === 'all' || g === group);
  const learned = cases.filter((x: any) => progress[x.id] === 'learned').length;
  const starredCount = cases.filter((x: any) => !!stars[x.id]).length;

  return (
    <Screen>
      <Stack.Screen options={{ title: set.title, headerBackTitle: 'Back' }} />
      <PageScroll keyboardShouldPersistTaps="handled">
        <Card style={{ gap: Spacing.three, minWidth: 0, overflow: 'hidden' }}>
          <Text style={[Type.body, { color: c.muted }]}>{set.intro}</Text>
          <Text style={[Type.supporting, { color: c.muted }]}>{learned} of {cases.length} learned · {starredCount} starred</Text>
          <SearchField value={q} onChangeText={setQ} placeholder={`Filter ${set.title}`} style={{ maxWidth: '100%' }} />

          <View style={{ gap: Spacing.two }}>
            <FieldLabel>Category</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              <Chip label="All" count={cases.length} active={group === 'all'} onPress={() => setGroup('all')} />
              {set.groups.map((g: string) => (
                <Chip
                  key={g}
                  label={g}
                  count={cases.filter((x: any) => x.group === g).length}
                  active={group === g}
                  onPress={() => setGroup(g)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={{ gap: Spacing.two }}>
            <FieldLabel>Show</FieldLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {STATUS.map(([k, label]) => (
                <Chip
                  key={k}
                  label={label}
                  count={k === 'starred' ? starredCount : undefined}
                  active={status === k}
                  onPress={() => setStatusFilter(k)}
                />
              ))}
            </ScrollView>
          </View>
        </Card>

        {filtered.length === 0 && (
          <Empty>No cases match. Try a case name like &quot;T perm&quot;, a shape like &quot;fish&quot;, or part of an alg like &quot;R U R&apos;&quot;.</Empty>
        )}

        {groups.map((g: string) => {
          const list = filtered.filter((x: any) => x.group === g);
          if (!list.length) return null;
          return (
            <View key={g} style={{ gap: Spacing.three, minWidth: 0, width: '100%' }}>
              <SectionTitle title={g} count={list.length} />
              <CaseGrid cases={list} />
            </View>
          );
        })}
      </PageScroll>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: { gap: 6, paddingVertical: 1, paddingRight: Spacing.two },
});
