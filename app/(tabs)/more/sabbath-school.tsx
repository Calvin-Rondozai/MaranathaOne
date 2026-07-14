import React, { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChevronRight, Download, Trash2 } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import {
  deleteQuarter,
  getDownloadedQuarters,
  SABBATH_EDITIONS,
  SABBATH_LANGUAGES,
  SabbathQuarterRow,
} from '@/database/sabbathSchool';
import { syncSabbathSchool, syncSpecificQuarter } from '@/services/sabbathSchoolSync';
import { PressableScale } from '@/components/ui/PressableScale';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Body, Heading, Label } from '@/components/ui/Typography';

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <PressableScale onPress={onPress} scaleTo={0.96}>
      <View
        style={{
          paddingHorizontal: theme.spacing.sm + 2,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radius.pill,
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
          borderWidth: 1,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          marginRight: theme.spacing.xs,
          marginBottom: theme.spacing.xs,
        }}
      >
        <Body style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontSize: theme.fontSize.sm }}>{label}</Body>
      </View>
    </PressableScale>
  );
}

export default function SabbathSchoolScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [quarters, setQuarters] = useState<SabbathQuarterRow[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lang, setLang] = useState(SABBATH_LANGUAGES[0].code);
  const [edition, setEdition] = useState(SABBATH_EDITIONS[0].code);

  const refresh = useCallback(() => {
    getDownloadedQuarters(db).then(setQuarters);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleUpdate = async () => {
    setSyncing(true);
    const result = await syncSabbathSchool(db, { force: false });
    setSyncing(false);
    refresh();
    if (!result.synced) {
      Alert.alert('Up to date', 'No new quarter to download right now — check your connection or try again later.');
    }
  };

  const handleDownloadVariant = async () => {
    if (lang === 'en' && edition === 'standard') return handleUpdate();
    setSyncing(true);
    const editionSuffix = SABBATH_EDITIONS.find((e) => e.code === edition)?.suffix ?? '';
    const result = await syncSpecificQuarter(db, lang, editionSuffix);
    setSyncing(false);
    refresh();
    if (!result.synced) {
      Alert.alert('Not available', 'That language/edition isn\'t available for the current quarter yet — check your connection or try again later.');
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete quarter', `Remove "${title}" from this device? You can download it again later.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteQuarter(db, id);
          refresh();
        },
      },
    ]);
  };

  const isDefaultVariant = lang === 'en' && edition === 'standard';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <FlatList
        data={quarters}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
        ListHeaderComponent={
          <>
            <Body style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md, fontSize: theme.fontSize.sm }}>
              Adult Sabbath School Bible Study Guide. The standard English edition downloads automatically
              when the app opens with a connection; old quarters stay on this device until you remove them.
            </Body>

            <Label style={{ marginBottom: theme.spacing.xs }}>Language</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.sm }}>
              {SABBATH_LANGUAGES.map((l) => (
                <Chip key={l.code} label={l.label} active={lang === l.code} onPress={() => setLang(l.code)} />
              ))}
            </View>

            <Label style={{ marginBottom: theme.spacing.xs }}>Edition</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: theme.spacing.md }}>
              {SABBATH_EDITIONS.map((e) => (
                <Chip key={e.code} label={e.label} active={edition === e.code} onPress={() => setEdition(e.code)} />
              ))}
            </View>

            <PressableScale onPress={handleDownloadVariant} scaleTo={0.98} disabled={syncing}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.sm + 2,
                  marginBottom: theme.spacing.lg,
                  opacity: syncing ? 0.6 : 1,
                }}
              >
                <Download size={16} color={theme.colors.onPrimary} strokeWidth={2} />
                <Body style={{ color: theme.colors.onPrimary, fontFamily: theme.fontFamily.sansSemiBold, marginLeft: theme.spacing.xs }}>
                  {syncing ? 'Checking…' : isDefaultVariant ? 'Check for new lessons' : 'Download this language/edition'}
                </Body>
              </View>
            </PressableScale>
            <Label style={{ marginBottom: theme.spacing.sm }}>Downloaded quarters</Label>
          </>
        }
        ListEmptyComponent={
          <Body style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.lg }}>
            No lessons downloaded yet. Tap "Check for new lessons" while online.
          </Body>
        }
        renderItem={({ item }) => (
          <AnimatedCard style={{ marginBottom: theme.spacing.sm, padding: 0 }}>
            <PressableScale
              onPress={() => router.push({ pathname: '/more/sabbath-school/[id]', params: { id: item.id } })}
              scaleTo={0.99}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontFamily: theme.fontFamily.sansSemiBold }}>{item.title}</Body>
                  <Label style={{ marginTop: 2 }}>
                    {item.human_date} · {SABBATH_LANGUAGES.find((l) => l.code === item.lang)?.label ?? item.lang}
                    {item.edition ? ` · ${SABBATH_EDITIONS.find((e) => e.suffix === item.edition)?.label ?? item.edition}` : ''}
                  </Label>
                </View>
                <PressableScale onPress={() => handleDelete(item.id, item.title)} style={{ padding: theme.spacing.xs }}>
                  <Trash2 size={18} color={theme.colors.danger} strokeWidth={1.75} />
                </PressableScale>
                <ChevronRight size={16} color={theme.colors.textFaint} />
              </View>
            </PressableScale>
          </AnimatedCard>
        )}
      />
    </SafeAreaView>
  );
}
