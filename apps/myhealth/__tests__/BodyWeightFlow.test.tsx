
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

describe('Local-First Body Weight Flow (SQLite)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Initialize Repo with Mock DB
        DataRepository.initialize(mockDB as any);
    });

    it('should save body weight to SQLite', async () => {
        const input = { userId: 'user-1', weight: 150, date: '2025-01-01' };
        
        await DataRepository.saveBodyWeight(input);
        
        expect(mockExecute).toHaveBeenCalledWith(
            expect.stringContaining('INSERT OR REPLACE INTO body_measurements'),
            expect.arrayContaining(['user-1', 150, '2025-01-01'])
        );
    });

    it('should retrieve latest body weight', async () => {
        const mockRow = { weight: 145 };
        mockGetAll.mockResolvedValue([mockRow]);
        
        const latest = await DataRepository.getLatestBodyWeight('user-1');
        
        expect(mockGetAll).toHaveBeenCalledWith(
            expect.stringContaining('SELECT weight FROM body_measurements'),
            expect.arrayContaining(['user-1'])
        );
        expect(latest).toBe(145);
    });

    it('should retrieve history sorted by date', async () => {
        const mockRows = [
            { id: '1', user_id: 'user-1', weight: 140, date: '2024-12-31' },
            { id: '2', user_id: 'user-1', weight: 145, date: '2025-01-01' },
        ];
        // Mock getAll to return sorted from DB query
        mockGetAll.mockResolvedValue(mockRows);
        
        const history = await DataRepository.getBodyWeightHistory('user-1');
        
        expect(mockGetAll).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM body_measurements'),
            expect.any(Array)
        );
        expect(history).toHaveLength(2);
        expect(history[0].weight).toBe(140);
    });
});
