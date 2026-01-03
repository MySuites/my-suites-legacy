
import { DataRepository } from '../providers/DataRepository';

// Mock PowerSync
const mockExecute = jest.fn();
const mockGetAll = jest.fn();
const mockWriteTransaction = jest.fn(async (cb) => {
    const tx = { execute: mockExecute };
    await cb(tx);
});

const mockDB = {
    execute: mockExecute,
    getAll: mockGetAll,
    writeTransaction: mockWriteTransaction,
};

describe('Local-First Data Flow (SQLite)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        DataRepository.initialize(mockDB as any);
    });

    it('should save a log to workout_logs and set_logs tables', async () => {
        // Arrange
        const logInput = {
            userId: 'user-1',
            name: 'Test Workout',
            exercises: [
                { 
                    id: 'ex-1', 
                    name: 'Pushups', 
                    completedSets: 1, 
                    sets: 3, 
                    reps: 10, 
                    logs: [{ id: 'set-1', weight: 0, reps: 10 }] 
                }
            ],
            duration: 100,
            date: '2025-01-01T10:00:00Z',
            createdAt: '2025-01-01T10:00:00Z',
            note: 'Good',
        };

        // Act
        const result = await DataRepository.saveLog(logInput);

        // Assert
        expect(result).toBeDefined();
        // Check transaction execution
        // Expect INSERT INTO workout_logs
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO workout_logs'),
            expect.arrayContaining(['Test Workout', 'user-1'])
        );
        // Expect INSERT INTO set_logs
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO set_logs'),
            expect.arrayContaining(['ex-1'])
        );
    });

    it('should retrieve history by joining workout_logs and set_logs', async () => {
        // Arrange: Mock tables
        const mockWorkoutLogs = [{
            id: 'log-1',
            user_id: 'user-1',
            workout_name: 'History Workout',
            workout_time: '2025-01-02T10:00:00Z',
            duration: 60,
            created_at: '2025-01-02T10:00:00Z',
            updated_at: '2025-01-02T10:00:00Z',
        }];
        const mockSetLogs = [{
            id: 'set-A',
            workout_log_id: 'log-1',
            exercise_id: 'ex-2',
            details: JSON.stringify({ exercise_name: 'Squats', reps: 5, weight: 100 })
        }];

        mockGetAll.mockImplementation((query) => {
            if (query.includes('workout_logs')) return Promise.resolve(mockWorkoutLogs);
            if (query.includes('set_logs')) return Promise.resolve(mockSetLogs);
            return Promise.resolve([]);
        });

        // Act
        const history = await DataRepository.getHistory();

        // Assert
        expect(history).toHaveLength(1);
        const log = history[0];
        expect(log.name).toBe('History Workout');
        expect(log.exercises).toHaveLength(1);
        expect(log.exercises[0].name).toBe('Squats');
        expect(log.exercises[0].logs![0].weight).toBe(100);
    });
});
