import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { palette, type Colors } from './tokens';

type Theme = { c: Colors; dark: boolean };
const ThemeContext = createContext<Theme>({ c: palette.light, dark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const dark = useColorScheme() === 'dark';
  return <ThemeContext.Provider value={{ c: dark ? palette.dark : palette.light, dark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
export * from './tokens';
