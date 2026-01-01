import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useExerciseStats } from "../../hooks/workouts/useExerciseStats";
import { fetchExerciseStats } from "../../providers/WorkoutManagerProvider";

jest.mock("../../providers/WorkoutManagerProvider", () => ({
    fetchExerciseStats: jest.fn(),
}));

describe("useExerciseStats", () => {
    const mockUser = { id: "u1" };
    const mockExercise = {
        id: "e1",
        name: "Bench Press",
        properties: ["Weight", "Reps"],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("derives available metrics correctly", async () => {
        (fetchExerciseStats as jest.Mock).mockResolvedValue({ data: [] });
        const { result } = renderHook(() =>
            useExerciseStats(mockUser, mockExercise)
        );

        // Initial render triggers fetch, wait for it to settle?
        // But metrics are memoized immediately.
        expect(result.current.availableMetrics).toEqual(
            expect.arrayContaining(["weight", "reps"]),
        );
        // Should default to first metric
        expect(result.current.selectedMetric).toBe("weight");

        // Wait for fetch to complete to avoid act warnings
        await waitFor(() => {
            expect(result.current.loadingChart).toBe(false);
        });
    });

    it("fetches data on mount", async () => {
        const mockData = [{ date: "2023-01-01", value: 100 }];
        (fetchExerciseStats as jest.Mock).mockResolvedValue({ data: mockData });

        const { result } = renderHook(() =>
            useExerciseStats(mockUser, mockExercise)
        );

        expect(result.current.loadingChart).toBe(true);

        await waitFor(() => {
            expect(result.current.loadingChart).toBe(false);
        });

        expect(fetchExerciseStats).toHaveBeenCalledWith(
            mockUser,
            "e1",
            "weight",
        );
        expect(result.current.chartData).toEqual(mockData);
    });

    it("refetches when metric changes", async () => {
        (fetchExerciseStats as jest.Mock).mockResolvedValue({ data: [] });
        const { result } = renderHook(() =>
            useExerciseStats(mockUser, mockExercise)
        );

        await waitFor(() => expect(result.current.loadingChart).toBe(false));

        // Switch metric
        act(() => {
            result.current.setSelectedMetric("reps");
        });

        expect(result.current.loadingChart).toBe(true);
        expect(result.current.selectedMetric).toBe("reps");

        await waitFor(() => {
            expect(result.current.loadingChart).toBe(false);
        });

        expect(fetchExerciseStats).toHaveBeenCalledWith(mockUser, "e1", "reps");
    });
});
