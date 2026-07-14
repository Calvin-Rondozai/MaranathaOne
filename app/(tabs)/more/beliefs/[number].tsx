import React, { useLayoutEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icon';

import { useTheme } from '@/theme/ThemeProvider';
import { getFundamentalBelief, getFundamentalBeliefs } from '@/database/fundamentalBeliefs';
import { PressableScale } from '@/components/ui/PressableScale';
import { Body, Heading, Label } from '@/components/ui/Typography';

export default function BeliefDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { number } = useLocalSearchParams<{ number: string }>();
  const n = Number(number);
  const belief = getFundamentalBelief(n);
  const total = getFundamentalBeliefs().length;

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Fundamental Beliefs' });
  }, [navigation]);

  if (!belief) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }}>
        <Label style={{ marginBottom: 4 }}>Belief {belief.number} of {total}</Label>
        <Heading style={{ marginBottom: theme.spacing.md }}>{belief.title}</Heading>
        {belief.content.split('\n\n').map((para, i) => (
          <Body
            key={i}
            style={{
              fontFamily: theme.fontFamily.serifRegular,
              fontSize: theme.fontSize.md,
              lineHeight: theme.lineHeight.lg,
              marginBottom: theme.spacing.sm,
            }}
          >
            {para}
          </Body>
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
          disabled={n <= 1}
          onPress={() => n > 1 && router.replace({ pathname: '/more/beliefs/[number]', params: { number: String(n - 1) } })}
          style={{ flex: 1, opacity: n > 1 ? 1 : 0.35 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md }}>
            <ChevronLeft size={16} color={theme.colors.text} />
            <Body style={{ marginLeft: 4, fontSize: theme.fontSize.sm }}>Previous</Body>
          </View>
        </PressableScale>
        <View style={{ width: 1, backgroundColor: theme.colors.border }} />
        <PressableScale
          disabled={n >= total}
          onPress={() => n < total && router.replace({ pathname: '/more/beliefs/[number]', params: { number: String(n + 1) } })}
          style={{ flex: 1, opacity: n < total ? 1 : 0.35 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md }}>
            <Body style={{ marginRight: 4, fontSize: theme.fontSize.sm }}>Next</Body>
            <ChevronRight size={16} color={theme.colors.text} />
          </View>
        </PressableScale>
      </View>
    </SafeAreaView>
  );
}
