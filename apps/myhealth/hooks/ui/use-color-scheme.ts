import { useContext } from "react";
import { ThemePreferenceContext } from "../../providers/AppThemeProvider";

export const useColorScheme = () => {
	const ctx = useContext(ThemePreferenceContext);
	return ctx?.effectiveScheme || "light";
};

export default useColorScheme;
