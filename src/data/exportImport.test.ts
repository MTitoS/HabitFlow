import { buildExport, importPayload, validatePayload } from '@/data/exportImport';
import { createTestStore } from '@/data/database';
import { createRepositories } from '@/data/repositories/impl';
import { DB_VERSION, TABLES } from '@/data/schema';
import { applyMigrations } from '@/data/migrations';

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

  it('payload carries current version + exportedAt (sync-ready)', () => {
    const payload = validatePayload(JSON.stringify({ version: 1, exportedAt: '2026-01-01', tables: {} }));
    expect(payload?.version).toBe(DB_VERSION);
  });

  it('rejects invalid payloads', () => {
    expect(validatePayload('nope')).toBeNull();
    expect(validatePayload(JSON.stringify({ tables: {} }))).toBeNull();
    expect(validatePayload(JSON.stringify({ version: 99, tables: {} }))).toBeNull();
  });

  it('declares the todos table and bumps DB_VERSION to 2 (Q6)', () => {
    expect(TABLES).toContain('todos');
    expect(DB_VERSION).toBe(2);
  });

  it('adds an empty todos table when migrating a v1 snapshot (Q6)', () => {
    const migrated = applyMigrations({ habits: [], records: [] }, 1);
    expect(migrated.todos).toEqual([]);
  });

  it('accepts a legacy v1 backup without todos (Q21)', () => {
    const legacy = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01',
      tables: { habits: [], records: [], routines: [], skipcredit: [] },
    });
    const payload = validatePayload(legacy);
    expect(payload).not.toBeNull();
    expect(payload?.version).toBe(2);
    expect(payload?.tables.todos).toEqual([]);
  });

  it('does not re-run the v1→v2 migration on a current snapshot', () => {
    const migrated = applyMigrations({ todos: [{ id: 't1' }] }, 2);
    expect(migrated.todos).toEqual([{ id: 't1' }]);
  });

  it('roundtrips todos through export/import (Q21/C5-8)', async () => {
    const storeA = createTestStore();
    const reposA = createRepositories(storeA);
    await reposA.todos.create({ title: 'Comprar leite', date: '2026-05-05' });
    const someday = await reposA.todos.create({ title: 'Algum dia' });
    await reposA.todos.setCompleted(someday.id, 123456);

    const json = JSON.stringify(buildExport(storeA));
    const storeB = createTestStore();
    await importPayload(storeB, json);

    const todosB = await storeB.readTable<{ id: string; title: string; completed?: boolean; completedAt?: number }>('todos');
    expect(todosB).toHaveLength(2);
    expect(todosB.map((t) => t.title).sort()).toEqual(['Algum dia', 'Comprar leite']);
    const restored = todosB.find((t) => t.id === someday.id);
    expect(restored?.completed).toBe(true);
    expect(restored?.completedAt).toBe(123456);
  });

  it('imports a v1 legacy backup and materializes an empty todos table (Q21)', async () => {
    const store = createTestStore();
    const legacy = JSON.stringify({
      version: 1,
      exportedAt: '2026-01-01',
      tables: { habits: [], records: [], routines: [], skipcredit: [] },
    });
    const payload = await importPayload(store, legacy);
    expect(payload.tables.todos).toEqual([]);
    expect(store.snapshotTables().todos).toEqual([]);
  });
});