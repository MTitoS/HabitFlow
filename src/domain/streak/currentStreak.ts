import { addDays, compareDateKeys, toDateKey } from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';
import { HabitRecord, indexRecords } from '@/domain/record/model';

export interface StreakResult {
  current: number;
  best: number;
}

export function computeStreaks(habit: Habit, records: HabitRecord[], now: Date): StreakResult {
  const byDate = indexRecords(records).get(habit.id);
  const today = toDateKey(now);

  let lowerBound = habit.createdAt ? toDateKey(new Date(habit.createdAt)) : today;
  if (byDate && byDate.size > 0) {
    const first = [...byDate.keys()].sort()[0];
    if (compareDateKeys(first, lowerBound) < 0) lowerBound = first;
  }

  if (compareDateKeys(lowerBound, today) > 0) return { current: 0, best: 0 };

  const current = scanCurrent(habit, byDate, today, lowerBound);
  const best = scanBest(habit, byDate, today, lowerBound);

  return { current, best };
}

function scanCurrent(
  habit: Habit,
  byDate: Map<string, HabitRecord> | undefined,
  today: string,
  lowerBound: string,
): number {
  let run = 0;
  let broke = false;
  let day = today;

  while (compareDateKeys(day, lowerBound) >= 0) {
    if (!isScheduled(habit, day)) {
      day = addDays(day, -1);
      continue;
    }

    const record = byDate?.get(day);

    if (record?.status === 'completed') {
      run += 1;
    } else if (record?.status === 'skipped') {
      // skip: neutral, does not break streak
    } else if (day === today) {
      // pending today: streak not extended, not broken
      break;
    } else {
      // scheduled day without completion (missed): reset and stop
      broke = true;
      break;
    }

    day = addDays(day, -1);
  }

  if (broke) return run;
  return run;
}

function scanBest(
  habit: Habit,
  byDate: Map<string, HabitRecord> | undefined,
  today: string,
  lowerBound: string,
): number {
  let run = 0;
  let maxRun = 0;
  let day = today;

  while (compareDateKeys(day, lowerBound) >= 0) {
    if (!isScheduled(habit, day)) {
      day = addDays(day, -1);
      continue;
    }

    const record = byDate?.get(day);

    if (record?.status === 'completed') {
      run += 1;
      if (run > maxRun) maxRun = run;
    } else if (record?.status === 'skipped') {
      // neutral
    } else if (day !== today) {
      run = 0;
    }

    day = addDays(day, -1);
  }

  return maxRun;
}

export function currentStreak(habit: Habit, records: HabitRecord[], now: Date): number {
  return computeStreaks(habit, records, now).current;
}

export function bestStreak(habit: Habit, records: HabitRecord[], now: Date): number {
  return computeStreaks(habit, records, now).best;
}