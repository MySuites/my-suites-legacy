import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../app/profile/index';
import SettingsScreen from '../../app/settings/index';
import { supabase, useAuth } from '@mysuite/auth';
import * as RN from 'react-native';

const mockRN = RN;
const { Alert } = RN;

// Mock Dependencies
jest.mock('../../components/profile/BodyWeightCard', () => {
    return {
        BodyWeightCard: ({ weight, onLogWeight }: any) => (
            <mockRN.View testID="body-weight-card">
                <mockRN.Text testID="current-weight">{weight ? `${weight} kg` : 'No Data'}</mockRN.Text>
                <mockRN.Button title="Log Weight" onPress={onLogWeight} />
            </mockRN.View>
        )
    };
});

jest.mock('../../components/profile/WeightLogModal', () => {
    return {
        WeightLogModal: ({ visible, onSave }: any) => visible ? (
            <mockRN.View testID="weight-log-modal">
                <mockRN.Button title="Save 75kg" onPress={() => onSave(75, new Date())} />
            </mockRN.View>
        ) : null
    };
});

jest.mock('../../components/ui/ProfileEditModal', () => {
    // Simple mock that calls onSave with new values when a "Save" button is pressed
    return {
        ProfileEditModal: ({ visible, onSave }: any) => visible ? (
            <mockRN.View testID="profile-edit-modal">
                <mockRN.Button title="Save Profile" onPress={() => onSave('NewUser', 'New Name')} />
            </mockRN.View>
        ) : null
    };
});

jest.mock('../../providers/AppThemeProvider', () => ({
    useThemePreference: () => ({ preference: 'system', setPreference: jest.fn() })
}));

jest.mock('@mysuite/ui', () => {
    return {
        useUITheme: () => ({ primary: 'blue', textMuted: 'gray' }),
        RaisedButton: ({ children, onPress }: any) => (
            <mockRN.View accessibilityRole="button">
                <mockRN.Text onPress={onPress}>RaisedButton</mockRN.Text>
                {children}
            </mockRN.View>
        ),
        useToast: () => ({ showToast: jest.fn() }),
        IconSymbol: () => <mockRN.View />,
        ThemeToggle: () => <mockRN.View testID="theme-toggle" />,
    };
});

jest.mock('../../components/ui/BackButton', () => {
    return {
        BackButton: () => <mockRN.View testID="back-button" />
    };
});

