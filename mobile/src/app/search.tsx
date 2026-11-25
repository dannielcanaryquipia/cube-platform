import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CaseGrid } from '@/components/case-card';
import { Chip, Empty, Hint, PageScroll, Screen, SearchField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { ALL_CASES } from '@/data/sets';
import { useTheme } from '@/hooks/use-theme';
import { useStars } from '@/lib/stars';

export default function SearchScreen() {
  const c = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const initial = typeof params.q === 'string' ? params.q : '';
  const [q, setQ] = useState(initial);
  const [starredOnly, setStarredOnly] = useState(false);
  const stars = useStars() as Record<string, boolean>;

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const base = !s
      ? ALL_CASES
      : ALL_CASES.filter((x) =>
          x.name.toLowerCase().includes(s) ||
          x.id.toLowerCase().includes(s) ||
          x.alg.toLowerCase().includes(s) ||
          x.group.toLowerCase().includes(s) ||
          x.set.title.toLowerCase().includes(s)
        );
    const filtered = starredOnly ? base.filter((x) => !!stars[x.id]) : base;
    return filtered.slice(0, 80);
  }, [q, starredOnly, stars]);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Search', headerBackTitle: 'Back' }} />
      <PageScroll keyboardShouldPersistTaps="handled">
        <SearchField
          value={q}
          onChangeText={setQ}
          placeholder="Search cases or algorithms"
          style={{ maxWidth: '100%' }}
        />
        <Hint>Name (OLL 27, Jb), shape (fish), group, or alg (R U R&apos; U&apos;).</Hint>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' }}>
          <Chip
            label="Starred"
            active={starredOnly}
            icon={<Ionicons name={starredOnly ? 'star' : 'star-outline'} size={14} color={starredOnly ? c.bg : c.ink} />}
            onPress={() => setStarredOnly((v) => !v)}
          />
        </View>

        {results.length === 0 ? (
          <Empty>No cases match. Try a different term.</Empty>
        ) : (
          <CaseGrid cases={results as any} />
        )}
      </PageScroll>
    </Screen>
  );
}
