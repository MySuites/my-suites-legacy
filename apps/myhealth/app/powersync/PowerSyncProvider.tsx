import React, { createContext, useContext, useEffect, useState } from 'react';
import { PowerSyncDatabase } from '@powersync/react-native';
import * as FileSystem from 'expo-file-system';
import '@azure/core-asynciterator-polyfill'; // Required polyfill
import 'react-native-url-polyfill/auto';
import { useAuth } from '@mysuite/auth';
import { AppSchema } from './AppSchema';
import { SupabaseConnector } from './SupabaseConnector';
import { migrateToSQLite } from '../../utils/db/migration';

export const PowerSyncContext = createContext<PowerSyncDatabase | null>(null);

const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    dbFilename: 'myhealth.sqlite',
  }
});

const connector = new SupabaseConnector();

export const PowerSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Init logic
    const init = async () => {
        try {
            await db.init();
            // @ts-ignore
            console.log("sqlite-path:", (FileSystem as any).documentDirectory + 'myhealth.sqlite');
            await db.connect(connector);
            
            if (user?.id) {
                await migrateToSQLite(db, user.id);
            }
            
            setReady(true);
        } catch (e) {
            console.error("Failed to init PowerSync", e);
        }
    };

    if (user) {
        init();
    }
  }, [user]);

  if (!ready) {
      return null;
  }

  return (
    <PowerSyncContext.Provider value={db}>
      {children}
    </PowerSyncContext.Provider>
  );
};

export const usePowerSync = () => {
    const context = useContext(PowerSyncContext);
    if (!context) {
        throw new Error("usePowerSync must be used within PowerSyncProvider");
    }
    return context;
};
