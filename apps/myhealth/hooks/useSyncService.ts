import { useCallback } from "react";

export function useSyncService() {
    // PowerSync handles background sync automatically.
    // This hook is kept for compatibility with existing components that consume it.

    const sync = useCallback(async () => {
        console.log("Sync triggered (managed by PowerSync)");
    }, []);

    return {
        isSyncing: false,
        sync,
    };
}
