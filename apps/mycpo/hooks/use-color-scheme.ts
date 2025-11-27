import { useColorScheme as rnUseColorScheme } from 'react-native';
import { useContext } from 'react';
import { ThemePreferenceContext } from '@/app/providers/AppThemeProvider';

export const useColorScheme = () => {
	const ctx = useContext(ThemePreferenceContext);
	if (ctx) {
		return ctx.effectiveScheme;
	}
	return rnUseColorScheme();
};

export default useColorScheme;
