import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Bento, BentoCell } from '@/components/bento';
import CaseDiagram from '@/components/case-image';
import { CubePlayer } from '@/components/cube-player';
import {
  AlgText,
  Chip,
  Empty,
  PageScroll,
  Screen,
  SectionTitle,
} from '@/components/ui';
import { Radius, Spacing, Type } from '@/constants/theme';
import { findCase } from '@/data/sets';
import { useTheme } from '@/hooks/use-theme';
import { setStatus, useProgress } from '@/lib/progress';
import { toggleStar, useStars } from '@/lib/stars';

function algsOf(item: any) {
  if (item.algs && item.algs.length) return item.algs;
  const algs = [{ alg: item.alg, label: 'Standard' }];
  if (item.alt && item.alt !== item.alg) algs.push({ alg: item.alt, label: 'Left hand' });
  return algs;
}

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useTheme();
  const progress = useProgress() as Record<string, string>;
  const stars = useStars() as Record<string, boolean>;
  const [sel, setSel] = useState(0);
  const [seenId, setSeenId] = useState(id);
  if (id !== seenId) {
    setSeenId(id);
    setSel(0);
  }

  const item = findCase(id);

  if (!item) {
    return (
      <Screen>
        <PageScroll>
          <Empty>That case doesn&apos;t exist.</Empty>
        </PageScroll>
      </Screen>
    );
  }

  const algs = algsOf(item);
  const current = algs[Math.min(sel, algs.length - 1)];
  const list = item.set.cases;
  const index = list.findIndex((x: any) => x.id === item.id);
  const prev = list[index - 1];
  const next = list[index + 1];
  const status = progress[item.id];
  const starred = !!stars[item.id];

  return (
    <Screen>
      <Stack.Screen options={{ title: item.name, headerBackTitle: item.set.title }} />
      <PageScroll>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three, minWidth: 0 }}>
          {prev ? (
            <Link href={`/case/${prev.id}` as any} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Previous case, ${prev.name}`}
                style={{ flex: 1, minWidth: 0, minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={[Type.fieldLabel, { color: c.muted }]}>Previous</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={[Type.supporting, { color: c.muted }]}>{prev.name}</Text>
              </Pressable>
            </Link>
          ) : <View style={{ flex: 1 }} />}
          {next ? (
            <Link href={`/case/${next.id}` as any} asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Next case, ${next.name}`}
                style={{ flex: 1, minWidth: 0, minHeight: 44, justifyContent: 'center', alignItems: 'flex-end' }}
              >
                <Text style={[Type.fieldLabel, { color: c.muted }]}>Next</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={[Type.supporting, { color: c.muted, textAlign: 'right' }]}>{next.name}</Text>
              </Pressable>
            </Link>
          ) : <View style={{ flex: 1 }} />}
        </View>

        <Bento minWidth={320} max={2}>
        <BentoCell>
          <Text style={[Type.supporting, { color: c.accent }]}>{item.set.title} · {item.group}</Text>
          {algs.length > 1 && <AlgText>{algs.length} algorithms available — pick one below</AlgText>}

          <View style={{ width: 180, maxWidth: '100%', alignSelf: 'flex-start', backgroundColor: c.surface2, borderWidth: 1, borderColor: c.line, borderRadius: Radius.md, padding: 18, overflow: 'hidden' }}>
            <CaseDiagram alg={current.alg} view={item.set.view} slot={item.slot} size={144} />
          </View>
          <Text style={[Type.fieldLabel, { color: c.muted, marginTop: -6 }]}>{item.set.title} recognition pattern</Text>

          {algs.length > 1 ? (
            <View style={{ gap: 6 }}>
              {algs.map((a: any, i: number) => {
                const active = i === sel;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setSel(i)}
                    style={{
                      gap: 3,
                      minWidth: 0,
                      width: '100%',
                      backgroundColor: c.surface,
                      borderWidth: 1,
                      borderColor: active ? c.accent : c.line,
                      borderRadius: Radius.field,
                      paddingVertical: 9,
                      paddingHorizontal: Spacing.three,
                    }}
                  >
                    <Text style={[Type.fieldLabel, { color: active ? c.accent : c.muted }]}>{a.label}</Text>
                    <Text style={[Type.monoSmall, { color: c.ink, fontSize: 15, lineHeight: 22, width: '100%' }]}>{a.alg}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text
              selectable
              style={[
                Type.mono,
                {
                  fontSize: 17,
                  lineHeight: 24,
                  color: c.ink,
                  width: '100%',
                  flexShrink: 1,
                  backgroundColor: c.surface2,
                  borderWidth: 1,
                  borderColor: c.line,
                  borderRadius: Radius.field,
                  paddingVertical: Spacing.three,
                  paddingHorizontal: Spacing.four,
                },
              ]}
            >
              {current.alg}
            </Text>
          )}

          {(current.label === 'Left hand' || current.label === 'Left hand mirror') && (
            <Text style={[Type.body, { color: c.muted }]}>The left-hand mirror — solves the same case with L and U instead of R and U.</Text>
          )}
          {item.generated && (
            <Text style={[Type.body, { color: c.muted }]}>Found by a computer search for a short R, U and F solution. It works, but a hand-picked alg may feel better.</Text>
          )}
          {item.basedOn && (
            <Text style={[Type.body, { color: c.muted, flexShrink: 1 }]}>
              Mirror of <Link href={`/case/${item.basedOn}` as any} style={{ color: c.accent }}>{item.basedOn.replace('f2l-', 'F2L ')}</Link> for the {item.group.toLowerCase()}.
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Chip
              label={starred ? 'Starred' : 'Star'}
              active={starred}
              icon={<Ionicons name="star" size={13} color={starred ? c.bg : c.ink} />}
              onPress={() => toggleStar(item.id)}
            />
            {[['', 'Not started'], ['learning', 'Learning'], ['learned', 'Learned']].map(([key, label]) => (
              <Chip
                key={label}
                label={label}
                active={(status || '') === key}
                onPress={() => setStatus(item.id, key || undefined)}
              />
            ))}
          </View>

        </BentoCell>

        <BentoCell style={{ borderRadius: Radius.lg }}>
          <SectionTitle title="Watch the algorithm" />
          <CubePlayer
            key={item.id + sel}
            alg={current.alg}
            stickering={item.set.stickering || 'full'}
            slot={item.slot}
            anchor="end"
            showFingers
            phases={[{ label: item.set.title, len: 999 }]}
          />
          <AlgText>Drag the cube to see every corner. Tap a move to jump.</AlgText>
        </BentoCell>
        </Bento>
      </PageScroll>
    </Screen>
  );
}
