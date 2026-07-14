import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSQLiteContext } from 'expo-sqlite';
import { HandCoins } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { getVerseRange, Verse } from '@/database/bible';
import { formatOffertoryRef, getOffertoryReferenceOfDay, OFFERTORY_REFERENCES, OffertoryReference } from '@/database/offertory';
import { getLocalizedBookName } from '@/database/bookNames';
import { useBibleTranslation } from '@/hooks/useBibleTranslation';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Label, ScriptureQuote } from '@/components/ui/Typography';

export default function OffertoryReadingScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const { translation } = useBibleTranslation();
  const [selected, setSelected] = useState<OffertoryReference>(() => getOffertoryReferenceOfDay());
  const [verses, setVerses] = useState<Verse[]>([]);

  const load = useCallback(
    (ref: OffertoryReference) => {
      getVerseRange(db, translation, ref.book, ref.chapter, ref.verseStart, ref.verseEnd).then(setVerses);
    },
    [db, translation]
  );

  useEffect(() => {
    load(selected);
  }, [load, selected]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md, paddingBottom: theme.spacing.xxl }}>
        <AnimatedCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: theme.spacing.sm }}>
            <HandCoins size={16} color={theme.colors.accent} strokeWidth={2} />
            <Label style={{ color: theme.colors.accent }}>Offertory Reading</Label>
          </View>
          {verses.length > 0 ? (
            <ScriptureQuote style={{ marginBottom: theme.spacing.sm }}>
              “{verses.map((v) => v.text).join(' ')}”
            </ScriptureQuote>
          ) : (
            <Body style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.sm }}>Loading…</Body>
          )}
          <Body style={{ color: theme.colors.primary, fontFamily: theme.fontFamily.sansSemiBold }}>
            {getLocalizedBookName(translation, selected.book)} {selected.chapter}:{selected.verseStart}
            {selected.verseEnd ? `-${selected.verseEnd}` : ''}
          </Body>
          <Body style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: theme.spacing.sm }}>
            Giving is worship, not a transaction — an offering back to God of what was always his. Whatever
            you bring today, however small it feels, is received with joy. Give freely, give cheerfully, and
            trust that he sees the heart behind the gift.
          </Body>
        </AnimatedCard>

        <Label style={{ marginTop: theme.spacing.sm }}>All Readings</Label>
        {OFFERTORY_REFERENCES.map((ref) => {
          const isSelected = formatOffertoryRef(ref) === formatOffertoryRef(selected);
          return (
            <PressableScale key={formatOffertoryRef(ref)} onPress={() => setSelected(ref)} scaleTo={0.99}>
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  padding: theme.spacing.md,
                }}
              >
                <Body style={{ fontFamily: theme.fontFamily.sansSemiBold }}>
                  {getLocalizedBookName(translation, ref.book)} {ref.chapter}:{ref.verseStart}
                  {ref.verseEnd ? `-${ref.verseEnd}` : ''}
                </Body>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
