import { composeDay, daySummary, monthlySeries, totals, weeklySeries } from '@/domain/stats/aggregate';
import { Habit } from '@/domain/habit/model';
import { HabitRecord, indexRecords } from '@/domain/record/model';

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

  it('C3: dayStreakCurrent counts conquered days; skip is neutral', () => {
    const records = [
      rec('a', '2026-05-04', 'completed'),
      rec('a', '2026-05-05', 'skipped'),
      rec('a', '2026-05-06', 'completed'),
    ];
    const summary = daySummary([habit('a')], records, now);
    expect(summary.dayStreakCurrent).toBe(3);
  });

  it('C3: dayStreakCurrent resets on a missed scheduled day', () => {
    const records = [
      rec('a', '2026-05-04', 'completed'),
      rec('a', '2026-05-05', 'missed'),
      rec('a', '2026-05-06', 'completed'),
    ];
    expect(daySummary([habit('a')], records, now).dayStreakCurrent).toBe(1);
  });

  it('C3: legacy overallCurrentStreak stays the max individual streak', () => {
    const records = [
      rec('a', '2026-05-01', 'completed'),
      rec('a', '2026-05-02', 'completed'),
      rec('a', '2026-05-03', 'completed'),
      rec('a', '2026-05-04', 'completed'),
      rec('a', '2026-05-05', 'completed'),
      rec('a', '2026-05-06', 'completed'),
      rec('b', '2026-05-06', 'completed'),
    ];
    const summary = daySummary([habit('a'), habit('b')], records, now);
    expect(summary.overallCurrentStreak).toBe(6);
    expect(summary.dayStreakCurrent).toBe(1);
  });

  it('C1: composeDay buckets scheduled/done/skipped/undone', () => {
    const habits = [habit('a'), habit('b'), habit('c'), habit('d')];
    const records = [
      rec('a', '2026-05-06', 'completed'),
      rec('b', '2026-05-06', 'skipped'),
      rec('c', '2026-05-06', 'missed'),
      // d has no record -> undone
    ];
    const c = composeDay(habits, indexRecords(records), '2026-05-06');
    expect(c).toEqual({ scheduled: 4, done: 1, skipped: 1, undone: 2 });
  });

  it('C1: skipped has its own bucket (not done, not undone)', () => {
    const c = composeDay([habit('a')], indexRecords([rec('a', '2026-05-06', 'skipped')]), '2026-05-06');
    expect(c.done).toBe(0);
    expect(c.skipped).toBe(1);
    expect(c.undone).toBe(0);
  });

  it('C1: undone merges pending, missed and missing record', () => {
    const habits = [habit('a'), habit('b'), habit('c')];
    const records = [
      rec('a', '2026-05-06', 'pending'),
      rec('b', '2026-05-06', 'missed'),
      // c has no record
    ];
    const c = composeDay(habits, indexRecords(records), '2026-05-06');
    expect(c.undone).toBe(3);
  });

  it('C1: day with no scheduled habit is all zeros', () => {
    const future = { ...habit('a'), createdAt: new Date(2026, 5, 1).getTime() };
    const c = composeDay([future], indexRecords([]), '2026-05-06');
    expect(c).toEqual({ scheduled: 0, done: 0, skipped: 0, undone: 0 });
  });

  it('C1: archived habit record does not count', () => {
    const archived = { ...habit('a'), archivedAt: 1 };
    const c = composeDay([archived], indexRecords([rec('a', '2026-05-06', 'completed')]), '2026-05-06');
    expect(c).toEqual({ scheduled: 0, done: 0, skipped: 0, undone: 0 });
  });

  it('C1: invariant done+skipped+undone === scheduled', () => {
    const habits = [habit('a'), habit('b'), habit('c')];
    const records = [
      rec('a', '2026-05-06', 'completed'),
      rec('b', '2026-05-06', 'skipped'),
    ];
    const c = composeDay(habits, indexRecords(records), '2026-05-06');
    expect(c.done + c.skipped + c.undone).toBe(c.scheduled);
  });

  it('C2: weeklySeries exposes done/skipped/undone matching composeDay', () => {
    const habits = [habit('a'), habit('b')];
    const records = [
      rec('a', '2026-05-06', 'completed'),
      rec('b', '2026-05-06', 'skipped'),
    ];
    const series = weeklySeries(habits, records, now);
    const may6 = series.find((p) => p.dateKey === '2026-05-06');
    expect(may6?.scheduled).toBe(2);
    expect(may6?.done).toBe(1);
    expect(may6?.skipped).toBe(1);
    expect(may6?.undone).toBe(0);
  });

  it('C2: monthlySeries undone merges missed + missing record', () => {
    const habits = [habit('a'), habit('b'), habit('c')];
    const records = [
      rec('a', '2026-05-06', 'completed'),
      rec('b', '2026-05-06', 'missed'),
    ];
    const series = monthlySeries(habits, records, now);
    const may6 = series.find((p) => p.dateKey === '2026-05-06');
    expect(may6?.done).toBe(1);
    expect(may6?.skipped).toBe(0);
    expect(may6?.undone).toBe(2);
  });

  it('C2: legacy completed/percent preserved alongside new fields', () => {
    const habits = [habit('a'), habit('b')];
    const records = [rec('a', '2026-05-06', 'completed')];
    const series = weeklySeries(habits, records, now);
    const may6 = series.find((p) => p.dateKey === '2026-05-06');
    expect(may6?.completed).toBe(1);
    expect(may6?.percent).toBeCloseTo(0.5, 5);
  });

  it('C2: archived habit record does not inflate done', () => {
    const habits = [habit('a'), { ...habit('b'), archivedAt: 1 }];
    const records = [rec('b', '2026-05-05', 'completed')];
    const series = weeklySeries(habits, records, now);
    const may5 = series.find((p) => p.dateKey === '2026-05-05');
    expect(may5?.scheduled).toBe(1);
    expect(may5?.done).toBe(0);
  });

  it('C2: day without scheduled has zero composition and percent', () => {
    const late = { ...habit('z'), createdAt: new Date(2026, 4, 6, 9, 0, 0).getTime() };
    const series = weeklySeries([late], [], now);
    const may5 = series.find((p) => p.dateKey === '2026-05-05');
    expect(may5?.done).toBe(0);
    expect(may5?.skipped).toBe(0);
    expect(may5?.undone).toBe(0);
    expect(may5?.percent).toBe(0);
  });
});