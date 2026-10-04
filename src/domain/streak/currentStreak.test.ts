import { currentStreak, bestStreak } from '@/domain/streak/currentStreak';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

const day = new Date(2026, 4, 8, 12, 0, 0);

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Teste',
    icon: 'fire',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: new Date(2026, 3, 1).getTime(),
    updatedAt: 0,
    ...overrides,
  };
}

const rec = (date: string, status: HabitRecord['status']): HabitRecord => ({
  id: `h1__${date}`,
  habitId: 'h1',
  date,
  status,
});

describe('currentStreak', () => {
  it('driver §7: miss in the middle resets current streak', () => {
    const records = [
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'completed'),
      rec('2026-05-06', 'completed'),
      rec('2026-05-08', 'completed'),
    ];
    expect(currentStreak(habit(), records, day)).toBe(1);
  });

  it('skip does not break or extend the streak', () => {
    const records = [
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'skipped'),
      rec('2026-05-06', 'completed'),
      rec('2026-05-07', 'completed'),
    ];
    expect(currentStreak(habit(), records, new Date(2026, 4, 7, 12, 0, 0))).toBe(3);
  });

  it('weekday frequency ignores non-scheduled weekend days', () => {
    const h = habit({ frequency: { kind: 'weekdays', schedule: { days: ['mon', 'tue', 'wed', 'thu', 'fri'] } } });
    const records = [
      rec('2026-04-27', 'completed'),
      rec('2026-04-28', 'completed'),
      rec('2026-04-29', 'completed'),
      rec('2026-04-30', 'completed'),
      rec('2026-05-01', 'completed'),
    ];
    expect(currentStreak(h, records, new Date(2026, 4, 3, 12, 0, 0))).toBe(5);
  });

  it('x_per_week counts consecutive scheduled days across weeks', () => {
    const h = habit({ frequency: { kind: 'x_per_week', schedule: { countPerPeriod: 3 } } });
    const records = [
      rec('2026-04-27', 'completed'),
      rec('2026-04-29', 'completed'),
      rec('2026-05-01', 'completed'),
      rec('2026-05-04', 'completed'),
      rec('2026-05-06', 'completed'),
      rec('2026-05-08', 'completed'),
    ];
    expect(currentStreak(h, records, new Date(2026, 4, 8, 12, 0, 0))).toBe(6);
  });

  it('scheduled day without record resets', () => {
    const records = [
      rec('2026-05-04', 'completed'),
      rec('2026-05-05', 'completed'),
      rec('2026-05-07', 'completed'),
    ];
    expect(currentStreak(habit(), records, new Date(2026, 4, 7, 12, 0, 0))).toBe(1);
  });

  it('daily streak with consecutive completions', () => {
    const records = [
      rec('2026-05-05', 'completed'),
      rec('2026-05-06', 'completed'),
      rec('2026-05-07', 'completed'),
    ];
    expect(currentStreak(habit(), records, new Date(2026, 4, 7, 12, 0, 0))).toBe(3);
  });

  it('T7: streak never counts scheduled days before the habit was created', () => {
    const h = habit({ createdAt: new Date(2026, 4, 7, 12, 0, 0).getTime() });
    expect(currentStreak(h, [], day)).toBe(0);
    expect(bestStreak(h, [], day)).toBe(0);
  });
});