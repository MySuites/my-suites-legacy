import { renderHook } from "@testing-library/react-native";
import { useColorScheme } from "../../hooks/ui/use-color-scheme";

jest.mock("react-native", () => {
    const RN = jest.requireActual("react-native");
    return Object.defineProperty(RN, "useColorScheme", {
        get: jest.fn(() => () => "dark"),
        configurable: true,
    });
});

// Mock AppThemeProvider context 
// We can't easily import ThemePreferenceContext if not exported or if inside provider file.
// But we can Mock the context value via wrapper.

import React from 'react';
import { ThemePreferenceContext } from '../../providers/AppThemeProvider';

describe("useColorScheme (web)", () => {
    it('returns "dark" when context provides it', () => {
        const Provider = ThemePreferenceContext.Provider;
        const wrapper = ({ children }: any) => (
            <Provider value={{ preference: 'dark', effectiveScheme: 'dark', setPreference: jest.fn() }}>
                {children}
            </Provider>
        );

        const { result } = renderHook(() => useColorScheme(), { wrapper });

        expect(result.current).toBe("dark");
    });
});
