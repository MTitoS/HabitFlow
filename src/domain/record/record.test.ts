import {
  canCompleteRetroactive,
  canCompleteToday,
  complete,
  pending,
  retroactiveCompletionValue,
  skipped,
} from '@/domain/record/transitions';
import { Habit } from '@/domain/habit/model';

describe('record transitions', () => {
  const now = new Date(2026, 4, 5, 10, 0, 0); // 2026-05-05
  const today = '2026-05-05';

  it('allows completing today when no record exists', () => {
    expect(canCompleteToday(undefined, today, now)).toBe(true);
  });

  it('allows completing a pending record today', () => {
    const record = pending('h1', today);
    expect(canCompleteToday(record, today, now)).toBe(true);
  });

  it('refuses to edit a past date', () => {
    const record = pending('h1', '2026-05-04');
    expect(canCompleteToday(record, '2026-05-04', now)).toBe(false);
  });

  it('refuses to complete a record already completed', () => {
    const done = { ...complete('h1', today, now), id: 'r' } as const;
    expect(canCompleteToday({ ...done }, today, now)).toBe(false);
  });

  it('refuses to complete a skipped record', () => {
    const record = { ...skipped('h1', today, now), id: 'r' };
    expect(canCompleteToday(record, today, now)).toBe(false);
  });

  it('complete() returns a fact record', () => {
    const record = complete('h1', today, now);
    expect(record.status).toBe('completed');
    expect(record.habitId).toBe('h1');
    expect(record.date).toBe(today);
    expect(record.completedAt).toBe(now.getTime());
  });

  it('builds a singleton record key from (habitId, date)', () => {
    expect(pending('h1', today).id).toBe('h1__2026-05-05');
  });
});

describe('record transitions — T1 retroactive guard', () => {
  const habit = (overrides: Partial<Habit> = {}): Habit => ({
    id: 'h1',
    name: 'Teste',
    icon: 'fire',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: new Date(2026, 3, 1).getTime(), // 2026-04-01
    updatedAt: 0,
    ...overrides,
  });

  const now = new Date(2026, 4, 5, 10, 0, 0); // 2026-05-05 (Tuesday)
  const today = '2026-05-05';
  const yesterday = '2026-05-04';
  const dayBefore = '2026-05-03';

  it('T1: switch off is never retroactive', () => {
    expect(canCompleteRetroactive(habit(), undefined, yesterday, now, false)).toBe(false);
  });

  it('T1: today is never retroactive (normal flow handles it)', () => {
    expect(canCompleteRetroactive(habit(), undefined, today, now, true)).toBe(false);
  });

  it('T1: yesterday scheduled and unrecorded is retroactive', () => {
    expect(canCompleteRetroactive(habit(), undefined, yesterday, now, true)).toBe(true);
  });

  it('T1: day before yesterday scheduled and unrecorded is retroactive', () => {
    expect(canCompleteRetroactive(habit(), undefined, dayBefore, now, true)).toBe(true);
  });

  it('T1: day outside the 2-day window is not retroactive', () => {
    expect(canCompleteRetroactive(habit(), undefined, '2026-05-02', now, true)).toBe(false);
  });

  it('T1: unscheduled yesterday (weekend for weekday habit) is not retroactive', () => {
    const monday = new Date(2026, 4, 4, 10, 0, 0); // 2026-05-04, yesterday = Sunday
    const h = habit({
      frequency: { kind: 'weekdays', schedule: { days: ['mon', 'tue', 'wed', 'thu', 'fri'] } },
    });
    expect(canCompleteRetroactive(h, undefined, '2026-05-03', monday, true)).toBe(false);
  });

  it('T1: day before createdAt is not retroactive', () => {
    const h = habit({ createdAt: new Date(2026, 4, 4, 12, 0, 0).getTime() }); // created 05-04
    expect(canCompleteRetroactive(h, undefined, dayBefore, now, true)).toBe(false);
  });

  it('T1: yesterday already completed is not retroactive (no overwrite)', () => {
    const record = complete('h1', yesterday, now);
    expect(canCompleteRetroactive(habit(), record, yesterday, now, true)).toBe(false);
  });

  it('T1: yesterday already skipped is not retroactive (no retro-skip)', () => {
    const record = skipped('h1', yesterday, now);
    expect(canCompleteRetroactive(habit(), record, yesterday, now, true)).toBe(false);
  });

  it('T1: retroactive value is the habit target for quantitative, undefined for binary', () => {
    expect(retroactiveCompletionValue(habit({ type: 'quantitative', targetValue: 8 }))).toBe(8);
    expect(retroactiveCompletionValue(habit({ type: 'binary' }))).toBeUndefined();
    expect(retroactiveCompletionValue(habit({ type: 'quantitative' }))).toBeUndefined();
  });
});