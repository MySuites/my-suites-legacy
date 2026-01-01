import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActiveRoutineCard } from '../../components/routines/ActiveRoutineCard';
import * as RN from 'react-native';

const mockRN = RN;

// Mocks
const mockOnClearRoutine = jest.fn();
const mockOnStartWorkout = jest.fn();
const mockOnMarkComplete = jest.fn();
const mockOnJumpToDay = jest.fn();
const mockOnViewModeChange = jest.fn();
const mockOnMenuPress = jest.fn();

jest.mock('@mysuite/ui', () => {
    return {
        RaisedCard: ({ children }: any) => <mockRN.View testID="raised-card">{children}</mockRN.View>,
        RaisedButton: ({ onPress, children }: any) => (
            <mockRN.TouchableOpacity onPress={onPress} testID="menu-button">
                {children}
            </mockRN.TouchableOpacity>
        ),
        IconSymbol: ({ name }: any) => <mockRN.Text>{name}</mockRN.Text>,
        useUITheme: () => ({ primary: 'blue' }),
    };
});

jest.mock('../../components/ui/SegmentedControl', () => ({
    SegmentedControl: ({ value, onChange }: any) => {
        return (
             <mockRN.TouchableOpacity onPress={() => onChange('next_7')}>
                 <mockRN.Text>Mode: {value}</mockRN.Text>
             </mockRN.TouchableOpacity>
        );
    }
}));

jest.mock('../../components/routines/ActiveRoutineTimelineItem', () => ({
    ActiveRoutineTimelineItem: ({ item }: any) => {
        return <mockRN.Text>Day: {item.name}</mockRN.Text>;
    }
}));

describe('ActiveRoutineCard', () => {
    const mockRoutine = { id: 'r1', name: 'My Routine', sequence: [{}, {}, {}] };
    const mockTimeline = [{ name: 'Day 1' }, { name: 'Day 2' }];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders routine name and timeline', () => {
        const { getByText, getAllByText } = render(
            <ActiveRoutineCard
                activeRoutineObj={mockRoutine}
                timelineDays={mockTimeline}
                dayIndex={0}
                isDayCompleted={false}
                onClearRoutine={mockOnClearRoutine}
                onStartWorkout={mockOnStartWorkout}
                onMarkComplete={mockOnMarkComplete}
                onJumpToDay={mockOnJumpToDay}
                viewMode="next_3"
                onViewModeChange={mockOnViewModeChange}
                onMenuPress={mockOnMenuPress}
            />
        );

        expect(getByText('My Routine')).toBeTruthy();
        expect(getByText('Exit')).toBeTruthy();
        expect(getAllByText(/Day:/).length).toBe(2);
    });

    it('handles interaction events', () => {
        const { getByText, getByTestId } = render(
            <ActiveRoutineCard
                activeRoutineObj={mockRoutine}
                timelineDays={mockTimeline}
                dayIndex={0}
                isDayCompleted={false}
                onClearRoutine={mockOnClearRoutine}
                onStartWorkout={mockOnStartWorkout}
                onMarkComplete={mockOnMarkComplete}
                onJumpToDay={mockOnJumpToDay}
                viewMode="next_3"
                onViewModeChange={mockOnViewModeChange}
                onMenuPress={mockOnMenuPress}
            />
        );

        fireEvent.press(getByText('Exit'));
        expect(mockOnClearRoutine).toHaveBeenCalled();

        fireEvent.press(getByTestId('menu-button'));
        expect(mockOnMenuPress).toHaveBeenCalled();

        fireEvent.press(getByText('Mode: next_3'));
        expect(mockOnViewModeChange).toHaveBeenCalledWith('next_7');
    });

    it('handles collapse toggle', () => {
        // Initially expanded
        const { getByText, getAllByText } = render(
            <ActiveRoutineCard
                activeRoutineObj={mockRoutine}
                timelineDays={mockTimeline}
                dayIndex={0}
                isDayCompleted={false}
                onClearRoutine={mockOnClearRoutine}
                onStartWorkout={mockOnStartWorkout}
                onMarkComplete={mockOnMarkComplete}
                onJumpToDay={mockOnJumpToDay}
                viewMode="next_3"
                onViewModeChange={mockOnViewModeChange}
                onMenuPress={mockOnMenuPress}
            />
        );
        
        expect(getAllByText(/Day:/).length).toBe(2);
        expect(getByText('chevron.up')).toBeTruthy();

        // Toggle collapse
        // Find the toggle button - simpler to find by icon text 'chevron.up' parent
        // Mock IconSymbol renders Text{name}.
        // The button is TouchableOpacity wrapping the Icon.
        fireEvent.press(getByText('chevron.up'));

        // Should check collapse state
        // In component: isCollapsed ? slice(0, 1) : timelineDays
        // Should show 1 item
        expect(getAllByText(/Day:/).length).toBe(1);
        expect(getByText('chevron.down')).toBeTruthy();
    });
});
