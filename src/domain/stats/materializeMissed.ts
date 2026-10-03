import { toDateKey } from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';
import { HabitRecord, RecordStatus } from '@/domain/record/model';

export type ViewStatus = RecordStatus | null;

export function statusForView(
  habit: Habit,
  records: HabitRecord[],
  dateKey: string,
  now: Date,
): ViewStatus {
  const record = records.find((r) => r.habitId === habit.id && r.date === dateKey);

  if (record) {
    if (record.status === 'pending') return null;
    return record.status;
  }

  if (!isScheduled(habit, dateKey)) return null;

  const today = toDateKey(now);
  if (dateKey < today) return 'missed';
  return 'pending';
}