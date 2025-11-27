/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUITheme } from '@mycsuite/ui';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // call hooks unconditionally (rules of hooks)
  const uiTheme = useUITheme();
  const scheme = useColorScheme() ?? 'light';

  // prop override wins (explicit light/dark provided by caller)
  const colorFromProps = props[scheme];
  if (colorFromProps) return colorFromProps;

  // prefer tokens from the UI theme provider
  if (uiTheme && uiTheme[colorName]) return uiTheme[colorName];

  // fallback to Colors constant using the resolved scheme
  return Colors[scheme][colorName];
}
