import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import CaseImage from '@/components/case-image';
import { Radius, Rubik, Type, shadow } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';
import { useProgress } from '@/lib/progress';
import { useStars } from '@/lib/stars';

export type CaseItem = {
  id: string;
  name: string;
  alg: string;
  slot?: string;
  group?: string;
  algs?: { alg: string }[];
  set: { view: string; title?: string };
};

/** Website `.card` — diagram, title, then the full alg held inside the same card. */
export function CaseCard({ item, width }: { item: CaseItem; width?: number }) {
  const c = useTheme();
  const progress = useProgress() as Record<string, string>;
  const stars = useStars() as Record<string, boolean>;
  const status = progress[item.id];
  const starred = !!stars[item.id];

  return (
    <Link href={`/case/${item.id}` as any} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}: ${item.alg}`}
        style={({ pressed }) => ({
          width: width ? '100%' : undefined,
          maxWidth: '100%',
          minWidth: 0,
          borderWidth: 1,
          borderRadius: Radius.md,
          borderCurve: 'continuous',
          overflow: 'hidden',
          backgroundColor: c.surface,
          borderColor: pressed ? c.accent : c.line,
          transform: [{ translateY: pressed ? -1 : 0 }],
          ...shadow(pressed ? 'md' : 'sm', c.isDark),
        })}
      >
        <View
          style={{
            width: '100%',
            paddingHorizontal: 22,
            paddingTop: 16,
            paddingBottom: 6,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CaseImage alg={item.alg} view={item.set.view} slot={item.slot} fill />
        </View>
        <View
          style={{
            width: '100%',
            minWidth: 0,
            paddingHorizontal: 14,
            paddingTop: 4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[Type.body, { flex: 1, minWidth: 0, fontFamily: Rubik.semibold, fontSize: 14, lineHeight: 18, color: c.ink }]}
          >
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {starred && <Ionicons name="star" size={12} color={c.star} />}
            {!!status && (
              <View
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: status === 'learned' ? c.learned : status === 'learning' ? c.learning : c.muted,
                }}
              />
            )}
          </View>
        </View>
        <View style={{ width: '100%', minWidth: 0, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 2, gap: 2 }}>
          <Text
            style={[
              Type.small,
              {
                color: c.muted,
                lineHeight: 18,
                letterSpacing: 0.2,
                width: '100%',
                flexShrink: 1,
              },
            ]}
          >
            {item.alg}
          </Text>
          {item.algs && item.algs.length > 1 && (
            <Text style={[Type.supporting, { color: c.muted }]}>{item.algs.length} algs</Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

/** Website `.grid` — auto-fill cards that grow from 128px (phone) to 178px (desktop). */
export function CaseGrid({ cases }: { cases: CaseItem[] }) {
  const { contentWidth, caseMin } = useLayout();
  const gap = 12;
  const cols = Math.max(1, Math.floor((contentWidth + gap) / (caseMin + gap)));
  const w = Math.floor((contentWidth - gap * (cols - 1)) / cols);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, width: '100%', maxWidth: '100%' }}>
      {cases.map((item) => (
        <View key={item.id} style={{ width: w, maxWidth: '100%', minWidth: 0 }}>
          <CaseCard item={item} width={w} />
        </View>
      ))}
    </View>
  );
}
