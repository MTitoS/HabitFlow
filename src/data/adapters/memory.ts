import { DataStore, Unsubscribe } from '@/data/adapters/types';

export class MemoryDataStore implements DataStore {
  private tables = new Map<string, unknown[]>();
  private listeners = new Set<() => void>();
  private static instance: MemoryDataStore | null = null;

  static shared(): MemoryDataStore {
    if (!MemoryDataStore.instance) {
      MemoryDataStore.instance = new MemoryDataStore();
    }
    return MemoryDataStore.instance;
  }

  static resetShared(): void {
    MemoryDataStore.instance = null;
  }

  readTable<T>(table: string): Promise<T[]> {
    const rows = this.tables.get(table);
    return Promise.resolve(rows ? (JSON.parse(JSON.stringify(rows)) as T[]) : []);
  }

  async writeTable<T>(table: string, rows: T[]): Promise<void> {
    this.tables.set(table, JSON.parse(JSON.stringify(rows)));
    this.notify();
  }

  async clear(): Promise<void> {
    this.tables.clear();
    this.notify();
  }

  subscribe(listener: () => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  snapshotTables(): Record<string, unknown[]> {
    const snapshot: Record<string, unknown[]> = {};
    for (const [name, rows] of this.tables.entries()) {
      snapshot[name] = JSON.parse(JSON.stringify(rows));
    }
    return snapshot;
  }

  async restoreTables(tables: Record<string, unknown[]>): Promise<void> {
    this.tables.clear();
    for (const [name, rows] of Object.entries(tables)) {
      this.tables.set(name, JSON.parse(JSON.stringify(rows)));
    }
    this.notify();
  }

  private notify(): void {
    setTimeout(() => {
      for (const listener of this.listeners) {
        listener();
      }
    }, 0);
  }
}