import { canCompleteToday, complete, pending, skipped } from '@/domain/record/transitions';

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