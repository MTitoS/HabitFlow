import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageDataStore } from '@/data/adapters/asyncStorage';
import { MemoryDataStore } from '@/data/adapters/memory';
import { DataStore } from '@/data/adapters/types';

export type StoreEnv = 'native' | 'web' | 'test';

const STORAGE_KEY = 'habitflow:db:v1';

export function createStore(env: StoreEnv): DataStore {
  if (env === 'test') {
    return new MemoryDataStore();
  }
  return new AsyncStorageDataStore(STORAGE_KEY);
}

export async function createAppStore(): Promise<{ store: DataStore; ready: Promise<void> }> {
  const store = new AsyncStorageDataStore(STORAGE_KEY);
  await store.initReady;
  return { store, ready: Promise.resolve() };
}

export function memoryStore(): MemoryDataStore {
  return new MemoryDataStore();
}

export function createTestStore(): MemoryDataStore {
  return new MemoryDataStore();
}

export async function clearPersistedStore(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const DB_STORAGE_KEY = STORAGE_KEY;