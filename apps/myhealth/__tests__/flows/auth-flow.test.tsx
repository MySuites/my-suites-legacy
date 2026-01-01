import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AuthScreen from '../../app/auth/index';
import { supabase } from '@mysuite/auth';
import * as RN from 'react-native';

const mockRN = RN;

// Mock Dependencies
jest.mock('@mysuite/ui', () => {
    return {
        RaisedButton: ({ title, onPress }: any) => (
            <mockRN.TouchableOpacity onPress={onPress}>
                <mockRN.Text>{title}</mockRN.Text>
            </mockRN.TouchableOpacity>
        ),
        useUITheme: () => ({ light: 'white', dark: 'black' }), // Simplified theme
    };
});

jest.mock('@mysuite/auth', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
        }
    },
    useAuth: jest.fn(() => ({ session: null })),
}));

describe('Auth Flow', () => {
    const mockSignUp = supabase.auth.signUp as jest.Mock;
    const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = render(<AuthScreen />);
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Sign Up')).toBeTruthy();
    });

    it('handles successful sign in', async () => {
        mockSignIn.mockResolvedValueOnce({ error: null });

        const { getByPlaceholderText, getByText, findByText } = render(<AuthScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.press(getByText('Sign In'));

        expect(mockSignIn).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });

        const successMessage = await findByText('Signed in.');
        expect(successMessage).toBeTruthy();
    });

    it('handles failed sign in', async () => {
        mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } });

        const { getByPlaceholderText, getByText, findByText } = render(<AuthScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'wrongpass');
        fireEvent.press(getByText('Sign In'));

        const errorMessage = await findByText('Invalid login credentials');
        expect(errorMessage).toBeTruthy();
    });

    it('handles successful sign up', async () => {
        mockSignUp.mockResolvedValueOnce({ data: { session: { user: { id: '123' } } }, error: null });

        const { getByPlaceholderText, getByText, findByText } = render(<AuthScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'new@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'newpass');
        fireEvent.press(getByText('Sign Up'));

        expect(mockSignUp).toHaveBeenCalledWith({
            email: 'new@example.com',
            password: 'newpass',
            options: expect.objectContaining({
                emailRedirectTo: expect.stringContaining('/auth'),
            }),
        });

        const successMessage = await findByText('Signed up and signed in.');
        expect(successMessage).toBeTruthy();
    });

    it('handles sign up requiring email confirmation', async () => {
        // Session is null implies email confirmation needed
        mockSignUp.mockResolvedValueOnce({ data: { session: null }, error: null });

        const { getByPlaceholderText, getByText, findByText } = render(<AuthScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'confirm@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'confirmpass');
        fireEvent.press(getByText('Sign Up'));

        const infoMessage = await findByText('Check your email for a confirmation link.');
        expect(infoMessage).toBeTruthy();
    });

     it('handles failed sign up', async () => {
        mockSignUp.mockResolvedValueOnce({ error: { message: 'User already registered' } });

        const { getByPlaceholderText, getByText, findByText } = render(<AuthScreen />);

        fireEvent.changeText(getByPlaceholderText('Email'), 'existing@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
        fireEvent.press(getByText('Sign Up'));

        const errorMessage = await findByText('User already registered');
        expect(errorMessage).toBeTruthy();
    });
});
