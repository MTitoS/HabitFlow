import { remindersForDay } from '@/services/notifications/policy';
import { Habit } from '@/domain/habit/model';

function habit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: 'h1',
    name: 'Ler',
    icon: 'book',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    reminder: { enabled: true, times: ['08:00'] },
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('remindersForDay (OPEN 15.5)', () => {
  const now = new Date(2026, 4, 6, 10, 0, 0); // 08:00 passed
  const today = '2026-05-06';

  it('schedules a future time for today', () => {
    const jobs = remindersForDay(habit(), today, new Date(2026, 4, 6, 7, 0, 0));
    expect(jobs).toHaveLength(1);
    expect(jobs[0].time).toBe('08:00');
  });

  it('skips a time already past when LATE_NOTIFICATION=false', () => {
    const jobs = remindersForDay(habit(), today, now);
    expect(jobs).toHaveLength(0);
  });

  it('multiple times produce multiple jobs when all in the future', () => {
    const h = habit({ reminder: { enabled: true, times: ['07:00', '09:00'] } });
    const jobs = remindersForDay(h, today, new Date(2026, 4, 6, 8, 0, 0));
    expect(jobs.map((j) => j.time)).toEqual(['09:00']);
  });

  it('does not schedule on a non-scheduled day', () => {
    const h = habit({
      frequency: { kind: 'weekdays', schedule: { days: ['mon'] } },
    });
    expect(remindersForDay(h, '2026-05-10', new Date(2026, 4, 10, 7, 0, 0))).toEqual([]);
  });

  it('returns nothing when reminder is disabled or empty', () => {
    expect(remindersForDay(habit({ reminder: { enabled: false, times: ['08:00'] } }), today, new Date(2026, 4, 6, 7, 0, 0))).toEqual([]);
    expect(remindersForDay(habit({ reminder: { enabled: true, times: [] } }), today, new Date(2026, 4, 6, 7, 0, 0))).toEqual([]);
  });
});