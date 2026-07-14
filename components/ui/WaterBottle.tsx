import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

import { useTheme } from '@/theme/ThemeProvider';

type Props = { progress: number; size?: number };

export function WaterBottle({ progress, size = 96 }: Props) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const bodyWidth = size * 0.62;
  const bodyHeight = size * 0.82;
  const neckWidth = size * 0.28;
  const neckHeight = size * 0.16;

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: neckWidth,
          height: neckHeight,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surfaceMuted,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
        }}
      />
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          overflow: 'hidden',
          justifyContent: 'flex-end',
          backgroundColor: theme.colors.surfaceMuted,
        }}
      >
        <MotiView
          animate={{ height: `${clamped * 100}%` }}
          transition={{ type: 'timing', duration: 500 }}
          style={{ width: '100%', backgroundColor: theme.colors.primary }}
        />
      </View>
    </View>
  );
}
