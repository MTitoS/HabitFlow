function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function weekdayOffsetIndex(date: Date, weekStarts: number): number {
  const day = date.getDay();
  return (day - weekStarts + 7) % 7;
}

export function buildMonthGrid(year: number, monthIndex: number, weekStarts: number = 1): (string | null)[][] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const first = new Date(year, monthIndex, 1);
  const leading = weekdayOffsetIndex(first, weekStarts);

  const flat: (string | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${year}-${pad2(monthIndex + 1)}-${pad2(i + 1)}`),
  ];

  const weeks = Math.ceil(flat.length / 7);
  const rows: (string | null)[][] = [];
  for (let w = 0; w < weeks; w++) {
    const row: (string | null)[] = [];
    for (let c = 0; c < 7; c++) {
      const idx = w * 7 + c;
      row.push(idx < flat.length ? flat[idx] : null);
    }
    rows.push(row);
  }
  return rows;
}