import { useCallback, useEffect, useState } from "react";
import { supabase, useAuth } from "@mycsuite/auth";

export function useLatestBodyWeight() {
    const { user } = useAuth();
    const [latestWeight, setLatestWeight] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchWeight = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("body_measurements")
            .select("weight")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.log("Error fetching latest body weight:", error);
        } else if (data) {
            setLatestWeight(data.weight);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchWeight();
        }
    }, [user, fetchWeight]);

    return { weight: latestWeight, loading, refetch: fetchWeight };
}
