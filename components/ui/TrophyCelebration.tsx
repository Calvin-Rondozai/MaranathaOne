import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Trophy } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { Body } from '@/components/ui/Typography';

const SPARKLE_COLORS = ['#7C3AED', '#B7791F', '#1E8A5B', '#E3B15B', '#A78BFA'];
const SPARKLE_COUNT = 18;

export function TrophyCelebration({ active }: { active: boolean }) {
  const theme = useTheme();

  const sparkles = useMemo(
    () =>
      Array.from({ length: SPARKLE_COUNT }, (_, i) => {
        const angle = (Math.PI * 2 * i) / SPARKLE_COUNT + Math.random() * 0.3;
        const distance = 90 + Math.random() * 70;
        return {
          key: i,
          color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          delay: Math.round(Math.random() * 120),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active]
  );

  if (!active) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <View style={{ width: 0, height: 0, alignItems: 'center', justifyContent: 'center' }}>
        {sparkles.map((s) => (
          <MotiView
            key={s.key}
            from={{ opacity: 1, translateX: 0, translateY: 0, scale: 1 }}
            animate={{ opacity: 0, translateX: s.dx, translateY: s.dy, scale: 0.3 }}
            transition={{ type: 'timing', duration: 900, delay: s.delay }}
            style={{ position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: s.color }}
          />
        ))}
      </View>

      <MotiView
        from={{ opacity: 0, scale: 0.4, translateY: 12 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: 'spring', damping: 9, stiffness: 160 }}
        style={{
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.xl,
          paddingVertical: theme.spacing.lg,
          paddingHorizontal: theme.spacing.xl,
          alignItems: 'center',
          gap: theme.spacing.sm,
          ...theme.shadow.floating,
        }}
      >
        <MotiView
          from={{ rotate: '-8deg' }}
          animate={{ rotate: '8deg' }}
          transition={{ type: 'timing', duration: 260, loop: true, repeatReverse: true }}
        >
          <Trophy size={48} color={theme.colors.accent} strokeWidth={1.5} />
        </MotiView>
        <Body style={{ fontFamily: theme.fontFamily.sansSemiBold, fontSize: theme.fontSize.lg }}>
          Plan Complete! 🎉
        </Body>
      </MotiView>
    </View>
  );
}
