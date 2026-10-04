import { createTestStore } from '@/data/database';
import { createRepositories } from '@/data/repositories/impl';
import { OPEN } from '@/config/opens';

describe('database', () => {
  it('opens in-memory store and roundtrips rows', async () => {
    const store = createTestStore();
    await store.writeTable('habits', [{ id: 'a', name: 'x' }]);
    const rows = await store.readTable<{ id: string; name: string }>('habits');
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('x');
  });

  it('notifies subscribers on writes', async () => {
    const store = createTestStore();
    const listener = jest.fn();
    store.subscribe(listener);
    await store.writeTable('habits', []);
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect(listener).toHaveBeenCalled();
  });

  it('clear and restore replace contents', async () => {
    const store = createTestStore();
    await store.writeTable('habits', [{ id: 'a' }]);
    await store.restoreTables({ habits: [{ id: 'b' }] });
    const rows = await store.readTable<{ id: string }>('habits');
    expect(rows[0].id).toBe('b');
  });
});

describe('repositories write contract', () => {
  const now = new Date(2026, 4, 5, 10, 0, 0);
  const today = '2026-05-05';
  const yesterday = '2026-05-04';

  async function setup() {
    const store = createTestStore();
    const repos = createRepositories(store);
    const habit = await repos.habits.create({
      name: 'Ler',
      icon: 'book',
      color: 'primary',
      type: 'binary',
      frequency: { kind: 'daily', schedule: {} },
    });
    return { store, repos, habit };
  }

  it('record unique per (habitId, date) — overwriting same day replaces', async () => {
    const { repos, habit } = await setup();
    await repos.records.setCompleted(habit.id, today, now);
    const all = await repos.records.forHabit(habit.id);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(`${habit.id}__${today}`);
  });

  it('append-only: refuses editing a past date', async () => {
    const { repos, habit } = await setup();
    await expect(repos.records.setCompleted(habit.id, yesterday, now)).rejects.toThrow(
      'record_write_past_date',
    );
  });

  it('append-only: refuses overwriting a completed fact', async () => {
    const { repos, habit } = await setup();
    await repos.records.setCompleted(habit.id, today, now);
    await expect(repos.records.setCompleted(habit.id, today, now)).rejects.toThrow(
      'record_conflict',
    );
  });

  it('skip is a persisted fact, not a rewrite', async () => {
    const { repos, habit } = await setup();
    await repos.records.setSkipped(habit.id, today, now);
    const all = await repos.records.forHabit(habit.id);
    expect(all[0].status).toBe('skipped');
  });

  it('toggle: setPending reverts a completed record to pending (same day, single record)', async () => {
    const { repos, habit } = await setup();
    await repos.records.setCompleted(habit.id, today, now);
    await repos.records.setPending(habit.id, today, now);
    const all = await repos.records.forHabit(habit.id);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(`${habit.id}__${today}`);
    expect(all[0].status).toBe('pending');
  });

  it('toggle: refuses to setPending a past date (append-only intact)', async () => {
    const { repos, habit } = await setup();
    await repos.records.setCompleted(habit.id, today, now);
    await expect(repos.records.setPending(habit.id, yesterday, now)).rejects.toThrow(
      'record_write_past_date',
    );
  });

  it('toggle: refuses to setPending when record is not completed', async () => {
    const { repos, habit } = await setup();
    await expect(repos.records.setPending(habit.id, today, now)).rejects.toThrow('record_conflict');
    await repos.records.setSkipped(habit.id, today, now);
    await expect(repos.records.setPending(habit.id, today, now)).rejects.toThrow('record_conflict');
  });

  it('toggle: completed -> pending -> completed transitions roundtrip cleanly', async () => {
    const { repos, habit } = await setup();
    await repos.records.setCompleted(habit.id, today, now);
    await repos.records.setPending(habit.id, today, now);
    expect((await repos.records.forHabit(habit.id))[0].status).toBe('pending');
    await repos.records.setCompleted(habit.id, today, now);
    const final = await repos.records.forHabit(habit.id);
    expect(final).toHaveLength(1);
    expect(final[0].status).toBe('completed');
  });

  it('toggle: skip credit stays untouched by record toggling', async () => {
    const { repos, habit } = await setup();
    const before = await repos.skipCredit.get();
    await repos.records.setCompleted(habit.id, today, now);
    await repos.records.setPending(habit.id, today, now);
    const after = await repos.skipCredit.get();
    expect(after.balance).toBe(before.balance);
  });

  it('skip credit is a singleton with fixed id', async () => {
    const { repos } = await setup();
    const first = await repos.skipCredit.get();
    const second = await repos.skipCredit.get();
    expect(first.id).toBe(OPEN.SKIP_CREDIT_SINGLETON_ID);
    expect(first.id).toBe(second.id);
  });

  it('ensurePendings creates future pending records and cleans stale ones', async () => {
    const { repos, habit } = await setup();
    const futureKeys = ['2026-05-06', '2026-05-07'];
    await repos.records.ensurePendings(habit.id, futureKeys, now);
    const all = await repos.records.forHabit(habit.id);
    expect(all).toHaveLength(2);
    expect(all.every((r) => r.status === 'pending')).toBe(true);

    await repos.records.ensurePendings(habit.id, ['2026-05-06'], now);
    const after = await repos.records.forHabit(habit.id);
    expect(after.map((r) => r.date)).toEqual(['2026-05-06']);
  });

  it('archive moves habit out of active list', async () => {
    const { repos, habit } = await setup();
    await repos.habits.archive(habit.id, Date.now());
    expect((await repos.habits.active()).map((h) => h.id)).not.toContain(habit.id);
    expect((await repos.habits.archived()).map((h) => h.id)).toContain(habit.id);
  });

  it('T6: undoSkipped reverts today-only skipped record to pending', async () => {
    const { repos, habit } = await setup();
    await repos.records.setSkipped(habit.id, today, now);
    await repos.records.undoSkipped(habit.id, today, now);
    const all = await repos.records.forHabit(habit.id);
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(`${habit.id}__${today}`);
    expect(all[0].status).toBe('pending');
  });

  it('T6: refuses to undoSkipped a past date (append-only intact)', async () => {
    const { repos, habit } = await setup();
    await repos.records.setSkipped(habit.id, today, now);
    await expect(repos.records.undoSkipped(habit.id, yesterday, now)).rejects.toThrow(
      'record_write_past_date',
    );
  });

  it('T6: refuses to undoSkipped a record that is not skipped', async () => {
    const { repos, habit } = await setup();
    await repos.records.setCompleted(habit.id, today, now);
    await expect(repos.records.undoSkipped(habit.id, today, now)).rejects.toThrow(
      'record_conflict',
    );
  });
});