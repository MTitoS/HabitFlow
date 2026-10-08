import { calendarDayInfo, computeOverallStreaks, isConqueredDay, monthDayStatus } from '@/domain/streak/overallStreak';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';

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

const rec = (habitId: string, date: string, status: HabitRecord['status']): HabitRecord => ({
  id: `${habitId}__${date}`,
  habitId,
  date,
  status,
});

describe('computeOverallStreaks', () => {
  it('T3 all-done: 3 consecutive conquered days => current = 3', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const records = [
      rec('h1', '2026-05-06', 'completed'),
      rec('h1', '2026-05-07', 'completed'),
      rec('h1', '2026-05-08', 'completed'),
    ];
    expect(computeOverallStreaks([habit()], records, now).current).toBe(3);
  });

  it('T3 all-done-except-skip: skipped covers a scheduled habit and still counts', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const habits = [habit({ id: 'h1' }), habit({ id: 'h2' })];
    const records = [
      rec('h1', '2026-05-07', 'completed'),
      rec('h2', '2026-05-07', 'skipped'),
      rec('h1', '2026-05-08', 'completed'),
      rec('h2', '2026-05-08', 'skipped'),
    ];
    expect(computeOverallStreaks(habits, records, now).current).toBe(2);
  });

  it('T3 missed: a past scheduled day without completion resets the streak', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const records = [
      rec('h1', '2026-05-06', 'completed'),
      rec('h1', '2026-05-07', 'missed'),
      rec('h1', '2026-05-08', 'completed'),
    ];
    const result = computeOverallStreaks([habit()], records, now);
    expect(result.current).toBe(1);
    expect(result.best).toBe(1);
  });

  it('a day with no scheduled habit is neutral (does not break, does not add)', () => {
    const nowMonday = new Date(2026, 4, 4, 12, 0, 0);
    const h = habit({
      frequency: { kind: 'weekdays', schedule: { days: ['mon', 'tue', 'wed', 'thu', 'fri'] } },
    });
    const records = [rec('h1', '2026-05-01', 'completed'), rec('h1', '2026-05-04', 'completed')];
    expect(computeOverallStreaks([h], records, nowMonday).current).toBe(2);
  });

  it('pending today does not add or reset the current streak', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const records = [
      rec('h1', '2026-05-06', 'completed'),
      rec('h1', '2026-05-07', 'completed'),
      rec('h1', '2026-05-08', 'pending'),
    ];
    expect(computeOverallStreaks([habit()], records, now).current).toBe(2);
  });

  it('createdAt discards days before the first habit existed', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const h = habit({ createdAt: new Date(2026, 4, 7, 12, 0, 0).getTime() });
    const records = [
      rec('h1', '2026-05-06', 'completed'),
      rec('h1', '2026-05-07', 'completed'),
      rec('h1', '2026-05-08', 'completed'),
    ];
    expect(computeOverallStreaks([h], records, now).current).toBe(2);
  });

  it('best finds a historical run longer than the current one', () => {
    const now = new Date(2026, 4, 10, 12, 0, 0);
    const records = [
      rec('h1', '2026-05-01', 'completed'),
      rec('h1', '2026-05-02', 'completed'),
      rec('h1', '2026-05-03', 'completed'),
      rec('h1', '2026-05-04', 'completed'),
      rec('h1', '2026-05-09', 'completed'),
      rec('h1', '2026-05-10', 'completed'),
    ];
    const result = computeOverallStreaks([habit()], records, now);
    expect(result.current).toBe(2);
    expect(result.best).toBe(4);
  });

  it('ignores archived habits', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const habits = [habit({ id: 'h1' }), habit({ id: 'h2', archivedAt: 1 })];
    const records = [
      rec('h1', '2026-05-08', 'completed'),
      rec('h2', '2026-05-07', 'missed'),
    ];
    expect(computeOverallStreaks(habits, records, now).current).toBe(1);
  });

  it('returns zero with no active habits', () => {
    expect(computeOverallStreaks([], [], new Date(2026, 4, 8))).toEqual({ current: 0, best: 0 });
  });
});

