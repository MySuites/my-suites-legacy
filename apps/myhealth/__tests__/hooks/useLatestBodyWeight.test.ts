import { renderHook, waitFor } from "@testing-library/react-native";
import { useLatestBodyWeight } from "../../hooks/workouts/useLatestBodyWeight";
import { supabase } from "@mysuite/auth";

jest.mock("@mysuite/auth", () => ({
    useAuth: jest.fn(() => ({ user: { id: "u1" } })),
    supabase: {
        from: jest.fn(),
    },
}));

describe("useLatestBodyWeight", () => {
    let mockMaybeSingle: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        mockMaybeSingle = jest.fn();

        // Mock Chain
        const mockLimit = jest.fn().mockReturnValue({
            maybeSingle: mockMaybeSingle,
        });
        const mockOrder2 = jest.fn().mockReturnValue({ limit: mockLimit });
        const mockOrder1 = jest.fn().mockReturnValue({ order: mockOrder2 });
        const mockEq = jest.fn().mockReturnValue({ order: mockOrder1 });
        const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });

        (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
    });

    it("fetches weight on mount", async () => {
        mockMaybeSingle.mockResolvedValue({
            data: { weight: 75.5 },
            error: null,
        });

        const { result } = renderHook(() => useLatestBodyWeight());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.weight).toBe(75.5);
        expect(supabase.from).toHaveBeenCalledWith("body_measurements");
    });

    it("handles error gracefully", async () => {
        const consoleSpy = jest.spyOn(console, "log").mockImplementation();
        mockMaybeSingle.mockResolvedValue({
            data: null,
            error: { message: "Fetch error" },
        });

        const { result } = renderHook(() => useLatestBodyWeight());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.weight).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith(
            "Error fetching latest body weight:",
            expect.anything(),
        );
        consoleSpy.mockRestore();
    });

    it("handles no data found", async () => {
        mockMaybeSingle.mockResolvedValue({ data: null, error: null });

        const { result } = renderHook(() => useLatestBodyWeight());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.weight).toBeNull();
    });

    it("does not fetch if no user", async () => {
        const { useAuth } = require("@mysuite/auth");
        useAuth.mockReturnValue({ user: null });

        const { result } = renderHook(() => useLatestBodyWeight());

        expect(result.current.loading).toBe(false);
        expect(supabase.from).not.toHaveBeenCalled();
    });
});
