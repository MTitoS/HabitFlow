import {
  addDays,
  compareDateKeys,
  monthKey,
  monthStartOf,
  toDateKey,
  todayKey,
} from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';
import { HabitRecord, indexRecords } from '@/domain/record/model';

export interface OverallStreakResult {
  current: number;
  best: number;
}

export type MonthDayState = 'conquered' | 'partial' | 'neutral';

function activeHabits(habits: Habit[]): Habit[] {
  return habits.filter((h) => !h.archivedAt);
}

function scheduledOn(active: Habit[], dateKey: string): Habit[] {
  return active.filter((h) => isScheduled(h, dateKey));
}

export function isConqueredDay(habits: Habit[], records: HabitRecord[], dateKey: string): boolean {
  const scheduled = scheduledOn(activeHabits(habits), dateKey);
  if (scheduled.length === 0) return false;

  const byHabit = indexRecords(records);
  return scheduled.every((habit) => {
    const status = byHabit.get(habit.id)?.get(dateKey)?.status;
    return status === 'completed' || status === 'skipped';
  });
}

export type CalendarDayMark = 'conquered' | 'partial' | 'skip' | 'pending';

export interface CalendarDayInfo {
  dateKey: string;
  mark: CalendarDayMark;
  scheduled: number;
  done: number;
  skipped: number;
}

export function calendarDayInfo(
  habits: Habit[],
  records: HabitRecord[],
  dateKey: string,
): CalendarDayInfo {
  const active = activeHabits(habits);
  const scheduled = scheduledOn(active, dateKey);
  if (scheduled.length === 0) {
    return { dateKey, mark: 'pending', scheduled: 0, done: 0, skipped: 0 };
  }

  const byHabit = indexRecords(records);
  let done = 0;
  let skipped = 0;
  for (const habit of scheduled) {
    const status = byHabit.get(habit.id)?.get(dateKey)?.status;
    if (status === 'completed') done += 1;
    else if (status === 'skipped') skipped += 1;
  }

  const mark: CalendarDayMark = isConqueredDay(active, records, dateKey)
    ? 'conquered'
    : done > 0
      ? 'partial'
      : skipped > 0
        ? 'skip'
        : 'pending';

  return { dateKey, mark, scheduled: scheduled.length, done, skipped };
}

function lowerBoundOf(active: Habit[], records: HabitRecord[], today: string): string {
  let lowerBound = today;
  for (const habit of active) {
    const created = toDateKey(new Date(habit.createdAt));
    if (compareDateKeys(created, lowerBound) < 0) lowerBound = created;
  }
  const activeIds = new Set(active.map((h) => h.id));
  for (const record of records) {
    if (!activeIds.has(record.habitId)) continue;
    if (compareDateKeys(record.date, lowerBound) < 0) lowerBound = record.date;
  }
  return lowerBound;
}

function countConquered(active: Habit[], records: HabitRecord[], dateKey: string): number {
  return records.filter(
    (r) => r.status === 'completed' && r.date === dateKey && active.some((h) => h.id === r.habitId),
  ).length;
}

function scanCurrent(active: Habit[], records: HabitRecord[], today: string, lowerBound: string): number {
  let run = 0;
  let day = today;

  while (compareDateKeys(day, lowerBound) >= 0) {
    if (scheduledOn(active, day).length === 0) {
      day = addDays(day, -1);
      continue;
    }
    if (isConqueredDay(active, records, day)) {
      run += 1;
      day = addDays(day, -1);
      continue;
    }
    if (day === today) {
      // today still open: do not extend, do not reset
      day = addDays(day, -1);
      continue;
    }
    // past scheduled day with pending/missed/missing record: reset and stop
    break;
  }

  return run;
}

function scanBest(active: Habit[], records: HabitRecord[], today: string, lowerBound: string): number {
  let run = 0;
  let maxRun = 0;
  let day = today;

  while (compareDateKeys(day, lowerBound) >= 0) {
    if (scheduledOn(active, day).length === 0) {
      day = addDays(day, -1);
      continue;
    }
    if (isConqueredDay(active, records, day)) {
      run += 1;
      if (run > maxRun) maxRun = run;
    } else if (day !== today) {
      run = 0;
    }
    day = addDays(day, -1);
  }

  return maxRun;
}

export function computeOverallStreaks(
  habits: Habit[],
  records: HabitRecord[],
  now: Date,
): OverallStreakResult {
  const active = activeHabits(habits);
  const today = todayKey(now);
  if (active.length === 0) return { current: 0, best: 0 };

  const lowerBound = lowerBoundOf(active, records, today);
  if (compareDateKeys(lowerBound, today) > 0) return { current: 0, best: 0 };

  return {
    current: scanCurrent(active, records, today, lowerBound),
    best: scanBest(active, records, today, lowerBound),
  };
}

export function monthDayStatus(
  habits: Habit[],
  records: HabitRecord[],
  now: Date,
): { dateKey: string; state: MonthDayState }[] {
  const active = activeHabits(habits);
  const start = monthStartOf(todayKey(now));
  const month = monthKey(start);
  const first = new Date(Number(start.slice(0, 4)), Number(start.slice(5, 7)) - 1);
  const length = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();

  const statuses: { dateKey: string; state: MonthDayState }[] = [];
  for (let i = 0; i < length; i += 1) {
    const dateKey = addDays(start, i);
    if (monthKey(dateKey) !== month) continue;

    let state: MonthDayState = 'neutral';
    if (scheduledOn(active, dateKey).length > 0) {
      if (isConqueredDay(active, records, dateKey)) state = 'conquered';
      else if (countConquered(active, records, dateKey) > 0) state = 'partial';
    }
    statuses.push({ dateKey, state });
  }

  return statuses;
}
