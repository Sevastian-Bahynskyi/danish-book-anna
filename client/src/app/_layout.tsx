import '@/global.css';

import { Neucha_400Regular } from '@expo-google-fonts/neucha';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { Stack, router, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Loading } from '@/components/ui';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

// The page a link pointed to (for example /chapter/13). A signed-out reader is
// sent to the login screen first; after signing in they land back on it.
function linkedPage(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const base = Constants.expoConfig?.experiments?.baseUrl ?? '';
  const path = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : window.location.pathname;
  if (!path || path === '/' || path === '/login' || !/^\/[\w\-/.]*$/.test(path)) return null;
  return path;
}

function Routes() {
  const { state } = useAuth();
  const { c, dark } = useTheme();
  const pending = useRef(linkedPage());
  const wasSignedOut = useRef(false);
  useEffect(() => {
    if (state.status !== 'loading') SplashScreen.hideAsync();
    if (state.status === 'signedOut') wasSignedOut.current = true;
    if (state.status !== 'ready') return;
    const target = pending.current;
    pending.current = null;
    if (target && wasSignedOut.current) router.replace(target as Href);
  }, [state.status]);
  if (state.status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}>
        <Loading label="Відкриваємо книжку…" />
      </View>
    );
  }
  const ready = state.status === 'ready';
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Protected guard={ready}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!ready}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } }));
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Neucha_400Regular });
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.lang = 'uk';
  }, []);
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
