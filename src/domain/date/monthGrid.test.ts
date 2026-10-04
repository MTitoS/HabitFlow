import { buildMonthGrid } from '@/domain/date/monthGrid';
import { toDateKey, weekdayOf, WEEKDAY_KEYS } from '@/domain/date/dateUtils';

function flatten(rows: (string | null)[][]): (string | null)[] {
  return rows.flat();
}

function colOf(dateKey: string, rows: (string | null)[][], weekStarts: number): number {
  for (const row of rows) {
    const idx = row.indexOf(dateKey);
    if (idx >= 0) return idx;
  }
  throw new Error(`${dateKey} not found in grid`);
}

function expectMonthShape(year: number, monthIndex: number, expectedWeeks: number, weekStarts = 1) {
  const rows = buildMonthGrid(year, monthIndex, weekStarts);
  const flat = flatten(rows);
  const dim = new Date(year, monthIndex + 1, 0).getDate();
  const realDays = flat.filter((c): c is string => c !== null);
  const unique = new Set(realDays);

  expect(rows.length).toBe(expectedWeeks);
  for (const row of rows) expect(row.length).toBe(7);
  expect(flat.length).toBe(7 * expectedWeeks);
  expect(realDays.length).toBe(dim);
  expect(unique.size).toBe(dim);
};

describe('buildMonthGrid', () => {
  it('has all 7 weekday columns and no dropped days (Dec/2026)', () => {
    const rows = buildMonthGrid(2026, 11, 1);
    expectMonthShape(2026, 11, 5);
    expect(colOf('2026-12-01', rows, 1)).toBe((weekdayOf('2026-12-01') === 'mon' ? 0 : 1)); // 1st = Tue
    expect(colOf('2026-12-05', rows, 1)).toBe(5); // Sat column exists
    expect(colOf('2026-12-31', rows, 1)).toBe(3); // 31/12 = Quinta (thu)
    expect(weekdayOf('2026-12-31')).toBe('thu');
  });

  it('places every day on its correct Mon-first weekday column', () => {
    const rows = buildMonthGrid(2026, 11, 1);
    for (const row of rows) {
      for (const cell of row) {
        if (!cell) continue;
        const expectedCol = (WEEKDAY_KEYS.indexOf(weekdayOf(cell)) - 1 + 7) % 7;
        expect(colOf(cell, rows, 1)).toBe(expectedCol);
      }
    }
  });

  it('handles month starting on Sunday (Mar/2026, 6 weeks)', () => {
    expectMonthShape(2026, 2, 6);
    expect(colOf('2026-03-01', buildMonthGrid(2026, 2), 1)).toBe(6); // Sunday = last column
    expect(buildMonthGrid(2026, 2).length).toBe(6);
  });

  it('handles month starting on Saturday with 6 weeks (Aug/2026)', () => {
    const rows = buildMonthGrid(2026, 7, 1);
    expectMonthShape(2026, 7, 6);
    expect(colOf('2026-08-01', rows, 1)).toBe(5); // Sat = 6th column
  });

  it('handles month starting on Friday (May/2026, 5 weeks)', () => {
    expectMonthShape(2026, 4, 5);
    expect(colOf('2026-05-01', buildMonthGrid(2026, 4), 1)).toBe(4);
  });

  it('cell count is always 7 * weeks', () => {
    for (const [y, m, weeks] of [[2026, 11, 5], [2026, 2, 6], [2026, 7, 6], [2026, 4, 5]] as const) {
      const flat = flatten(buildMonthGrid(y, m));
      expect(flat.length).toBe(7 * weeks);
    }
  });

  it('exports keys compatible with toDateKey', () => {
    const rows = buildMonthGrid(2026, 11, 1);
    expect(rows.some((r) => r.includes('2026-12-31'))).toBe(true);
    expect(colOf('2026-12-01', rows, 1)).toBe(1);
    expect(colOf('2026-12-31', rows, 1)).toBe(colOf(toDateKey(new Date(2026, 11, 31)), rows, 1));
  });
});