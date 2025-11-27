import { createContext, useContext } from 'react';

export type AppTheme = {
  primary: string;
  accent: string;
  background: string;
  text: string;
  surface: string;
  icon?: string;
  tabIconDefault?: string;
  tabIconSelected?: string;
  [k: string]: any;
};

const defaultTheme: AppTheme = {
  primary: '#FF6F61',
  accent: '#84A98C',
  background: '#FFF5F5',
  text: '#2D1F1F',
  surface: '#EAD4D4',
  icon: '#2D1F1F',
  tabIconDefault: '#EAD4D4',
  tabIconSelected: '#FF6F61',
};

const ThemeContext = createContext<AppTheme>(defaultTheme);

export const UIThemeProvider = ({ value, children }: { value: AppTheme; children: React.ReactNode }) => {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useUITheme = () => useContext(ThemeContext);

export default ThemeContext;
