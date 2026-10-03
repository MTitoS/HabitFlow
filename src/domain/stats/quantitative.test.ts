import { quantitativeStats } from '@/domain/stats/quantitative';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

function habit(): Habit {
  return {
    id: 'h1',
    name: 'Água',
    icon: 'droplet',
    color: 'primary',
    type: 'quantitative',
    targetValue: 8,
    unit: 'litros',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: 0,
    updatedAt: 0,
  };
}

const rec = (date: string, value?: number): HabitRecord => ({
  id: `h1__${date}`,
  habitId: 'h1',
  date,
  status: value != null ? 'completed' : 'skipped',
  value,
});

describe('quantitativeStats', () => {
  it('computes total, average and goal met rate', () => {
    const records = [rec('2026-05-04', 8), rec('2026-05-05', 10), rec('2026-05-06', 5)];
    const s = quantitativeStats(habit(), records);
    expect(s.total).toBe(23);
    expect(s.daysCompleted).toBe(3);
    expect(s.averagePerCompleted).toBeCloseTo(23 / 3, 5);
    expect(s.daysGoalMet).toBe(2);
    expect(s.goalMetRate).toBeCloseTo(2 / 3, 5);
    expect(s.unit).toBe('litros');
  });

  it('uses custom unit when present', () => {
    const h = { ...habit(), customUnit: 'copos' };
    expect(quantitativeStats(h, [rec('2026-05-04', 3)]).unit).toBe('copos');
  });

  it('returns zeros for empty history', () => {
    const s = quantitativeStats(habit(), []);
    expect(s.total).toBe(0);
    expect(s.series).toEqual([]);
  });

  it('keeps series ordered by date', () => {
    const records = [rec('2026-05-06', 5), rec('2026-05-04', 8)];
    expect(quantitativeStats(habit(), records).series.map((p) => p.dateKey)).toEqual([
      '2026-05-04',
      '2026-05-06',
    ]);
  });

  it('excludes skipped records from value series', () => {
    const records = [rec('2026-05-04', 8), rec('2026-05-05')];
    expect(quantitativeStats(habit(), records).series).toHaveLength(1);
  });
});