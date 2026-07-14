import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';

export default function BibleStackLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: theme.fontFamily.serifSemiBold, fontSize: theme.fontSize.md },
        headerShadowVisible: false,
        headerBackTitleStyle: { fontFamily: theme.fontFamily.sansRegular },
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Bible' }} />
      <Stack.Screen name="search" options={{ title: 'Search', presentation: 'modal' }} />
      <Stack.Screen name="bookmarks" options={{ title: 'Saved Verses' }} />
      <Stack.Screen name="[book]" options={{ title: '' }} />
      <Stack.Screen name="[book]/[chapter]" options={{ title: '' }} />
    </Stack>
  );
}
