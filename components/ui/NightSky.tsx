import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';

type Star = { top: `${number}%`; left: `${number}%`; size: number; delay: number };

// Deterministic per-mount "random" stars — Math.random() is fine here (purely decorative,
// not persisted or part of any workflow-replay concern), just seeded once via useMemo so
// they don't reshuffle on every re-render.
function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    top: `${Math.round(Math.random() * 80)}%`,
    left: `${Math.round(Math.random() * 96)}%`,
    size: 1.5 + Math.random() * 2,
    delay: Math.round(Math.random() * 2000),
  }));
}

export function NightSky({ count = 18 }: { count?: number }) {
  const stars = useMemo(() => makeStars(count), [count]);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
      {stars.map((star, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.15 }}
          animate={{ opacity: 0.9 }}
          transition={{ type: 'timing', duration: 1800, delay: star.delay, loop: true, repeatReverse: true }}
          style={{
            position: 'absolute',
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            borderRadius: star.size,
            backgroundColor: '#FFFFFF',
          }}
        />
      ))}
    </View>
  );
}
