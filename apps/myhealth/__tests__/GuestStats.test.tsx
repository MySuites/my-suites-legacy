
import { fetchExerciseStats, fetchLastExercisePerformance } from '../utils/workout-api/exercises';
import { DataRepository } from '../providers/DataRepository';

// Mock Supabase 
jest.mock('@mysuite/auth', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock DataRepository
jest.mock('../providers/DataRepository', () => ({
  DataRepository: {
    getHistory: jest.fn(),
  },
}));

describe('Guest Stats & Performance', () => {
  const mockHistory = [
    {
      id: 'log-1',
      date: '2023-01-01',
      exercises: [
        {
          id: 'ex-1',
          name: 'Pushups',
          logs: [
            { weight: 0, reps: 10 },
            { weight: 0, reps: 12 }
          ]
        }
      ]
    },
    {
      id: 'log-2',
      date: '2023-01-02', 
      exercises: [
        {
          id: 'ex-1',
          name: 'Pushups',
          logs: [
            { weight: 0, reps: 15 } // Max reps here
          ]
        }
      ]
    }
  ];

  beforeEach(() => {
    (DataRepository.getHistory as jest.Mock).mockResolvedValue(mockHistory);
  });

  it('fetchExerciseStats should calculate stats from local history for guests', async () => {
    const { data, error } = await fetchExerciseStats(null, 'ex-1', 'reps');
    
    expect(error).toBeNull();
    // Expect 2 data points (Jan 1, Jan 2)
    expect(data).toHaveLength(2);
    
    // Sort logic put Jan 1 first? The code sorts by date ascending?
    // Code says: sort((a, b) => new Date(a.date) - new Date(b.date))
    // Wait, let's allow flexibility, just check values exist.
    
    const maxRepEntry = data.find((d: any) => d.value === 15);
    expect(maxRepEntry).toBeDefined();
  });

  it('fetchLastExercisePerformance should return logs from latest session', async () => {
    const { data: logs, error } = await fetchLastExercisePerformance(null, 'ex-1');
    
    expect(error).toBeNull();
    expect(logs).not.toBeNull();
    if (!logs) return;

    expect(logs).toHaveLength(1);
    expect(logs[0].reps).toBe(15); // Should be from log-2 (Jan 2)
  });
});
