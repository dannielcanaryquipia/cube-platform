import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Bento, BentoCell } from '@/components/bento';
import { CubePlayer } from '@/components/cube-player';
import { Chip, Hint, PageScroll, Screen, SectionTitle } from '@/components/ui';
import { Radius, Rubik, Spacing, Type } from '@/constants/theme';
import { NOTATION, TIPS } from '@/data/notation';
import { useLayout } from '@/hooks/use-layout';
import { useTheme } from '@/hooks/use-theme';

export default function NotationScreen() {
  const c = useTheme();
  const { tileWidth, isWide } = useLayout();
  const [secId, setSecId] = useState(NOTATION[0].id);
  const [sel, setSel] = useState<any>(NOTATION[0].moves[0]);
  const [tried, setTried] = useState<string | null>(null);
  const active = useMemo(() => NOTATION.find((s: any) => s.id === secId), [secId]);
  const moveW = tileWidth(140, Spacing.two);

  const pickSection = (s: any) => { setSecId(s.id); setSel(s.moves[0]); setTried(null); };

  const player = (
    <BentoCell style={{ borderRadius: Radius.lg }}>
      <Text style={[Type.fieldLabel, { color: c.muted }]}>{tried ? 'YOUR ALG' : (sel?.m || 'MOVE')}</Text>
      <Text style={[Type.h2, { color: c.ink }]}>{tried || sel?.m}</Text>
      <Text style={[Type.body, { color: c.muted }]}>{tried ? tried : sel?.d}</Text>
      <CubePlayer key={tried || sel?.m} alg={tried || sel?.m} anchor="start" autoLoop compact showFingers />
      {!tried && sel?.trick && (
        <View style={{ backgroundColor: c.accentSoft, borderRadius: Radius.sm, padding: Spacing.three, gap: 2 }}>
          <Text style={[Type.fieldLabel, { color: c.accent }]}>Finger trick</Text>
          <Text style={[Type.supporting, { color: c.ink }]}>{sel.trick}</Text>
        </View>
      )}
    </BentoCell>
  );

  const list = active ? (
    <BentoCell>
      <SectionTitle title={active.title} />
      <Text style={[Type.body, { color: c.muted }]}>{active.text}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
        {active.moves.map((mv: any) => {
          const on = sel.m === mv.m && !tried;
          return (
            <Pressable
              key={mv.m}
              onPress={() => { setSel(mv); setTried(null); }}
              style={({ pressed }) => ({
                width: moveW,
                gap: 2,
                backgroundColor: c.bg,
                borderWidth: 1,
                borderColor: on ? c.accent : c.line,
                borderRadius: Radius.field,
                padding: Spacing.three,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={[Type.monoLarge, { color: on ? c.accent : c.ink }]}>{mv.m}</Text>
              <Text style={[Type.small, { color: c.muted }]}>{mv.d}</Text>
            </Pressable>
          );
        })}
      </View>
    </BentoCell>
  ) : (
    <BentoCell>
      <SectionTitle title="Habits worth building" />
      <View style={{ gap: Spacing.three }}>
        {TIPS.map((t: any) => (
          <View key={t.t} style={{ gap: 4 }}>
            <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.ink }]}>{t.t}</Text>
            <Text style={[Type.body, { color: c.muted }]}>{t.d}</Text>
          </View>
        ))}
      </View>
    </BentoCell>
  );

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Notation', headerBackTitle: 'Back' }} />
      <PageScroll>
        <Hint>Algorithms are a list of moves. Pick a group, then a move. Hold the cube with yellow on top and green facing you.</Hint>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {NOTATION.map((s: any) => (
            <Chip key={s.id} label={s.title} active={secId === s.id} onPress={() => pickSection(s)} />
          ))}
          <Chip label="Habits" active={secId === 'habits'} onPress={() => setSecId('habits')} />
        </View>

        <Bento minWidth={280} max={2}>
          {isWide ? list : player}
          {isWide ? player : list}
        </Bento>

        {active && (
          <BentoCell>
            <SectionTitle title="Quick tips" />
            <View style={{ gap: Spacing.three }}>
              {TIPS.map((t: any) => (
                <View key={t.t} style={{ gap: 4 }}>
                  <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.ink }]}>{t.t}</Text>
                  <Text style={[Type.body, { color: c.muted }]}>{t.d}</Text>
                </View>
              ))}
            </View>
          </BentoCell>
        )}

        <Pressable
          onPress={() => router.push('/cross' as any)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', minHeight: 44, opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={[Type.body, { fontFamily: Rubik.semibold, color: c.accent }]}>Go on to the Cross</Text>
          <Ionicons name="arrow-forward" size={16} color={c.accent} />
        </Pressable>
      </PageScroll>
    </Screen>
  );
}
