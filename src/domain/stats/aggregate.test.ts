import { daySummary, monthlySeries, totals, weeklySeries } from '@/domain/stats/aggregate';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

function habit(id: string, frequency: Habit['frequency'] = { kind: 'daily', schedule: {} }): Habit {
  return {
    id,
    name: id,
    icon: 'circle',
    color: 'primary',
    type: 'binary',
    frequency,
    createdAt: 0,
    updatedAt: 0,
  };
}

const rec = (habitId: string, date: string, status: HabitRecord['status']): HabitRecord => ({
  id: `${habitId}__${date}`,
  habitId,
  date,
  status,
});

describe('aggregate', () => {
  const now = new Date(2026, 4, 6, 9, 0, 0); // 2026-05-06 Wednesday

  it('daySummary counts scheduled and completed', () => {
    const habits = [habit('a'), habit('b'), habit('c')];
    const records = [rec('a', '2026-05-06', 'completed'), rec('b', '2026-05-06', 'completed')];
    const summary = daySummary(habits, records, now);
    expect(summary.scheduledToday).toBe(3);
    expect(summary.completedToday).toBe(2);
    expect(summary.percent).toBeCloseTo(2 / 3, 5);
  });

  it('daySummary ignores archived habits', () => {
    const habits = [habit('a'), { ...habit('b'), archivedAt: 1 }];
    expect(daySummary(habits, [], now).scheduledToday).toBe(1);
  });

  it('weeklySeries has 7 points starting Monday', () => {
    const series = weeklySeries([habit('a')], [], now);
    expect(series).toHaveLength(7);
    expect(series[0].dateKey).toBe('2026-05-04');
  });

  it('monthlySeries covers the current month', () => {
    const series = monthlySeries([habit('a')], [rec('a', '2026-05-06', 'completed')], now);
    expect(series).toHaveLength(31);
    const may6 = series.find((p) => p.dateKey === '2026-05-06');
    expect(may6?.completed).toBe(1);
  });

  it('T7: habit created today does not change yesterday weekly completion', () => {
    const createdToday = { ...habit('a'), createdAt: new Date(2026, 4, 6, 9, 0, 0).getTime() };
    const series = weeklySeries([createdToday], [rec('a', '2026-05-06', 'completed')], now);
    const yesterday = series.find((p) => p.dateKey === '2026-05-05');
    expect(yesterday?.scheduled).toBe(0);
    expect(yesterday?.percent).toBe(0);
    const todayPoint = series.find((p) => p.dateKey === '2026-05-06');
    expect(todayPoint?.scheduled).toBe(1);
  });

  it('totals counts completions and skips', () => {
    const t = totals([habit('a')], [
      rec('a', '2026-05-04', 'completed'),
      rec('a', '2026-05-05', 'skipped'),
    ]);
    expect(t.completions).toBe(1);
    expect(t.skips).toBe(1);
    expect(t.activeHabits).toBe(1);
  });
});