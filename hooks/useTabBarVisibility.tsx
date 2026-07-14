import React, { createContext, useContext, useState } from 'react';

type TabBarVisibility = { visible: boolean; setVisible: (visible: boolean) => void };

const TabBarVisibilityContext = createContext<TabBarVisibility | null>(null);

export function TabBarVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  return (
    <TabBarVisibilityContext.Provider value={{ visible, setVisible }}>{children}</TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility(): TabBarVisibility {
  const ctx = useContext(TabBarVisibilityContext);
  if (!ctx) throw new Error('useTabBarVisibility must be used within TabBarVisibilityProvider');
  return ctx;
}
