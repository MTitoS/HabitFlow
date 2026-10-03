import { OPEN } from '@/config/opens';
import { HabitRecord } from '@/domain/record/model';

export function completionRate(records: HabitRecord[], scheduledDates: string[]): number {
  if (scheduledDates.length === 0) return 0;

  const scheduled = new Set(scheduledDates);
  let completed = 0;

  for (const record of records) {
    if (record.status === 'completed' && scheduled.has(record.date)) {
      completed += 1;
    }
  }

  if (OPEN.COMPLETION_RATE_SKIP === 'counts-as-completed') {
    for (const record of records) {
      if (record.status === 'skipped' && scheduled.has(record.date)) {
        completed += 1;
      }
    }
  }

  return completed / scheduledDates.length;
}