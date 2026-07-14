import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Compass } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Heading } from '@/components/ui/Typography';

export default function NotFoundScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.md,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.xl,
        }}
      >
        <Compass size={40} color={theme.colors.primary} strokeWidth={1.75} />
        <Heading>This page doesn’t exist</Heading>
        <Link href="/" style={{ marginTop: theme.spacing.sm }}>
          <Body style={{ color: theme.colors.primary }}>Go to Home</Body>
        </Link>
      </View>
    </>
  );
}
