import { completionRate } from '@/domain/stats/completionRate';
import { HabitRecord } from '@/domain/record/model';

const rec = (date: string, status: HabitRecord['status']): HabitRecord => ({
  id: `x__${date}`,
  habitId: 'h1',
  date,
  status,
});

describe('completionRate', () => {
  const scheduled = ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08'];

  it('returns 0 with no scheduled dates', () => {
    expect(completionRate([], [])).toBe(0);
  });

  it('counts completed, ignores missed and pending', () => {
    const records = [
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'completed'),
      rec('2026-05-06', 'pending'),
    ];
    expect(completionRate(records, scheduled)).toBe(2 / 5);
  });

  it('skip is neutral: not autocompleted, stays in denominator', () => {
    const records = [
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'completed'),
      rec('2026-05-06', 'skipped'),
      rec('2026-05-07', 'skipped'),
    ];
    expect(completionRate(records, scheduled)).toBeCloseTo(0.4, 5);
  });

  it('full completion is 1', () => {
    const records = scheduled.map((d) => rec(d, 'completed'));
    expect(completionRate(records, scheduled)).toBe(1);
  });
});