import {
  addDays,
  daysInMonth,
  formatDateKeyPtBR,
  monthStartOf,
  parseDateKey,
  parseDateKeyUtc,
  startOfWeek,
  toDateKey,
  toDateKeyUtc,
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

  it('toDateKeyUtc reads the UTC calendar day regardless of local zone', () => {
    expect(toDateKeyUtc(new Date(Date.UTC(2026, 4, 13)))).toBe('2026-05-13');
    expect(toDateKeyUtc(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-01-01');
  });

  it('roundtrips date keys through UTC midnight', () => {
    expect(parseDateKeyUtc('2026-05-13').toISOString()).toBe('2026-05-13T00:00:00.000Z');
    expect(toDateKeyUtc(parseDateKeyUtc('2026-05-13'))).toBe('2026-05-13');
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

  it('formatDateKeyPtBR formats in pt-BR with padded day', () => {
    expect(formatDateKeyPtBR('2026-05-05')).toBe('05 de mai. de 2026');
    expect(formatDateKeyPtBR('2026-12-25')).toBe('25 de dez. de 2026');
  });
});