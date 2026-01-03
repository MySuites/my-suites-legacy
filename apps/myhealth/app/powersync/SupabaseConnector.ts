import {
    AbstractPowerSyncDatabase,
    PowerSyncBackendConnector,
    UpdateType,
} from "@powersync/react-native";
import { supabase } from "@mysuite/auth";

export class SupabaseConnector implements PowerSyncBackendConnector {
    async fetchCredentials() {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!session || error) {
            // If no session, return null. PowerSync will pause sync.
            return null;
        }

        const { access_token, expires_at } = session;

        return {
            endpoint: process.env.EXPO_PUBLIC_POWERSYNC_URL ||
                "https://foo.powersync.com", // Placeholder
            token: access_token,
            expiresAt: expires_at ? new Date(expires_at * 1000) : undefined, // Check if expires_at is seconds or ms
        };
    }

    async uploadData(database: AbstractPowerSyncDatabase) {
        const transaction = await database.getNextCrudTransaction();

        if (!transaction) {
            return;
        }

        try {
            for (const operation of transaction.crud) {
                const { op, table, id, opData } = operation;

                // Map PowerSync operations to Supabase calls
                // Note: In a real app, you might use an Edge Function to handle batch uploads
                // But here we can use the Supabase JS client for Row-by-Row.
                // Warning: This can be slow for bulk.

                if (op === UpdateType.PUT) {
                    // Upsert
                    const record = { ...opData, id };
                    const { error } = await supabase.from(table).upsert(record);
                    if (error) throw error;
                } else if (op === UpdateType.PATCH) {
                    // Update
                    const { error } = await supabase.from(table).update(opData)
                        .eq("id", id);
                    if (error) throw error;
                } else if (op === UpdateType.DELETE) {
                    // Delete
                    const { error } = await supabase.from(table).delete().eq(
                        "id",
                        id,
                    );
                    if (error) throw error;
                }
            }

            await transaction.complete();
        } catch (ex) {
            console.error("PowerSync upload failed", ex);
            // transaction.complete() is NOT called, so it will retry
        }
    }
}
