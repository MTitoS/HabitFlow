export const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export type Weekday = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  sun: 'Dom',
  mon: 'Seg',
  tue: 'Ter',
  wed: 'Qua',
  thu: 'Qui',
  fri: 'Sex',
  sat: 'Sáb',
};

export const WEEKDAY_LABELS_FULL: Record<Weekday, string> = {
  sun: 'Domingo',
  mon: 'Segunda',
  tue: 'Terça',
  wed: 'Quarta',
  thu: 'Quinta',
  fri: 'Sexta',
  sat: 'Sábado',
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(dateKey: string, days: number): string {
  const d = parseDateKey(dateKey);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function weekdayOf(dateKey: string): Weekday {
  const d = parseDateKey(dateKey);
  return WEEKDAY_KEYS[d.getDay()];
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function monthStartOf(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`;
}

export function startOfWeek(date: Date, weekStarts: number): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d.getDay() - weekStarts + 7) % 7;
  d.setDate(d.getDate() - diff);
  return toDateKey(d);
}

export function weekStartOf(dateKey: string, weekStarts: number): string {
  return startOfWeek(parseDateKey(dateKey), weekStarts);
}

export function weekKey(date: Date, weekStarts: number): string {
  return startOfWeek(date, weekStarts);
}

export function todayKey(now: Date): string {
  return toDateKey(now);
}

export function isInPast(dateKey: string, today: string): boolean {
  return dateKey < today;
}

export function compareDateKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}