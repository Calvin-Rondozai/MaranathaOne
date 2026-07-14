import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { BookOpen, ChevronRight, Plus } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { READING_PLANS, ReadingPlan } from '@/database/readingPlans';
import { getCustomPlans } from '@/database/customReadingPlans';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Label } from '@/components/ui/Typography';

export default function ReadingPlansScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const [customPlans, setCustomPlans] = useState<ReadingPlan[]>([]);

  useFocusEffect(
    useCallback(() => {
      getCustomPlans(db).then(setCustomPlans);
    }, [db])
  );

  const renderPlan = (plan: ReadingPlan) => (
    <PressableScale
      key={plan.id}
      onPress={() => router.push({ pathname: '/more/reading-plans/[planId]', params: { planId: plan.id } })}
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
          marginBottom: theme.spacing.sm,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radius.sm,
            backgroundColor: theme.colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOpen size={18} color={theme.colors.primary} strokeWidth={1.75} />
        </View>
        <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
          <Body style={{ fontFamily: theme.fontFamily.sansSemiBold }}>{plan.title}</Body>
          <Label style={{ marginTop: 2 }}>{plan.description}</Label>
        </View>
        <ChevronRight size={18} color={theme.colors.textFaint} />
      </View>
    </PressableScale>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <PressableScale onPress={() => router.push('/more/reading-plans/new')} scaleTo={0.98}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: theme.spacing.xs,
              backgroundColor: theme.colors.primarySoft,
              borderRadius: theme.radius.md,
              padding: theme.spacing.sm + 2,
              marginBottom: theme.spacing.md,
            }}
          >
            <Plus size={18} color={theme.colors.primary} />
            <Body style={{ color: theme.colors.primary, fontFamily: theme.fontFamily.sansSemiBold }}>
              Create Your Own Plan
            </Body>
          </View>
        </PressableScale>

        {customPlans.length > 0 && (
          <>
            <Label style={{ marginBottom: theme.spacing.sm }}>Your Plans</Label>
            {customPlans.map(renderPlan)}
          </>
        )}

        <Label style={{ marginBottom: theme.spacing.sm, marginTop: customPlans.length > 0 ? theme.spacing.sm : 0 }}>
          Suggested Plans
        </Label>
        {READING_PLANS.map(renderPlan)}
      </ScrollView>
    </SafeAreaView>
  );
}
