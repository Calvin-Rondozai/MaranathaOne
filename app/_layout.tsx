import { useCallback, useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// moti re-exports a SafeAreaView from its own bundle that internally imports the
// deprecated React Native one — the warning fires just from moti being loaded, not
// from any SafeAreaView we render (every screen already uses
// react-native-safe-area-context). Nothing to fix on our end; silence the noise.
LogBox.ignoreLogs(['SafeAreaView has been deprecated']);
import { useFonts, Lora_400Regular, Lora_500Medium, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import {
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/database/migrate';
import { TabBarVisibilityProvider } from '@/hooks/useTabBarVisibility';
// Registers the foreground notification handler on every launch — reminders are
// scheduled with the OS and survive restarts, but this in-memory handler config
// (how a notification behaves while the app is open) must be set up each session.
import '@/services/notifications';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    Raleway_300Light,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });
  const [dbReady, setDbReady] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded && dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          onInit={migrateDbIfNeeded}
          onError={(error) => console.error('Database init failed', error)}
        >
          <ThemeProvider>
            <TabBarVisibilityProvider>
              <RootReady onReady={() => setDbReady(true)} />
            </TabBarVisibilityProvider>
          </ThemeProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
