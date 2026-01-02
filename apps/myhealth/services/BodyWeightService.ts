import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@mysuite/auth";

const LOCAL_STORAGE_KEY = "myhealth_guest_body_weight";

export interface BodyWeightEntry {
    id?: string;
    weight: number;
    date: string; // YYYY-MM-DD
    created_at?: string;
}

export const BodyWeightService = {
    /**
     * Fetch the most recent weight entry.
     */
    async getLatestWeight(userId: string | null): Promise<number | null> {
        if (userId) {
            // Authenticated User: Fetch from Supabase
            const { data, error } = await supabase
                .from("body_measurements")
                .select("weight")
                .eq("user_id", userId)
                .order("date", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error(
                    "Error fetching latest weight (Supabase):",
                    error,
                );
                return null;
            }
            return data?.weight || null;
        } else {
            // Guest User: Fetch from AsyncStorage
            try {
                const jsonValue = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
                const history: BodyWeightEntry[] = jsonValue != null
                    ? JSON.parse(jsonValue)
                    : [];
                if (history.length === 0) return null;

                // Sort to find latest
                history.sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    if (dateA !== dateB) return dateB - dateA;
                    // If dates are equal, fall back to created_at if available, else stable
                    const createdA = a.created_at
                        ? new Date(a.created_at).getTime()
                        : 0;
                    const createdB = b.created_at
                        ? new Date(b.created_at).getTime()
                        : 0;
                    return createdB - createdA;
                });

                return history[0].weight;
            } catch (e) {
                console.error("Error fetching latest weight (Local):", e);
                return null;
            }
        }
    },

    /**
     * Fetch weight history within a date range (start date inclusive).
     */
    async getWeightHistory(
        userId: string | null,
        startDate: string,
    ): Promise<BodyWeightEntry[]> {
        if (userId) {
            // Authenticated User
            const { data, error } = await supabase
                .from("body_measurements")
                .select("weight, date, created_at")
                .eq("user_id", userId)
                .gte("date", startDate)
                .order("date", { ascending: true });

            if (error) {
                console.error(
                    "Error fetching weight history (Supabase):",
                    error,
                );
                return [];
            }
            return data || [];
        } else {
            // Guest User
            try {
                const jsonValue = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
                const history: BodyWeightEntry[] = jsonValue != null
                    ? JSON.parse(jsonValue)
                    : [];

                // Filter by date
                const filtered = history.filter((item) =>
                    item.date >= startDate
                );
                // Sort ascending by date
                filtered.sort((a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                return filtered;
            } catch (e) {
                console.error("Error fetching weight history (Local):", e);
                return [];
            }
        }
    },

    /**
     * Save or update a weight entry for a specific date.
     * Note: Current logic assumes one entry per date for update simplicity,
     * but the data model supports multiple. We'll stick to upsert-like behavior for "today" logic if needed,
     * but generally we just append or update based on ID.
     * Since we don't have IDs for local storage easily, we'll use date as key for upserting in this simple implementation.
     */
    async saveWeight(
        userId: string | null,
        weight: number,
        date: Date,
    ): Promise<void> {
        const dateStr = date.toISOString().split("T")[0];

        if (userId) {
            // Authenticated User
            // Check for existing entry on this date to update (simple rule: one per day or update latest?)
            // The original code used a check-then-upsert logic based on date. keeping that consistency.

            const { data: existingData, error: fetchError } = await supabase
                .from("body_measurements")
                .select("id")
                .eq("user_id", userId)
                .eq("date", dateStr)
                .maybeSingle();

            if (fetchError) {
                console.error("Error checking existing weight:", fetchError);
                throw fetchError;
            }

            if (existingData) {
                const { error: updateError } = await supabase
                    .from("body_measurements")
                    .update({ weight: weight })
                    .eq("id", existingData.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("body_measurements")
                    .insert({
                        user_id: userId,
                        weight: weight,
                        date: dateStr,
                    });
                if (insertError) throw insertError;
            }
        } else {
            // Guest User
            try {
                const jsonValue = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
                let history: BodyWeightEntry[] = jsonValue != null
                    ? JSON.parse(jsonValue)
                    : [];

                const existingIndex = history.findIndex((item) =>
                    item.date === dateStr
                );

                if (existingIndex >= 0) {
                    // Update existing
                    history[existingIndex].weight = weight;
                    // Update created_at effectively to now? Not strict for local.
                } else {
                    // Insert new
                    history.push({
                        weight,
                        date: dateStr,
                        created_at: new Date().toISOString(),
                    });
                }

                await AsyncStorage.setItem(
                    LOCAL_STORAGE_KEY,
                    JSON.stringify(history),
                );
            } catch (e) {
                console.error("Error saving weight (Local):", e);
                throw e;
            }
        }
    },
};
