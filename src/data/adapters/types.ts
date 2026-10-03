export type Unsubscribe = () => void;

export interface DataStore {
  readTable<T>(table: string): Promise<T[]>;
  writeTable<T>(table: string, rows: T[]): Promise<void>;
  clear(): Promise<void>;
  subscribe(listener: () => void): Unsubscribe;
  snapshotTables(): Record<string, unknown[]>;
  restoreTables(tables: Record<string, unknown[]>): Promise<void>;
}