describe('isConqueredDay', () => {
  const habits = [habit({ id: 'h1' }), habit({ id: 'h2' })];

  it('is true when all scheduled habits are completed or skipped', () => {
    const records = [rec('h1', '2026-05-08', 'completed'), rec('h2', '2026-05-08', 'skipped')];
    expect(isConqueredDay(habits, records, '2026-05-08')).toBe(true);
  });

  it('is false when any scheduled habit is missed', () => {
    const records = [rec('h1', '2026-05-08', 'completed'), rec('h2', '2026-05-08', 'missed')];
    expect(isConqueredDay(habits, records, '2026-05-08')).toBe(false);
  });

  it('is false when a scheduled habit has no record', () => {
    expect(isConqueredDay(habits, [rec('h1', '2026-05-08', 'completed')], '2026-05-08')).toBe(false);
  });

  it('is false when nothing is scheduled', () => {
    const none = habit({
      frequency: { kind: 'weekdays', schedule: { days: ['sat'] } },
      createdAt: new Date(2026, 4, 1).getTime(),
    });
    expect(isConqueredDay([none], [], '2026-05-08')).toBe(false);
  });
});

describe('calendarDayInfo', () => {
  const habits = [habit({ id: 'h1' }), habit({ id: 'h2' })];

  it('is conquered when every scheduled habit is completed or skipped', () => {
    const records = [rec('h1', '2026-05-08', 'completed'), rec('h2', '2026-05-08', 'skipped')];
    const info = calendarDayInfo(habits, records, '2026-05-08');
    expect(info).toEqual({ dateKey: '2026-05-08', mark: 'conquered', scheduled: 2, done: 1, skipped: 1 });
  });

  it('is partial when some but not all scheduled habits are completed', () => {
    const records = [rec('h1', '2026-05-08', 'completed')];
    const info = calendarDayInfo(habits, records, '2026-05-08');
    expect(info.mark).toBe('partial');
    expect(info.done).toBe(1);
    expect(info.skipped).toBe(0);
  });

  it('flags skip when a non-conquered day has skips and no completions', () => {
    const records = [rec('h1', '2026-05-08', 'skipped')];
    const info = calendarDayInfo(habits, records, '2026-05-08');
    expect(info.mark).toBe('skip');
    expect(info.skipped).toBe(1);
    expect(info.done).toBe(0);
  });

  it('is pending when a scheduled day has no record (today open, not a failure)', () => {
    const info = calendarDayInfo(habits, [], '2026-05-08');
    expect(info).toEqual({ dateKey: '2026-05-08', mark: 'pending', scheduled: 2, done: 0, skipped: 0 });
  });

  it('is pending with scheduled 0 when nothing is scheduled', () => {
    const weekend = habit({
      frequency: { kind: 'weekdays', schedule: { days: ['mon', 'tue', 'wed', 'thu', 'fri'] } },
    });
    const info = calendarDayInfo([weekend], [], '2026-05-09');
    expect(info).toEqual({ dateKey: '2026-05-09', mark: 'pending', scheduled: 0, done: 0, skipped: 0 });
  });

  it('ignores archived habits', () => {
    const mixed = [habit({ id: 'h1' }), habit({ id: 'h2', archivedAt: 1 })];
    const records = [rec('h1', '2026-05-08', 'completed'), rec('h2', '2026-05-08', 'skipped')];
    const info = calendarDayInfo(mixed, records, '2026-05-08');
    expect(info).toEqual({ dateKey: '2026-05-08', mark: 'conquered', scheduled: 1, done: 1, skipped: 0 });
  });

  it('agrees with isConqueredDay on the conquered mark', () => {
    const records = [rec('h1', '2026-05-08', 'completed'), rec('h2', '2026-05-08', 'skipped')];
    expect(calendarDayInfo(habits, records, '2026-05-08').mark).toBe(
      isConqueredDay(habits, records, '2026-05-08') ? 'conquered' : 'not-conquered',
    );
  });
});

describe('monthDayStatus', () => {
  it('marks conquered, partial and neutral days of the current month', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const h = habit();
    const records = [
      rec('h1', '2026-05-06', 'completed'),
      rec('h1', '2026-05-07', 'completed'),
      rec('h1', '2026-05-08', 'completed'),
    ];
    const statuses = monthDayStatus([h], records, now);
    const byDate = new Map(statuses.map((s) => [s.dateKey, s.state]));
    expect(byDate.get('2026-05-08')).toBe('conquered');
    expect(byDate.get('2026-05-05')).toBe('neutral');
    expect(statuses).toHaveLength(31);
  });

  it('marks a day with progress but not conquered as partial', () => {
    const now = new Date(2026, 4, 8, 12, 0, 0);
    const habits = [habit({ id: 'h1' }), habit({ id: 'h2' })];
    const records = [rec('h1', '2026-05-07', 'completed')];
    const byDate = new Map(monthDayStatus(habits, records, now).map((s) => [s.dateKey, s.state]));
    expect(byDate.get('2026-05-07')).toBe('partial');
  });
});
