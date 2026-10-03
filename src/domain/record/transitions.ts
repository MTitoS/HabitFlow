import { toDateKey } from '@/domain/date/dateUtils';
import { HabitRecord, recordKey, RecordStatus } from '@/domain/record/model';

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