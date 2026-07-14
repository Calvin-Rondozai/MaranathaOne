import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { getQuarterData, SabbathLesson, SabbathQuarterData } from '@/database/sabbathSchool';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Heading, Label } from '@/components/ui/Typography';

const DAY_NAMES = ['Sabbath', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function SabbathLessonReaderScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const { code, week: rawWeek } = useLocalSearchParams<{ code: string; week: string }>();
  const weekNumber = Number(rawWeek);
  const [quarter, setQuarter] = useState<SabbathQuarterData | null>(null);

  useEffect(() => {
    if (code) getQuarterData(db, code).then(setQuarter);
  }, [db, code]);

  const lesson: SabbathLesson | undefined = quarter?.lessons.find((l) => l.week === weekNumber);
  const prevLesson = quarter?.lessons.find((l) => l.week === weekNumber - 1);
  const nextLesson = quarter?.lessons.find((l) => l.week === weekNumber + 1);

  useLayoutEffect(() => {
    navigation.setOptions({ title: lesson ? `Lesson ${lesson.week}` : '' });
  }, [navigation, lesson]);

  if (!lesson) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Heading style={{ marginBottom: theme.spacing.lg }}>{lesson.title}</Heading>
        {lesson.days.map((day, i) => (
          <View key={i} style={{ marginBottom: theme.spacing.xl }}>
            <Label style={{ color: theme.colors.primary, marginBottom: 2 }}>
              {DAY_NAMES[day.day - 1] ?? `Day ${day.day}`} · {day.date}
            </Label>
            <Heading style={{ fontSize: theme.fontSize.lg, marginBottom: theme.spacing.sm }}>{day.title}</Heading>
            {day.blocks.map((block, bi) => {
              if (block.type === 'heading') {
                return (
                  <Body
                    key={bi}
                    style={{
                      fontFamily: theme.fontFamily.sansSemiBold,
                      fontSize: theme.fontSize.base,
                      marginTop: theme.spacing.sm,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {block.text}
                  </Body>
                );
              }
              if (block.type === 'quote') {
                return (
                  <View
                    key={bi}
                    style={{
                      borderLeftWidth: 3,
                      borderLeftColor: theme.colors.accent,
                      backgroundColor: theme.colors.accentSoft,
                      borderRadius: theme.radius.sm,
                      padding: theme.spacing.sm + 2,
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    <Body
                      style={{
                        fontFamily: theme.fontFamily.serifItalic,
                        fontSize: theme.fontSize.base,
                        lineHeight: theme.lineHeight.base,
                        color: theme.colors.onAccent,
                      }}
                    >
                      {block.text}
                    </Body>
                  </View>
                );
              }
              return (
                <Body
                  key={bi}
                  style={{
                    fontFamily: theme.fontFamily.serifRegular,
                    fontSize: theme.fontSize.md,
                    lineHeight: theme.lineHeight.lg,
                    textAlign: 'justify',
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {block.text}
                </Body>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
      >
        <PressableScale
          disabled={!prevLesson}
          onPress={() =>
            prevLesson &&
            router.replace({ pathname: '/more/sabbath-school/[code]/[week]', params: { code: code ?? '', week: String(prevLesson.week) } })
          }
          style={{ flex: 1, opacity: prevLesson ? 1 : 0.35 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md }}>
            <ChevronLeft size={16} color={theme.colors.text} />
            <Body style={{ marginLeft: 4, fontSize: theme.fontSize.sm }} numberOfLines={1}>
              Previous
            </Body>
          </View>
        </PressableScale>
        <View style={{ width: 1, backgroundColor: theme.colors.border }} />
        <PressableScale
          disabled={!nextLesson}
          onPress={() =>
            nextLesson &&
            router.replace({ pathname: '/more/sabbath-school/[code]/[week]', params: { code: code ?? '', week: String(nextLesson.week) } })
          }
          style={{ flex: 1, opacity: nextLesson ? 1 : 0.35 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md }}>
            <Body style={{ marginRight: 4, fontSize: theme.fontSize.sm }} numberOfLines={1}>
              Next
            </Body>
            <ChevronRight size={16} color={theme.colors.text} />
          </View>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}
