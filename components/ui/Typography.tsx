import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Heading({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        { fontFamily: theme.fontFamily.serifSemiBold, fontSize: theme.fontSize.xl, color: theme.colors.text },
        style,
      ]}
      {...props}
    />
  );
}

export function Body({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: theme.fontFamily.sansRegular,
          fontSize: theme.fontSize.base,
          lineHeight: theme.lineHeight.base,
          color: theme.colors.text,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function Label({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: theme.fontFamily.sansSemiBold,
          fontSize: theme.fontSize.xs,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: theme.colors.textMuted,
        },
        style,
      ]}
      {...props}
    />
  );
}

export function ScriptureQuote({ style, ...props }: TextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: theme.fontFamily.serifRegular,
          fontSize: theme.fontSize.lg,
          lineHeight: theme.lineHeight.xl,
          color: theme.colors.text,
        },
        style,
      ]}
      {...props}
    />
  );
}
