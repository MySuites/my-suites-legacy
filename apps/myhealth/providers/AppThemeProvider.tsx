import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/theme';
import { UIThemeProvider } from '@mysuite/ui';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

const THEME_PREF_KEY = 'theme-preference';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => Promise<void>;
  effectiveScheme: 'light' | 'dark';
};

export const ThemePreferenceContext = createContext<ThemePreferenceContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = rnUseColorScheme();
  const { colorScheme: nwColorScheme, setColorScheme: setNWColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  // Load preference on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_PREF_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored as ThemePreference);
          // Sync NativeWind to stored preference on load
          if (stored !== 'system') {
            setNWColorScheme(stored as 'light' | 'dark');
          }
        }
      } catch {
        // ignore
      }
    })();
  }, [setNWColorScheme]);

  // Use NativeWind's state as the source of truth for the rest of the app's context
  // This ensures that IF NativeWind takes a frame to update, the context matches that frame
  // No more staggered "flicker" between context-based and tailwind-based components.
  const effectiveScheme: 'light' | 'dark' = useMemo(() => {
    if (nwColorScheme) return nwColorScheme as 'light' | 'dark';
    return system === 'dark' ? 'dark' : 'light';
  }, [nwColorScheme, system]);

  const setPreference = async (p: ThemePreference) => {
    setPreferenceState(p);
    try {
      await AsyncStorage.setItem(THEME_PREF_KEY, p);
    } catch {
      // ignore
    }
    
    if (p === 'system') {
      setNWColorScheme('system');
    } else {
      setNWColorScheme(p);
    }
  };

  const theme = effectiveScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference, effectiveScheme }}>
      <UIThemeProvider value={theme}>{children}</UIThemeProvider>
    </ThemePreferenceContext.Provider>
  );
};

export const useThemePreference = () => {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) throw new Error('useThemePreference must be used within AppThemeProvider');
  return ctx;
};

export default AppThemeProvider;
