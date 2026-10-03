import { createTestStore } from '@/data/database';
import { createRepositories } from '@/data/repositories/impl';
import { grantWeeklyCredit } from '@/domain/skip-credit/grantWeeklyCredit';
import { useSkip } from '@/domain/skip-credit/useSkip';
import { computeStreaks } from '@/domain/streak/currentStreak';

describe('integration: full persistence flow', () => {
  const now = new Date(2026, 4, 5, 10, 0, 0);
  const today = '2026-05-05';
  const tomorrow = '2026-05-06';

  it('create habit → schedule future pendings → complete today → grants + uses skip → streak', async () => {
    const store = createTestStore();
    const repos = createRepositories(store);

    const habit = await repos.habits.create({
      name: 'Correr',
      icon: 'activity',
      color: 'primary',
      type: 'binary',
      frequency: { kind: 'daily', schedule: {} },
    });

    const habit2 = await repos.habits.create({
      name: 'Ler',
      icon: 'book',
      color: 'secondary',
      type: 'binary',
      frequency: { kind: 'daily', schedule: {} },
    });

    await repos.records.ensurePendings(habit.id, [today, tomorrow, '2026-05-07'], now);
    expect(await repos.records.forHabit(habit.id)).toHaveLength(3);

    await repos.records.setCompleted(habit.id, today, now);
    const after = await repos.records.forHabit(habit.id);
    expect(after.find((r) => r.date === today)?.status).toBe('completed');

    let credit = await repos.skipCredit.get();
    credit = grantWeeklyCredit(credit, now);
    await repos.skipCredit.save(credit);
    expect((await repos.skipCredit.get()).balance).toBe(1);

    const skip = useSkip(credit, now, habit2.id, today);
    expect(skip.ok).toBe(true);
    if (skip.ok) {
      await repos.skipCredit.save(skip.state);
      await repos.records.setSkipped(habit2.id, today, now);
    }
    expect((await repos.skipCredit.get()).balance).toBe(0);

    const skippedFacts = await repos.records.forHabit(habit2.id);
    expect(skippedFacts[0].status).toBe('skipped');

    const facts = await repos.records.forHabit(habit.id);
    const todayRecord = facts.find((r) => r.date === today);
    expect(todayRecord?.status).toBe('completed');

    const streaks = computeStreaks(habit, facts, now);
    expect(streaks.current).toBe(1);
  });

  it('persists across a fresh repository instance over the same store', async () => {
    const store = createTestStore();
    const repoA = createRepositories(store);
    const habit = await repoA.habits.create({
      name: 'Água',
      icon: 'droplet',
      color: 'accent',
      type: 'quantitative',
      targetValue: 8,
      unit: 'litros',
      frequency: { kind: 'daily', schedule: {} },
    });

    const repoB = createRepositories(store);
    const loaded = await repoB.habits.byId(habit.id);
    expect(loaded?.name).toBe('Água');
    expect(loaded?.targetValue).toBe(8);
  });
});