// Tests
describe('Profile Update Flow', () => {
    // In-Memory DB State
    let bodyMeasurements: any[] = [];

    beforeEach(() => {
        bodyMeasurements = [];
        
        // Mock User
        (useAuth as jest.Mock).mockReturnValue({
            user: { id: 'test-user-id' }
        });
        
        // Robust Supabase Mock
        (supabase as any).from = jest.fn((table) => {
            const chain = {
                select: jest.fn((columns) => {
                    chain.columns = columns;
                    return chain;
                }),
                eq: jest.fn((col, val) => {
                    // Store filters if needed, or Apply immediately?
                    // For this test, we only primarily care about user_id (ignore) or finding specific entries.
                    // But wait, the code checks for existence by date.
                    if (col === 'date') chain.dateFilter = val;
                    return chain;
                }),
                gte: jest.fn(() => chain),
                order: jest.fn(() => chain),
                limit: jest.fn(() => chain),
                maybeSingle: jest.fn(async () => {
                    if (table === 'profiles') {
                         return { data: { username: 'TestUser', full_name: 'Test Name' }, error: null };
                    }
                    
                    if (table === 'body_measurements') {
                        console.log('Mock: maybeSingle for columns:', chain.columns, 'Table size:', bodyMeasurements.length);
                        // Check logic based on what was selected
                        if (chain.columns === 'id') {
                            // Existence check by date
                            const exists = bodyMeasurements.find(m => m.date === chain.dateFilter);
                            console.log('Mock: Existence check for date:', chain.dateFilter, 'Found:', exists);
                            return { data: exists, error: null };
                        }
                         if (chain.columns === 'weight') {
                            // Fetch Latest
                            // Sort by date (simple mock assumption: last pushed is latest or we sort)
                            const latest = bodyMeasurements[bodyMeasurements.length - 1];
                            console.log('Mock: Fetching latest weight. Result:', latest);
                            return { data: latest || null, error: null };
                        }
                    }
                     return { data: null, error: null };
                }),
                insert: jest.fn(async (row) => {
                    console.log('Mock: Insert row:', row);
                    bodyMeasurements.push(row);
                    return { error: null };
                }),
                update: jest.fn(async (updates) => {
                     // In a real DB we'd find by ID and update.
                     // Here we just assume it works or update the last one.
                     if (bodyMeasurements.length > 0) {
                        Object.assign(bodyMeasurements[bodyMeasurements.length - 1], updates);
                     }
                     return { error: null };
                }),
                upsert: jest.fn(async (row) => {
                    // Simulate success
                    return { error: null };
                }),
                then: (resolve: any) => Promise.resolve({ data: bodyMeasurements, error: null }).then(resolve) // fallback for array returns
            } as any;
            return chain;
        });
    });

    it('updates body weight successfully', async () => {
        const { getByTestId, getByText } = render(<ProfileScreen />);
        await waitFor(() => expect(getByTestId('current-weight').children[0]).toBe('No Data'));
        fireEvent.press(getByText('Log Weight'));
        fireEvent.press(getByText('Save 75kg'));
        await waitFor(() => expect(getByTestId('current-weight').children[0]).toBe('75 kg'));
    });

    it('handles body weight save error', async () => {
         // Override mock for this test to return error
         (supabase.from as jest.Mock).mockImplementationOnce((table) => {
             // Return a chain that fails on insert
             return {
                 select: jest.fn(() => ({
                     eq: jest.fn(() => ({
                         maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })), // Check existing
                         // For fetchLatestWeight...
                         order: jest.fn(() => ({ order: jest.fn(() => ({ limit: jest.fn(() => ({ maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })) })) })) }))
                     }))
                 })),
                 insert: jest.fn(() => Promise.resolve({ error: { message: 'Insert failed' } })),
                 then: (r: any) => Promise.resolve({ error: { message: 'Insert failed' } }).then(r)
             };
         });

        const { getByTestId, getByText } = render(<ProfileScreen />);
        await waitFor(() => expect(getByTestId('current-weight').children[0]).toBe('No Data'));
        
        fireEvent.press(getByText('Log Weight'));
        fireEvent.press(getByText('Save 75kg'));
        
        // Should NOT update to 75kg (remain No Data or just invalid)
        // Ideally we check for Toast error, but Toast mock is just jest.fn()
        // We can check that state didn't change
         await waitFor(() => expect(getByTestId('current-weight').children[0]).toBe('No Data'));
    });

    it('updates username and full name successfully in Settings', async () => {
        const { getByText } = render(<SettingsScreen />);
        await waitFor(() => {
            expect(getByText('TestUser')).toBeTruthy();
            expect(getByText('Test Name')).toBeTruthy();
        });
        fireEvent.press(getByText('Edit'));
        fireEvent.press(getByText('Save Profile'));
        await waitFor(() => {
            expect(getByText('NewUser')).toBeTruthy();
            expect(getByText('New Name')).toBeTruthy();
        });
    });

    it('handles profile update error in Settings', async () => {
         // Mock upsert failure - Use mockImplementation to cover both initial render and update call
         (supabase.from as jest.Mock).mockImplementation((table) => {
             if (table === 'profiles') {
                return {
                     select: jest.fn(() => ({
                         eq: jest.fn(() => ({
                             maybeSingle: jest.fn(() => Promise.resolve({ data: { username: 'OldUser', full_name: 'Old Name' }, error: null }))
                         }))
                     })),
                     upsert: jest.fn(() => Promise.resolve({ error: { message: 'Upsert Error' } })),
                 };
             }
             return { select: jest.fn() }; // fallback
         });
         
         // We also need Alert.alert mock to verify error display
         const spyAlert = jest.spyOn(Alert, 'alert');

        const { getByText } = render(<SettingsScreen />);
        await waitFor(() => {
            expect(getByText('OldUser')).toBeTruthy();
        });

        fireEvent.press(getByText('Edit'));
        fireEvent.press(getByText('Save Profile')); // Triggers failed upsert

        await waitFor(() => {
            expect(spyAlert).toHaveBeenCalledWith('Error', 'Upsert Error');
            // Check that UI did NOT update (still OldUser)
            expect(getByText('OldUser')).toBeTruthy();
        });
    });
});
