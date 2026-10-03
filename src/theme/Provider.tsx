import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { getThemeOverride, setThemeOverride } from '@/services/prefs';
import { ColorToken, darkColors, lightColors, ThemeColors } from '@/theme/tokens';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ThemeScheme = 'light' | 'dark';

export interface AppTheme {
  scheme: ThemeScheme;
  mode: ThemeMode;
  colors: ThemeColors;
  color: (token: ColorToken) => string;
  setMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;
    getThemeOverride().then((stored) => {
      if (mounted) setModeState(stored);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const scheme: ThemeScheme =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const theme = useMemo<AppTheme>(() => {
    const colors = scheme === 'dark' ? darkColors : lightColors;
    return {
      scheme,
      mode,
      colors,
      color: (token) => colors[token],
      setMode: async (next) => {
        setModeState(next);
        await setThemeOverride(next);
      },
    };
  }, [scheme, mode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): AppTheme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return context;
}