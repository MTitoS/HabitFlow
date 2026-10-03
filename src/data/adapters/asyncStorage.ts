import AsyncStorage from '@react-native-async-storage/async-storage';
import { MemoryDataStore } from '@/data/adapters/memory';
import { DataStore, Unsubscribe } from '@/data/adapters/types';
import { DB_VERSION } from '@/data/schema';

interface Snapshot {
  version: number;
  tables: Record<string, unknown[]>;
}

export class AsyncStorageDataStore implements DataStore {
  private memory: MemoryDataStore;
  private storageKey: string;
  private ready: Promise<void>;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
    this.memory = new MemoryDataStore();
    this.ready = this.load();
  }

  get initReady(): Promise<void> {
    return this.ready;
  }

  private async load(): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(this.storageKey);
      if (!raw) return;
      const snapshot = JSON.parse(raw) as Snapshot;
      if (snapshot.version > DB_VERSION) {
        throw new Error(`unsupported_db_version:${snapshot.version}`);
      }
      await this.memory.restoreTables(snapshot.tables ?? {});
    } catch {
      await this.memory.clear();
    }
  }

  async readTable<T>(table: string): Promise<T[]> {
    await this.ready;
    return this.memory.readTable<T>(table);
  }

  async writeTable<T>(table: string, rows: T[]): Promise<void> {
    await this.ready;
    await this.memory.writeTable(table, rows);
    await this.persist();
  }

  async clear(): Promise<void> {
    await this.ready;
    await this.memory.clear();
    await AsyncStorage.removeItem(this.storageKey);
  }

  subscribe(listener: () => void): Unsubscribe {
    return this.memory.subscribe(listener);
  }

  snapshotTables(): Record<string, unknown[]> {
    return this.memory.snapshotTables();
  }

  async restoreTables(tables: Record<string, unknown[]>): Promise<void> {
    await this.ready;
    await this.memory.restoreTables(tables);
    await this.persist();
  }

  private async persist(): Promise<void> {
    const snapshot: Snapshot = {
      version: DB_VERSION,
      tables: this.memory.snapshotTables(),
    };
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(snapshot));
    } catch {
      // storage write failure should not crash the read path
    }
  }
}