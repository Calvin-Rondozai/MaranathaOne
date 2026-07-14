import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotesStackLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontFamily: theme.fontFamily.serifSemiBold, fontSize: theme.fontSize.md },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Notes' }} />
      <Stack.Screen name="[id]" options={{ title: '', presentation: 'modal' }} />
    </Stack>
  );
}
