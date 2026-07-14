import { Tabs } from 'expo-router';
import { BookOpen, Home, MoreHorizontal, NotebookPen, HeartHandshake } from '@/components/ui/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';
import { AnimatedTabIcon } from '@/components/navigation/AnimatedTabIcon';

export default function TabsLayout() {
  const theme = useTheme();
  const { visible } = useTabBarVisibility();
  const insets = useSafeAreaInsets();
  // The system nav bar (3-button or gesture pill) sits below the screen's safe area —
  // insets.bottom already accounts for either case, so add it on top of our own
  // content height instead of using a fixed height that ignores it.
  const barContentHeight = 58;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textFaint,
        tabBarStyle: {
          display: visible ? 'flex' : 'none',
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: barContentHeight + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fontFamily.sansMedium,
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon Icon={Home} focused={focused} color={color as string} dotColor={theme.colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon Icon={BookOpen} focused={focused} color={color as string} dotColor={theme.colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon Icon={NotebookPen} focused={focused} color={color as string} dotColor={theme.colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon Icon={HeartHandshake} focused={focused} color={color as string} dotColor={theme.colors.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused, color }) => (
            <AnimatedTabIcon Icon={MoreHorizontal} focused={focused} color={color as string} dotColor={theme.colors.primary} />
          ),
        }}
      />
    </Tabs>
  );
}
