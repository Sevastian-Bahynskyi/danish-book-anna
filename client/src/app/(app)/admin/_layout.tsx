import { Redirect, Stack } from 'expo-router';

import { useProfile } from '@/lib/auth';
import { useTheme } from '@/theme';

// Only the admin account (the very first account) can open these pages.
// The database checks the role again on every admin call.
export default function AdminLayout() {
  const profile = useProfile();
  const { c } = useTheme();
  if (profile?.role !== 'admin') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }} />;
}
