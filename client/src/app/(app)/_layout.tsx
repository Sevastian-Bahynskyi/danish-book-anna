import { Stack } from 'expo-router';
import { View } from 'react-native';

import { TabBar, TopBar, useIsWide } from '@/components/nav';
import { useTheme } from '@/theme';

export default function AppLayout() {
  const { c } = useTheme();
  const wide = useIsWide();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <TopBar />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />
      </View>
      {!wide && <TabBar />}
    </View>
  );
}
