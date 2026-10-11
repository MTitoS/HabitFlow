import { createTestStore } from '@/data/database';
import { createRepositories } from '@/data/repositories/impl';
import { grantWeeklyCredit } from '@/domain/skip-credit/grantWeeklyCredit';
import { useSkip } from '@/domain/skip-credit/useSkip';
import { computeStreaks } from '@/domain/streak/currentStreak';
import { computeOverallStreaks, monthDayStatus } from '@/domain/streak/overallStreak';
import { daySummary } from '@/domain/stats/aggregate';

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
    const habitWithHistory = { ...habit, createdAt: new Date(2026, 3, 1).getTime() };
    await repos.habits.update(habitWithHistory);

    const habit2 = await repos.habits.create({
      name: 'Ler',
      icon: 'book',
      color: 'secondary',
      type: 'binary',
      frequency: { kind: 'daily', schedule: {} },
    });

    await repos.records.ensurePendings(habitWithHistory.id, [today, tomorrow, '2026-05-07'], now);
    expect(await repos.records.forHabit(habitWithHistory.id)).toHaveLength(3);

    await repos.records.setCompleted(habitWithHistory.id, today, now);
    const after = await repos.records.forHabit(habitWithHistory.id);
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

    const facts = await repos.records.forHabit(habitWithHistory.id);
    const todayRecord = facts.find((r) => r.date === today);
    expect(todayRecord?.status).toBe('completed');

    const streaks = computeStreaks(habitWithHistory, facts, now);
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

describe('todos isolation from stats (L7/D12)', () => {
  it('never changes daySummary / overallStreaks / monthDayStatus', async () => {
    const now = new Date(2026, 4, 5, 10, 0, 0);
    const store = createTestStore();
    const repos = createRepositories(store);
    const habit = await repos.habits.create({
      name: 'Ler',
      icon: 'book',
      color: 'primary',
      type: 'binary',
      frequency: { kind: 'daily', schedule: {} },
    });
    await repos.records.setCompleted(habit.id, '2026-05-05', now);

    const records = await repos.records.all();
    const before = {
      streaks: computeOverallStreaks([habit], records, now),
      month: monthDayStatus([habit], records, now),
      summary: daySummary([habit], records, now),
    };

    const todo = await repos.todos.create({ title: 'Comprar leite', date: '2026-05-05' });
    await repos.todos.setCompleted(todo.id, now.getTime());

    const after = {
      streaks: computeOverallStreaks([habit], records, now),
      month: monthDayStatus([habit], records, now),
      summary: daySummary([habit], records, now),
    };

    expect(after).toEqual(before);
  });
});