import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { NotebookPen, Pin, Plus, Search as SearchIcon, Archive, X } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { getNotes, Note, NOTE_CATEGORIES, NoteCategory } from '@/database/notes';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Heading, Label } from '@/components/ui/Typography';

export default function NotesListScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [category, setCategory] = useState<NoteCategory | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  const refresh = useCallback(() => {
    getNotes(db, { search, category: category ?? undefined, archived: showArchived }).then(setNotes);
  }, [db, search, category, showArchived]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <PressableScale
            onPress={() => {
              setShowSearch((v) => !v);
              setSearch('');
            }}
            style={{ padding: theme.spacing.xs }}
          >
            {showSearch ? (
              <X size={20} color={theme.colors.text} strokeWidth={1.75} />
            ) : (
              <SearchIcon size={20} color={theme.colors.text} strokeWidth={1.75} />
            )}
          </PressableScale>
          <PressableScale onPress={() => setShowArchived((v) => !v)} style={{ padding: theme.spacing.xs }}>
            <Archive size={20} color={showArchived ? theme.colors.primary : theme.colors.text} strokeWidth={1.75} />
          </PressableScale>
        </View>
      ),
    });
  }, [navigation, theme, showArchived, showSearch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[]}>
      <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.sm, gap: theme.spacing.sm }}>
        {showSearch && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.border,
              paddingHorizontal: theme.spacing.sm,
            }}
          >
            <SearchIcon size={18} color={theme.colors.textFaint} />
            <TextInput
              autoFocus
              value={search}
              onChangeText={setSearch}
              placeholder="Search notes"
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
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
          <PressableScale onPress={() => setCategory(null)} scaleTo={0.96}>
            <View
              style={{
                paddingVertical: theme.spacing.xs + 2,
                paddingHorizontal: theme.spacing.sm + 2,
                borderRadius: theme.radius.pill,
                backgroundColor: category === null ? theme.colors.primary : theme.colors.surfaceMuted,
              }}
            >
              <Body
                style={{
                  fontSize: theme.fontSize.sm,
                  color: category === null ? theme.colors.onPrimary : theme.colors.textMuted,
                  fontFamily: theme.fontFamily.sansMedium,
                }}
              >
                All
              </Body>
            </View>
          </PressableScale>
          {NOTE_CATEGORIES.map((c) => (
            <PressableScale key={c.key} onPress={() => setCategory(c.key)} scaleTo={0.96}>
              <View
                style={{
                  paddingVertical: theme.spacing.xs + 2,
                  paddingHorizontal: theme.spacing.sm + 2,
                  borderRadius: theme.radius.pill,
                  backgroundColor: category === c.key ? theme.colors.primary : theme.colors.surfaceMuted,
                }}
              >
                <Body
                  style={{
                    fontSize: theme.fontSize.sm,
                    color: category === c.key ? theme.colors.onPrimary : theme.colors.textMuted,
                    fontFamily: theme.fontFamily.sansMedium,
                  }}
                >
                  {c.label}
                </Body>
              </View>
            </PressableScale>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0, paddingBottom: theme.spacing.xxl }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: theme.spacing.xxl, gap: theme.spacing.sm }}>
            <NotebookPen size={32} color={theme.colors.textFaint} strokeWidth={1.5} />
            <Heading style={{ fontSize: theme.fontSize.md }}>
              {showArchived ? 'No archived notes' : 'No notes yet'}
            </Heading>
            {!showArchived && (
              <Body style={{ color: theme.colors.textMuted, textAlign: 'center' }}>
                Tap the + button to write your first note.
              </Body>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <PressableScale onPress={() => router.push({ pathname: '/notes/[id]', params: { id: String(item.id) } })} scaleTo={0.99}>
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.sm,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                {!!item.pinned && <Pin size={12} color={theme.colors.accent} fill={theme.colors.accent} style={{ marginRight: 6 }} />}
                <Body style={{ flex: 1, fontFamily: theme.fontFamily.sansSemiBold }} numberOfLines={1}>
                  {item.title || 'Untitled'}
                </Body>
              </View>
              {!!item.content && (
                <Body style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }} numberOfLines={2}>
                  {item.content}
                </Body>
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs, gap: theme.spacing.xs }}>
                <Label>{NOTE_CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category}</Label>
                {!!item.linked_verse && <Label style={{ color: theme.colors.primary }}>· {item.linked_verse}</Label>}
              </View>
            </View>
          </PressableScale>
        )}
      />

      <PressableScale
        onPress={() => router.push({ pathname: '/notes/[id]', params: { id: 'new' } })}
        style={{ position: 'absolute', right: theme.spacing.lg, bottom: theme.spacing.lg }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.shadow.floating,
          }}
        >
          <Plus size={24} color={theme.colors.onPrimary} strokeWidth={2.4} />
        </View>
      </PressableScale>
    </SafeAreaView>
  );
}
