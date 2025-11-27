/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Light mode palette
    text: '#2D1F1F', // Text Color
    background: '#FFF5F5', // Background
    primary: '#FF6F61', // Primary
    accent: '#84A98C', // Accent
    surface: '#EAD4D4', // Surface / border
    icon: '#2D1F1F',
    tabIconDefault: '#EAD4D4',
    tabIconSelected: '#FF6F61',
  },
  dark: {
    // Dark mode palette
    text: '#FFF5F5',
    background: '#2D1F1F',
    primary: '#FF8A80',
    accent: '#A5D6A7',
    surface: '#3E2C2C',
    icon: '#EAD4D4',
    tabIconDefault: '#EAD4D4',
    tabIconSelected: '#FF8A80',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
