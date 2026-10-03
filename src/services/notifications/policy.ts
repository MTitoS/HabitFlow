import { Habit } from '@/domain/habit/model';
import { isScheduled } from '@/domain/habit/isScheduled';
import { todayKey } from '@/domain/date/dateUtils';
import { OPEN } from '@/config/opens';

export interface ReminderJob {
  habitId: string;
  habitName: string;
  time: string;
  dateKey: string;
}

export function remindersForDay(habit: Habit, dateKey: string, now: Date): ReminderJob[] {
  const reminder = habit.reminder;
  if (!reminder?.enabled || reminder.times.length === 0) {
    return [];
  }

  if (!isScheduled(habit, dateKey)) {
    return [];
  }

  if (dateKey !== todayKey(now)) {
    return [];
  }

  const jobs: ReminderJob[] = [];
  for (const time of reminder.times) {
    if (time > currentTime(now) || OPEN.LATE_NOTIFICATION) {
      jobs.push({
        habitId: habit.id,
        habitName: habit.name,
        time,
        dateKey,
      });
    }
  }

  return jobs;
}

function currentTime(now: Date): string {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}