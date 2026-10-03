import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';

let seq = 0;
function makeHabit(overrides: Partial<Habit>): Habit {
  seq += 1;
  return {
    id: `h${seq}`,
    name: 'Habit',
    icon: 'fire',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('isScheduled', () => {
  it('daily is always scheduled', () => {
    const habit = makeHabit({});
    expect(isScheduled(habit, '2026-05-01')).toBe(true);
    expect(isScheduled(habit, '2026-05-02')).toBe(true);
  });

  it('weekdays respects day set', () => {
    const monWed = makeHabit({
      frequency: { kind: 'weekdays', schedule: { days: ['mon', 'wed'] } },
    });
    expect(isScheduled(monWed, '2026-05-04')).toBe(true); // Monday
    expect(isScheduled(monWed, '2026-05-06')).toBe(true); // Wednesday
    expect(isScheduled(monWed, '2026-05-03')).toBe(false); // Sunday
    expect(isScheduled(monWed, '2026-05-07')).toBe(false); // Thursday
  });

  it('weekdays with empty days defaults to scheduled', () => {
    const habit = makeHabit({ frequency: { kind: 'weekdays', schedule: {} } });
    expect(isScheduled(habit, '2026-05-04')).toBe(true);
  });

  it('x_per_week=3 produces 3 distinct scheduled days', () => {
    const habit = makeHabit({
      frequency: { kind: 'x_per_week', schedule: { countPerPeriod: 3 } },
    });
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const key = `2026-05-${String(4 + i).padStart(2, '0')}`;
      if (isScheduled(habit, key)) days.push(key);
    }
    expect(days.length).toBe(3);
  });

  it('x_per_month respects days in month', () => {
    const habit = makeHabit({
      frequency: { kind: 'x_per_month', schedule: { countPerPeriod: 10 } },
    });
    const feb = [];
    for (let i = 1; i <= 28; i += 1) {
      const key = `2026-02-${String(i).padStart(2, '0')}`;
      if (isScheduled(habit, key)) feb.push(key);
    }
    expect(feb.length).toBe(10);
  });

  it('x_per_week is consistent across the same week', () => {
    const habit = makeHabit({
      frequency: { kind: 'x_per_week', schedule: { countPerPeriod: 2 } },
    });
    const mon = '2026-05-04';
    const thu = '2026-05-07';
    const sun = '2026-05-10';
    const nextMon = '2026-05-11';
    expect(isScheduled(habit, mon)).toBe(true);
    expect(isScheduled(habit, thu)).toBe(true);
    expect(isScheduled(habit, sun)).toBe(false);
    expect(isScheduled(habit, nextMon)).toBe(true);
  });

  it('boundary: first day of week is always scheduled for x_per_week', () => {
    const habit = makeHabit({
      frequency: { kind: 'x_per_week', schedule: { countPerPeriod: 4 } },
    });
    expect(isScheduled(habit, '2026-05-04')).toBe(true);
  });
});