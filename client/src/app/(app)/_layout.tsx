import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import { InstallGuide } from '@/components/InstallGuide';
import { TabBar, TopBar, useIsWide } from '@/components/nav';
import { autoOpenInstallGuide, openInstallGuide } from '@/lib/pwa';
import { useTheme } from '@/theme';

export default function AppLayout() {
  const { c } = useTheme();
  const wide = useIsWide();
  // The install guide opens by itself the first time a phone reader enters the
  // book, or whenever the link has ?install (Anna can send such a link).
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (new URLSearchParams(window.location.search).has('install')) {
      openInstallGuide();
      return;
    }
    const t = setTimeout(autoOpenInstallGuide, 900);
    return () => clearTimeout(t);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
      </View>
      {!wide && <TabBar />}
      <InstallGuide />
    </View>
  );
}
