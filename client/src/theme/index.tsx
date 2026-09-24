import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Platform, useColorScheme } from 'react-native';

import { palette, type Colors } from './tokens';

export type ThemePref = 'system' | 'light' | 'dark';
type Theme = { c: Colors; dark: boolean; pref: ThemePref; setPref: (p: ThemePref) => void };

const KEY = 'dpa.theme';
const ThemeContext = createContext<Theme>({ c: palette.light, dark: false, pref: 'system', setPref: () => {} });

const isPref = (v: unknown): v is ThemePref => v === 'system' || v === 'light' || v === 'dark';

// On web AsyncStorage is localStorage, so read it synchronously to avoid a flash of the wrong theme.
function initialPref(): ThemePref {
  if (Platform.OS !== 'web') return 'system';
  try {
    const v = window.localStorage.getItem(KEY);
    return isPref(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [pref, setPrefState] = useState<ThemePref>(initialPref);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (isPref(v)) setPrefState(v);
    });
  }, []);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    AsyncStorage.setItem(KEY, p);
  }, []);

  const dark = pref === 'system' ? system === 'dark' : pref === 'dark';
  const c = dark ? palette.dark : palette.light;

  // Web: keep the page behind the app, the browser UI colour and form controls in the chosen theme.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const root = document.documentElement;
    root.style.background = c.bg;
    document.body.style.background = c.bg;
    root.style.colorScheme = dark ? 'dark' : 'light';
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', c.bg));
  }, [c.bg, dark]);

  return <ThemeContext.Provider value={{ c, dark, pref, setPref }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export * from './tokens';
