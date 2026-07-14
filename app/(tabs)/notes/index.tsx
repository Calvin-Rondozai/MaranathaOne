import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { SectionList, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { router, useFocusEffect, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { NotebookPen, Pin, Plus, Search as SearchIcon, Archive, Trash2 } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { deleteNote, getNotes, Note, NOTE_CATEGORIES, NoteCategory, parseChecklist, toggleNotePinned } from '@/database/notes';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Heading, Label } from '@/components/ui/Typography';

function dayKey(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

// Apple Notes-style date grouping: Today / Yesterday / Previous 7 Days / Earlier.
function groupByDate(notes: Note[]): { title: string; data: Note[] }[] {
  const today = dayKey(new Date());
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;
  const buckets: Record<string, Note[]> = { Today: [], Yesterday: [], 'Previous 7 Days': [], Earlier: [] };
  for (const note of notes) {
    const t = dayKey(new Date(note.created_date));
    if (t === today) buckets.Today.push(note);
    else if (t === yesterday) buckets.Yesterday.push(note);
    else if (t > weekAgo) buckets['Previous 7 Days'].push(note);
    else buckets.Earlier.push(note);
  }
  return Object.entries(buckets)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({ title, data }));
}

export default function NotesListScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
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
        <PressableScale onPress={() => setShowArchived((v) => !v)} style={{ padding: theme.spacing.xs }}>
          <Archive size={20} color={showArchived ? theme.colors.primary : theme.colors.text} strokeWidth={1.75} />
        </PressableScale>
      ),
    });
  }, [navigation, theme, showArchived]);

  const pinned = useMemo(() => notes.filter((n) => n.pinned), [notes]);
  const unpinned = useMemo(() => notes.filter((n) => !n.pinned), [notes]);
  const sections = useMemo(() => {
    const dateSections = groupByDate(unpinned);
    return pinned.length ? [{ title: 'Pinned', data: pinned }, ...dateSections] : dateSections;
  }, [pinned, unpinned]);

  const handlePin = async (note: Note) => {
    await toggleNotePinned(db, note.id);
    refresh();
  };
  const handleDelete = async (note: Note) => {
    await deleteNote(db, note.id);
    refresh();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[]}>
      <View style={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.sm, gap: theme.spacing.sm }}>
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

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0, paddingBottom: theme.spacing.xxl }}
        stickySectionHeadersEnabled={false}
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
        renderSectionHeader={({ section }) => (
          <Label style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.xs, fontSize: theme.fontSize.sm }}>
            {section.title}
          </Label>
        )}
        renderItem={({ item }) => {
          const items = parseChecklist(item.checklist);
          return (
            <Swipeable
              renderRightActions={() => (
                <View style={{ flexDirection: 'row' }}>
                  <PressableScale onPress={() => handlePin(item)}>
                    <View
                      style={{
                        width: 72,
                        height: '100%',
                        backgroundColor: theme.colors.accent,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: theme.radius.md,
                        marginLeft: theme.spacing.xs,
                      }}
                    >
                      <Pin size={18} color={theme.colors.onAccent ?? '#fff'} fill={item.pinned ? theme.colors.onAccent ?? '#fff' : 'transparent'} />
                      <Label style={{ color: theme.colors.onAccent ?? '#fff', marginTop: 2 }}>{item.pinned ? 'Unpin' : 'Pin'}</Label>
                    </View>
                  </PressableScale>
                  <PressableScale onPress={() => handleDelete(item)}>
                    <View
                      style={{
                        width: 72,
                        height: '100%',
                        backgroundColor: theme.colors.danger,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: theme.radius.md,
                        marginLeft: theme.spacing.xs,
                      }}
                    >
                      <Trash2 size={18} color="#fff" />
                      <Label style={{ color: '#fff', marginTop: 2 }}>Delete</Label>
                    </View>
                  </PressableScale>
                </View>
              )}
            >
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
                  {items.length > 0 ? (
                    <Body style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }} numberOfLines={2}>
                      {items.filter((i) => i.done).length}/{items.length} checked · {items[0].text || 'List item'}
                    </Body>
                  ) : (
                    !!item.content && (
                      <Body style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }} numberOfLines={2}>
                        {item.content}
                      </Body>
                    )
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs, gap: theme.spacing.xs }}>
                    <Label>{NOTE_CATEGORIES.find((c) => c.key === item.category)?.label ?? item.category}</Label>
                    {!!item.linked_verse && <Label style={{ color: theme.colors.primary }}>· {item.linked_verse}</Label>}
                  </View>
                </View>
              </PressableScale>
            </Swipeable>
          );
        }}
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
