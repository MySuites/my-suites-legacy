import React from 'react';
import { useColorScheme as _useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UIThemeProvider } from '@mycsuite/ui';

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = _useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  return <UIThemeProvider value={theme}>{children}</UIThemeProvider>;
};

export default AppThemeProvider;
