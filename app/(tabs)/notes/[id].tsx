import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Alert, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Bell, Check, Pin, Archive, Trash2, Minus, Plus } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import {
  createNote,
  deleteNote,
  getNote,
  Note,
  NOTE_CATEGORIES,
  NoteCategory,
  setNoteReminder,
  toggleNoteArchived,
  toggleNotePinned,
  updateNote,
} from '@/database/notes';
import {
  cancelNoteReminder,
  ensureNotificationSetup,
  notificationsAvailable,
  refreshPrayerReminders,
  scheduleNoteReminder,
} from '@/services/notifications';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Label } from '@/components/ui/Typography';

const pad = (n: number) => String(n).padStart(2, '0');

export default function NoteEditorScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id: string; linkedVerse?: string; category?: string }>();
  const isNew = params.id === 'new';

  const [existing, setExisting] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>((params.category as NoteCategory) || 'personal');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(9);
  const [reminderMinute, setReminderMinute] = useState(0);
  const linkedVerse = existing?.linked_verse ?? params.linkedVerse ?? null;

  useEffect(() => {
    if (isNew) return;
    getNote(db, Number(params.id)).then((note) => {
      if (!note) return;
      setExisting(note);
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setReminderEnabled(!!note.reminder_enabled);
      if (note.reminder_time) {
        const [h, m] = note.reminder_time.split(':').map(Number);
        setReminderHour(h);
        setReminderMinute(m);
      }
    });
  }, [db, isNew, params.id]);

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) {
      router.back();
      return;
    }
    let noteId = existing?.id ?? null;
    if (isNew) {
      noteId = await createNote(db, { title: title.trim() || 'Untitled', content, category, linked_verse: linkedVerse });
    } else if (existing) {
      await updateNote(db, existing.id, { title: title.trim() || 'Untitled', content, category });
    }
    if (category === 'prayer' || existing?.category === 'prayer') refreshPrayerReminders(db).catch(() => {});

    if (noteId != null) {
      const reminderTime = `${pad(reminderHour)}:${pad(reminderMinute)}`;
      await setNoteReminder(db, noteId, reminderEnabled ? reminderTime : null, reminderEnabled);
      if (reminderEnabled) {
        if (!notificationsAvailable) {
          Alert.alert(
            'Development build required',
            'Note reminders need a development build — this will work once the app is installed as a dev/standalone build.'
          );
        } else {
          const granted = await ensureNotificationSetup();
          if (granted) await scheduleNoteReminder(db, noteId, title.trim() || 'Untitled', reminderTime);
        }
      } else {
        await cancelNoteReminder(db, noteId);
      }
    }
    router.back();
  }, [db, isNew, existing, title, content, category, linkedVerse, reminderEnabled, reminderHour, reminderMinute]);

  const handleDelete = useCallback(async () => {
    if (existing) {
      await cancelNoteReminder(db, existing.id);
      await deleteNote(db, existing.id);
      if (existing.category === 'prayer') refreshPrayerReminders(db).catch(() => {});
      router.back();
    }
  }, [db, existing]);

  const handleTogglePin = useCallback(async () => {
    if (!existing) return;
    await toggleNotePinned(db, existing.id);
    setExisting({ ...existing, pinned: existing.pinned ? 0 : 1 });
  }, [db, existing]);

  const handleToggleArchive = useCallback(async () => {
    if (!existing) return;
    await toggleNoteArchived(db, existing.id);
    if (existing.category === 'prayer') refreshPrayerReminders(db).catch(() => {});
    router.back();
  }, [db, existing]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isNew ? 'New Note' : 'Edit Note',
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {!isNew && existing && (
            <>
              <PressableScale onPress={handleTogglePin} style={{ padding: theme.spacing.xs }}>
                <Pin
                  size={20}
                  color={existing.pinned ? theme.colors.accent : theme.colors.text}
                  fill={existing.pinned ? theme.colors.accent : 'transparent'}
                  strokeWidth={1.75}
                />
              </PressableScale>
              <PressableScale onPress={handleToggleArchive} style={{ padding: theme.spacing.xs }}>
                <Archive size={20} color={theme.colors.text} strokeWidth={1.75} />
              </PressableScale>
              <PressableScale onPress={handleDelete} style={{ padding: theme.spacing.xs }}>
                <Trash2 size={20} color={theme.colors.danger} strokeWidth={1.75} />
              </PressableScale>
            </>
          )}
          <PressableScale onPress={handleSave} style={{ padding: theme.spacing.xs }}>
            <Check size={22} color={theme.colors.primary} strokeWidth={2.25} />
          </PressableScale>
        </View>
      ),
    });
  }, [navigation, theme, isNew, existing, handleSave, handleDelete, handleTogglePin, handleToggleArchive]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={[]}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.md }}>
        {!!linkedVerse && (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: theme.colors.primarySoft,
              borderRadius: theme.radius.pill,
              paddingVertical: theme.spacing.xs,
              paddingHorizontal: theme.spacing.sm + 2,
            }}
          >
            <Body style={{ color: theme.colors.primary, fontSize: theme.fontSize.sm, fontFamily: theme.fontFamily.sansSemiBold }}>
              {linkedVerse}
            </Body>
          </View>
        )}

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          placeholderTextColor={theme.colors.textFaint}
          style={{
            fontFamily: theme.fontFamily.serifSemiBold,
            fontSize: theme.fontSize.xl,
            color: theme.colors.text,
          }}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
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

        <View
          style={{
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.md,
            padding: theme.spacing.sm + 2,
            gap: theme.spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Bell size={16} color={theme.colors.primary} strokeWidth={1.75} />
            <Body style={{ flex: 1, marginLeft: theme.spacing.xs, fontFamily: theme.fontFamily.sansMedium }}>
              Remind me
            </Body>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
            />
          </View>
          {reminderEnabled && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.lg }}>
              <TimeStepper value={reminderHour} onChange={(v) => setReminderHour(((v % 24) + 24) % 24)} />
              <Body style={{ fontFamily: theme.fontFamily.sansSemiBold, fontSize: theme.fontSize.lg }}>:</Body>
              <TimeStepper value={reminderMinute} onChange={(v) => setReminderMinute(((v % 60) + 60) % 60)} step={5} />
            </View>
          )}
          {!notificationsAvailable && reminderEnabled && (
            <Body style={{ fontSize: theme.fontSize.xs, color: theme.colors.textMuted }}>
              Needs a development build to actually fire.
            </Body>
          )}
        </View>

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your note…"
          placeholderTextColor={theme.colors.textFaint}
          multiline
          textAlignVertical="top"
          style={{
            fontFamily: theme.fontFamily.sansRegular,
            fontSize: theme.fontSize.base,
            lineHeight: theme.lineHeight.base,
            color: theme.colors.text,
            minHeight: 200,
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function TimeStepper({ value, onChange, step = 1 }: { value: number; onChange: (v: number) => void; step?: number }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
      <PressableScale onPress={() => onChange(value - step)} scaleTo={0.85}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Minus size={14} color={theme.colors.text} />
        </View>
      </PressableScale>
      <Body style={{ fontFamily: theme.fontFamily.sansSemiBold, fontSize: theme.fontSize.lg, minWidth: 28, textAlign: 'center' }}>
        {pad(value)}
      </Body>
      <PressableScale onPress={() => onChange(value + step)} scaleTo={0.85}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={14} color={theme.colors.text} />
        </View>
      </PressableScale>
    </View>
  );
}
