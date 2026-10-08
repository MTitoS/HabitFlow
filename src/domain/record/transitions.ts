import { addDays, toDateKey } from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';
import { HabitRecord, recordKey, RecordStatus } from '@/domain/record/model';
import { RETROACTIVE_WINDOW_DAYS } from '@/config/opens';

export function isPending(record?: HabitRecord): boolean {
  return record !== undefined && record.status === 'pending';
}

export const PERSISTED: RecordStatus[] = ['completed', 'skipped'];

export function readableStatus(record?: HabitRecord): RecordStatus {
  if (!record) return 'pending';
  return record.status;
}

export function canCompleteToday(record: HabitRecord | undefined, dateKey: string, now: Date): boolean {
  if (toDateKey(now) !== dateKey) return false;
  if (!record) return true;
  return record.status === 'pending';
}

export function canEditToday(record: HabitRecord | undefined, dateKey: string, now: Date): boolean {
  return canCompleteToday(record, dateKey, now);
}

export function complete(habitId: string, dateKey: string, now: Date, value?: number): HabitRecord {
  return {
    id: recordKey(habitId, dateKey),
    habitId,
    date: dateKey,
    status: 'completed',
    value,
    completedAt: now.getTime(),
  };
}

export function skipped(habitId: string, dateKey: string, now: Date): HabitRecord {
  return {
    id: recordKey(habitId, dateKey),
    habitId,
    date: dateKey,
    status: 'skipped',
    skippedAt: now.getTime(),
  };
}

export function pending(habitId: string, dateKey: string): HabitRecord {
  return {
    id: recordKey(habitId, dateKey),
    habitId,
    date: dateKey,
    status: 'pending',
  };
}

export function isPersistedStatus(status: RecordStatus): boolean {
  return status === 'completed' || status === 'skipped';
}

export function canCompleteRetroactive(
  habit: Habit,
  record: HabitRecord | undefined,
  dateKey: string,
  now: Date,
  enabled: boolean,
): boolean {
  if (!enabled) return false;
  const today = toDateKey(now);
  if (dateKey === today) return false;
  const min = addDays(today, -RETROACTIVE_WINDOW_DAYS);
  if (dateKey < min) return false;
  if (!isScheduled(habit, dateKey)) return false;
  if (record && (record.status === 'completed' || record.status === 'skipped')) return false;
  return true;
}

export function retroactiveCompletionValue(habit: Habit): number | undefined {
  return habit.type === 'quantitative' ? habit.targetValue : undefined;
}