import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import {
    getLocalThemeMode,
    saveLocalThemeMode,
} from '@/services/localfileservice';
import { AppThemeMode } from '@/types/apptheme';

type AppThemeColors = {
  screen: string;
  card: string;
  cardSoft: string;
  input: string;
  border: string;

  text: string;
  textMuted: string;
  textSoft: string;

  accent: string;
  accentText: string;

  success: string;
  error: string;
};

const themeColors: Record<AppThemeMode, AppThemeColors> = {
  dark: {
    screen: '#0f0f11',
    card: '#18181c',
    cardSoft: '#1f1f25',
    input: '#1f1f25',
    border: 'rgba(255,255,255,0.09)',

    text: '#f6f2ec',
    textMuted: '#aaa6a0',
    textSoft: '#6d6963',

    accent: '#b8a98a',
    accentText: '#0f0f11',

    success: '#6dbf8e',
    error: '#e06e6e',
  },

  light: {
    screen: '#f4f3f1',
    card: '#fffefd',
    cardSoft: '#ece9e5',
    input: '#f7f6f4',
    border: 'rgba(36,32,28,0.12)',

    text: '#25221f',
    textMuted: '#625d56',
    textSoft: '#8b857c',

    accent: '#c7c3bb',
    accentText: '#25221f',

    success: '#4f9f72',
    error: '#c75a5a',
    },
};

type AppThemeContextValue = {
  themeMode: AppThemeMode;
  colors: AppThemeColors;
  isThemeLoading: boolean;
  setThemeMode: (mode: AppThemeMode) => Promise<void>;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children: ReactNode;
};

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<AppThemeMode>('dark');
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    loadThemeMode();
  }, []);

  async function loadThemeMode() {
    try {
      const savedThemeMode = await getLocalThemeMode();
      setThemeModeState(savedThemeMode);
    } catch (error) {
      console.log('load theme mode error:', error);
      setThemeModeState('dark');
    } finally {
      setIsThemeLoading(false);
    }
  }

  async function setThemeMode(mode: AppThemeMode) {
    setThemeModeState(mode);
    await saveLocalThemeMode(mode);
  }

  return (
    <AppThemeContext.Provider
      value={{
        themeMode,
        colors: themeColors[themeMode],
        isThemeLoading,
        setThemeMode,
      }}
    >
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const value = useContext(AppThemeContext);

  if (!value) {
    throw new Error('useAppTheme должен использоваться внутри AppThemeProvider');
  }

  return value;
}