import { buildExport, importPayload, validatePayload } from '@/data/exportImport';
import { createTestStore } from '@/data/database';
import { createRepositories } from '@/data/repositories/impl';

describe('export import', () => {
  it('roundtrips export → import → equal tables', async () => {
    const storeA = createTestStore();
    const reposA = createRepositories(storeA);
    await reposA.habits.create({
      name: 'Ler',
      icon: 'book',
      color: 'primary',
      type: 'binary',
      frequency: { kind: 'daily', schedule: {} },
    });

    const payload = buildExport(storeA);
    const json = JSON.stringify(payload);

    const storeB = createTestStore();
    await importPayload(storeB, json);
    const tablesB = storeB.snapshotTables();

    expect(tablesB).toEqual(storeA.snapshotTables());
    expect(tablesB.habits).toHaveLength(1);
  });

  it('payload carries version + exportedAt (sync-ready)', () => {
    const payload = validatePayload(JSON.stringify({ version: 1, exportedAt: '2026-01-01', tables: {} }));
    expect(payload?.version).toBe(1);
  });

  it('rejects invalid payloads', () => {
    expect(validatePayload('nope')).toBeNull();
    expect(validatePayload(JSON.stringify({ tables: {} }))).toBeNull();
    expect(validatePayload(JSON.stringify({ version: 99, tables: {} }))).toBeNull();
  });
});