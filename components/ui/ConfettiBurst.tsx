import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

const COLORS = ['#7C3AED', '#B7791F', '#1E8A5B', '#C2410C', '#A78BFA', '#E3B15B'];
const PIECE_COUNT = 16;

export function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => {
        const angle = (Math.PI * 2 * i) / PIECE_COUNT + Math.random() * 0.4;
        const distance = 36 + Math.random() * 34;
        return {
          key: i,
          color: COLORS[i % COLORS.length],
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          rotate: Math.round(Math.random() * 360),
          delay: Math.round(Math.random() * 60),
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active]
  );

  if (!active) return null;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 10 }}>
      {pieces.map((p) => (
        <MotiView
          key={p.key}
          from={{ opacity: 1, translateX: 0, translateY: 0, scale: 1, rotate: '0deg' }}
          animate={{ opacity: 0, translateX: p.dx, translateY: p.dy, scale: 0.4, rotate: `${p.rotate}deg` }}
          transition={{ type: 'timing', duration: 700, delay: p.delay }}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            borderRadius: 2,
            backgroundColor: p.color,
          }}
        />
      ))}
    </View>
  );
}
