import {
  addDays,
  daysInMonth,
  monthStartOf,
  parseDateKey,
  startOfWeek,
  toDateKey,
  weekdayOf,
  weekStartOf,
} from '@/domain/date/dateUtils';

describe('dateUtils', () => {
  it('roundtrips date keys', () => {
    const d = new Date(2026, 4, 7);
    expect(toDateKey(d)).toBe('2026-05-07');
    const back = parseDateKey('2026-05-07');
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(4);
    expect(back.getDate()).toBe(7);
  });

  it('pads month and day', () => {
    expect(toDateKey(new Date(2026, 0, 3))).toBe('2026-01-03');
  });

  it('addDays crosses month boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDays('2026-02-01', -1)).toBe('2026-01-31');
  });

  it('starts week on Monday by default', () => {
    const wed = new Date(2026, 4, 6);
    expect(startOfWeek(wed, 1)).toBe('2026-05-04');
    const sun = new Date(2026, 4, 10);
    expect(startOfWeek(sun, 1)).toBe('2026-05-04');
  });

  it('weekStartOf/weekdayOf agree', () => {
    expect(weekStartOf('2026-05-06', 1)).toBe('2026-05-04');
    expect(weekdayOf('2026-05-04')).toBe('mon');
    expect(weekdayOf('2026-04-26')).toBe('sun');
  });

  it('daysInMonth is correct', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2026, 0)).toBe(31);
  });

  it('monthStartOf keeps month prefix', () => {
    expect(monthStartOf('2026-05-06')).toBe('2026-05-01');
  });
});