import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ChevronRight, Search } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { EgwBook, getEgwBook } from '@/database/egwBooks';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Label } from '@/components/ui/Typography';

export default function EgwChapterListScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { code } = useLocalSearchParams<{ code: string }>();
  const [book, setBook] = useState<EgwBook | undefined>(undefined);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setBook(undefined);
    getEgwBook(code ?? '').then((b) => {
      if (!cancelled) setBook(b);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  const chapters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !book) return book?.chapters ?? [];
    return book.chapters.filter((c) => c.title.toLowerCase().includes(q));
  }, [book, query]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: book?.title ?? '' });
  }, [navigation, book]);

  if (!book) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <FlatList
        data={chapters}
        keyExtractor={(item) => String(item.number)}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}
        ListHeaderComponent={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.sm,
              marginBottom: theme.spacing.md,
            }}
          >
            <Search size={16} color={theme.colors.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search chapters"
              placeholderTextColor={theme.colors.textFaint}
              style={{
                flex: 1,
                padding: theme.spacing.sm,
                color: theme.colors.text,
                fontFamily: theme.fontFamily.sansRegular,
                fontSize: theme.fontSize.base,
              }}
            />
          </View>
        }
        ListEmptyComponent={
          <Body style={{ color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.spacing.lg }}>
            No chapters match "{query}".
          </Body>
        }
        renderItem={({ item }) => (
          <PressableScale
            onPress={() =>
              router.push({ pathname: '/more/egw/[code]/[number]', params: { code: code ?? '', number: String(item.number) } })
            }
            scaleTo={0.99}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.xs + 2,
              }}
            >
              <Label style={{ width: 28 }}>{item.number}</Label>
              <Body style={{ flex: 1 }}>{item.title}</Body>
              <ChevronRight size={16} color={theme.colors.textFaint} />
            </View>
          </PressableScale>
        )}
      />
    </SafeAreaView>
  );
}
