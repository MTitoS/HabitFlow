export type RecordStatus = 'pending' | 'completed' | 'skipped' | 'missed';

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  status: RecordStatus;
  value?: number;
  completedAt?: number;
  skippedAt?: number;
}

export function recordKey(habitId: string, date: string): string {
  return `${habitId}__${date}`;
}

export function indexRecords(records: HabitRecord[]): Map<string, Map<string, HabitRecord>> {
  const byHabit = new Map<string, Map<string, HabitRecord>>();
  for (const record of records) {
    let dayMap = byHabit.get(record.habitId);
    if (!dayMap) {
      dayMap = new Map<string, HabitRecord>();
      byHabit.set(record.habitId, dayMap);
    }
    dayMap.set(record.date, record);
  }
  return byHabit;
}

export const PERSISTED_STATUSES: RecordStatus[] = ['completed', 'skipped'];