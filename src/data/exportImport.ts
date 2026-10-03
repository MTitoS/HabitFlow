import { DataStore } from '@/data/adapters/types';
import { DB_VERSION } from '@/data/schema';
import { applyMigrations } from '@/data/migrations';

export interface ExportPayload {
  version: number;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

export function buildExport(store: DataStore): ExportPayload {
  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    tables: store.snapshotTables(),
  };
}

export function validatePayload(json: string): ExportPayload | null {
  try {
    const payload = JSON.parse(json) as Partial<ExportPayload>;
    if (
      typeof payload?.version !== 'number' ||
      payload.version < 1 ||
      payload.version > DB_VERSION ||
      !payload.tables ||
      typeof payload.tables !== 'object'
    ) {
      return null;
    }
    const migrated = applyMigrations(payload.tables, payload.version);
    return { version: DB_VERSION, exportedAt: payload.exportedAt ?? '', tables: migrated };
  } catch {
    return null;
  }
}

export async function importPayload(store: DataStore, json: string): Promise<ExportPayload> {
  const payload = validatePayload(json);
  if (!payload) {
    throw new Error('formato de backup inválido');
  }
  await store.restoreTables(payload.tables);
  return payload;
}