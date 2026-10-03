import { addDays, compareDateKeys, monthStartOf, weekdayOf, weekStartOf } from '@/domain/date/dateUtils';
import { Habit } from '@/domain/habit/model';
import { OPEN } from '@/config/opens';
import { scheduledDateKeysForPeriod } from '@/domain/habit/frequencyPolicy';

export function isScheduled(habit: Habit, dateKey: string): boolean {
  const { kind, schedule } = habit.frequency;

  switch (kind) {
    case 'daily':
      return true;
    case 'weekdays': {
      const days = schedule.days ?? [];
      if (days.length === 0) return true;
      return days.includes(weekdayOf(dateKey));
    }
    case 'x_per_week': {
      const start = weekStartOf(dateKey, OPEN.FREQ_WEEK_STARTS);
      return scheduledDateKeysForPeriod(habit, start).includes(dateKey);
    }
    case 'x_per_month': {
      const start = monthStartOf(dateKey);
      return scheduledDateKeysForPeriod(habit, start).includes(dateKey);
    }
    default:
      return false;
  }
}

export function scheduledKeysInRange(habit: Habit, fromDateKey: string, toDateKey: string): string[] {
  const keys: string[] = [];
  for (let d = fromDateKey; compareDateKeys(d, toDateKey) <= 0; d = addDays(d, 1)) {
    if (isScheduled(habit, d)) keys.push(d);
  }
  return keys;
}