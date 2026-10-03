import { daysInMonth, monthStartOf, parseDateKey, toDateKey } from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';

export function uniformOffsets(count: number, periodLength: number): number[] {
  const safeCount = Math.max(1, Math.min(count, periodLength));
  const offsets: number[] = [];
  for (let i = 0; i < safeCount; i += 1) {
    offsets.push(Math.floor((i * periodLength) / safeCount));
  }
  return offsets;
}

export function scheduledDateKeysForPeriod(habit: Habit, periodStartKey: string): string[] {
  const { kind, schedule } = habit.frequency;

  if (kind === 'x_per_week') {
    const start = parseDateKey(periodStartKey);
    const periodLength = 7;
    return uniformOffsets(schedule.countPerPeriod ?? 1, periodLength).map(
      (offset) =>
        toDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset)),
    );
  }

  if (kind === 'x_per_month') {
    const startKey = monthStartOf(periodStartKey);
    const start = parseDateKey(startKey);
    const periodLength = daysInMonth(start.getFullYear(), start.getMonth());
    return uniformOffsets(schedule.countPerPeriod ?? 1, periodLength).map(
      (offset) =>
        toDateKey(new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset)),
    );
  }

  return [periodStartKey];
}