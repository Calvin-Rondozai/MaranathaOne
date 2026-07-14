import React, { useCallback, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChevronRight, Download, Trash2 } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { deleteQuarter, getDownloadedQuarters, SabbathQuarterRow } from '@/database/sabbathSchool';
import { syncSabbathSchool } from '@/services/sabbathSchoolSync';
import { PressableScale } from '@/components/ui/PressableScale';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { Body, Heading, Label } from '@/components/ui/Typography';

export default function SabbathSchoolScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [quarters, setQuarters] = useState<SabbathQuarterRow[]>([]);
  const [syncing, setSyncing] = useState(false);

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

  const handleDelete = (code: string, title: string) => {
    Alert.alert('Delete quarter', `Remove "${title}" from this device? You can download it again later.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteQuarter(db, code);
          refresh();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <FlatList
        data={quarters}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
        ListHeaderComponent={
          <>
            <Body style={{ color: theme.colors.textMuted, marginBottom: theme.spacing.md, fontSize: theme.fontSize.sm }}>
              Adult Sabbath School Bible Study Guide. Downloads automatically when the app opens with a
              connection; old quarters stay on this device until you remove them.
            </Body>
            <PressableScale onPress={handleUpdate} scaleTo={0.98} disabled={syncing}>
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
                  {syncing ? 'Checking…' : 'Check for new lessons'}
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
              onPress={() => router.push({ pathname: '/more/sabbath-school/[code]', params: { code: item.code } })}
              scaleTo={0.99}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Body style={{ fontFamily: theme.fontFamily.sansSemiBold }}>{item.title}</Body>
                  <Label style={{ marginTop: 2 }}>{item.human_date}</Label>
                </View>
                <PressableScale onPress={() => handleDelete(item.code, item.title)} style={{ padding: theme.spacing.xs }}>
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
