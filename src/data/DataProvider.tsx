/* eslint-disable react-hooks/set-state-in-effect -- reload() é o caminho assíncrono de carga (aguarda I/O antes de setState) */
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { createStore, StoreEnv } from '@/data/database';
import { createRepositories } from '@/data/repositories/impl';
import { Repositories } from '@/data/repositories/types';
import { DataStore } from '@/data/adapters/types';
import { Habit, Routine } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';
import { SkipCredit, grantWeeklyCredit } from '@/domain/skip-credit/grantWeeklyCredit';

export interface DataContextValue {
  habits: Habit[];
  records: HabitRecord[];
  routines: Routine[];
  skipCredit: SkipCredit | null;
  loading: boolean;
  error: Error | null;
  repos: Repositories;
  store: DataStore;
  reload: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function envForPlatform(): StoreEnv {
  return Platform.OS === 'web' ? 'web' : 'native';
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [store] = useState<DataStore>(() => createStore(envForPlatform()));
  const [repos] = useState<Repositories>(() => createRepositories(store));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [skipCredit, setSkipCredit] = useState<SkipCredit | null>(null);

  const reload = useCallback(async () => {
    try {
      const [h, r, ro, sc] = await Promise.all([
        repos.habits.all(),
        repos.records.all(),
        repos.routines.all(),
        repos.skipCredit.get(),
      ]);
      const granted = grantWeeklyCredit(sc, new Date());
      if (granted !== sc) {
        await repos.skipCredit.save(granted);
      }
      setHabits(h);
      setRecords(r);
      setRoutines(ro);
      setSkipCredit(granted);
      setError(null);
      setLoading(false);
    } catch (e) {
      setError(e as Error);
      setLoading(false);
    }
  }, [repos]);

  useEffect(() => {
    void reload();
    const unsubscribe = store.subscribe(() => {
      void reload();
    });
    return unsubscribe;
  }, [reload, store]);

  const value = useMemo<DataContextValue>(
    () => ({ habits, records, routines, skipCredit, loading, error, repos, store, reload }),
    [habits, records, routines, skipCredit, loading, error, repos, store, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used inside DataProvider');
  }
  return context;
}